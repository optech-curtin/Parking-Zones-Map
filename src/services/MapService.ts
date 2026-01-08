/* eslint-disable @typescript-eslint/no-explicit-any */
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import esriConfig from "@arcgis/core/config";
import { CacheService } from './CacheService';
import { ARCGIS_CONFIG, ERROR_MESSAGES } from '../constants';
import { logger } from '../utils/logger';

const PARKING_LAYER_URL = "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/4";

// Feature attribute interfaces
interface BayFeatureAttributes {
  OBJECTID: number;
  parkinglot: string;
  baytype: string;
  [key: string]: string | number; // For other potential attributes
}

interface ParkingFeatureAttributes {
  Zone: string;
  status: string;
  isMonitored: string;
  [key: string]: string | number; // For other potential attributes
}

// Error types
class MapServiceError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'MapServiceError';
  }
}

class FeatureQueryError extends MapServiceError {
  constructor(message: string, public readonly layerId: string, cause?: Error) {
    super(message, cause);
    this.name = 'FeatureQueryError';
  }
}

class LayerInitializationError extends MapServiceError {
  constructor(message: string, public readonly layerId: string, cause?: Error) {
    super(message, cause);
    this.name = 'LayerInitializationError';
  }
}

/**
 * Interface to represent the count details for a parking lot.
 */
export interface ParkingLotCount {
  parkingLot: string;
  total: number;
  bayCounts: {
    [bayType: string]: number;
  };
}

export interface BayTypeCount {
  type: string;
  count: number;
}

export class MapService {
  private view: MapView | null = null;
  private parkingLayer: FeatureLayer | null = null;
  private underBaysLayer: FeatureLayer | null = null;
  private baysLayer: FeatureLayer | null = null;
  private featuresLoaded = false;
  private cachedFeatures: { [key: string]: __esri.Graphic[] } = {};
  private cachedTotalCounts: { [key: string]: number } = {};
  private cachedMonitoredCounts: { [key: string]: number } = {};
  private cachedIndividualBayClosedCounts: { [key: string]: number } = {};
  private cachedParkingLotCounts: { [key: string]: BayTypeCount[] } = {};
  private cacheService: CacheService;
  private readonly PAGE_SIZE = 1000;
  private layerLoadPromises: Promise<void>[] = [];
  private readonly MAX_RETRIES = 2; // Reduced from 3 to 2 to fail faster
  private readonly RETRY_DELAY_BASE = 1000; // 1 second base delay

  constructor() {
    const portalUrl = process.env.NEXT_PUBLIC_ARCGIS_PORTAL_URL;
    if (!portalUrl) {
      throw new MapServiceError('ARCGIS_PORTAL_URL environment variable is not set');
    }
    esriConfig.portalUrl = portalUrl;
    this.cacheService = CacheService.getInstance();
  }

  // Helper to check if an error is retryable (504, 503, network errors)
  // CORS errors are NOT retryable - they will always fail
  private isRetryableError(error: any): boolean {
    if (!error) return false;
    
    // CORS errors are never retryable - they indicate a configuration issue
    const message = String(error.message || error.toString() || '').toLowerCase();
    if (message.includes('cors') || 
        message.includes('cross-origin') || 
        message.includes('access-control-allow-origin')) {
      logger.warn('CORS error detected - not retrying', 'MapService');
      return false;
    }
    
    // Check for HTTP status codes (but not CORS-related ones)
    const status = error.status || error.statusCode || (error.response?.status);
    if (status === 504 || status === 503 || status === 502 || status === 429) {
      // Only retry if it's not a CORS issue
      return true;
    }
    
    // Check for network errors (but not CORS)
    if (message.includes('timeout') || 
        message.includes('network') || 
        message.includes('failed to fetch')) {
      return true;
    }
    
    // Check for ArcGIS-specific timeout errors
    if (error.name === 'timeout' || error.type === 'timeout') {
      return true;
    }
    
    return false;
  }

  // Retry wrapper with exponential backoff
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // If this is the last attempt or error is not retryable, throw
        if (attempt === maxRetries || !this.isRetryableError(error)) {
          throw error;
        }
        
        // Calculate exponential backoff delay
        const delay = this.RETRY_DELAY_BASE * Math.pow(2, attempt);
        logger.warn(
          `${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`,
          'MapService',
          error instanceof Error ? error : undefined
        );
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  // Helper function to check if a parking lot is temporary or excluded
  isTemporaryParkingLot(parkingLot: string): boolean {
    const trimmed = parkingLot.trim();
    
    // Check TCP pattern (TCP1, TCP2, etc.)
    const tempPattern = /^TCP\d+$/i;
    if (tempPattern.test(trimmed)) {
      logger.debug(`isTemporaryParkingLot("${parkingLot}") = true (TCP pattern)`, 'MapService');
      return true;
    }
    
    // Check excluded parking lots (PT1, PT2, PT3, PT4, PT5, PT7)
    const excludedLots = ['PT1', 'PT2', 'PT3', 'PT4', 'PT5', 'PT7'];
    const isExcluded = excludedLots.includes(trimmed);
    if (isExcluded) {
      logger.debug(`isTemporaryParkingLot("${parkingLot}") = true (excluded parking lot)`, 'MapService');
      return true;
    }
    
    logger.debug(`isTemporaryParkingLot("${parkingLot}") = false`, 'MapService');
    return false;
  }

  // Helper function to normalize bay types - groups Reserved_* variants under Reserved
  normalizeBayType(bayType: string): string {
    if (!bayType) return 'Unknown';
    const trimmed = bayType.trim();
    
    // Normalize Reserved_* variants to Reserved for counting
    if (trimmed.toLowerCase().startsWith('reserved_')) {
      return 'Reserved';
    }
    
    return this.cleanString(bayType);
  }

  // Helper function to format bay type for display - converts Reserved_* to Reserved *
  formatBayTypeForDisplay(bayType: string): string {
    if (!bayType) return 'Unknown';
    const trimmed = bayType.trim();
    
    // Format Reserved_* variants for display (replace underscore with space)
    if (trimmed.toLowerCase().startsWith('reserved_')) {
      return trimmed.replace(/_/g, ' ');
    }
    
    return trimmed;
  }

  // Helper function to clean strings
  cleanString(str: string): string {
    if (!str) return 'Unknown';
    
    // Special handling for Green and Yellow to preserve exact matches
    if (str.trim() === 'Green' || str.trim() === 'Yellow') {
      return str.trim();
    }

    return str
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces and other invisible characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
      .replace(/[^a-zA-Z0-9]/g, '') // Remove all non-alphanumeric characters
      .trim();
  }

  // Optimized query with better caching and error handling
  private async queryFeaturesWithPagination(
    layer: FeatureLayer,
    query: __esri.Query,
    pageSize: number = this.PAGE_SIZE
  ): Promise<__esri.Graphic[]> {
    const cacheKey = `query_${layer.id}_${JSON.stringify(query)}`;
    const cachedResult = this.cacheService.get<__esri.Graphic[]>(cacheKey);
    if (cachedResult) {
      logger.debug(`Cache hit for query: ${cacheKey}`, 'MapService');
      return cachedResult;
    }

    let allFeatures: __esri.Graphic[] = [];
    let hasMore = true;
    let start = 0;

    try {
      while (hasMore) {
        query.start = start;
        query.num = pageSize;
        
        // Use retry logic for each page query
        const result = await this.retryWithBackoff(
          async () => {
            const queryResult = await layer.queryFeatures(query);
            if (!queryResult.features) {
              throw new FeatureQueryError(
                `No features returned from query for layer ${layer.id}`,
                layer.id
              );
            }
            return queryResult;
          },
          `Query page ${start / pageSize + 1} for layer ${layer.id}`
        );
        
        allFeatures = [...allFeatures, ...result.features];
        
        if (result.features.length < pageSize) {
          hasMore = false;
        } else {
          start += pageSize;
        }
      }

      this.cacheService.set(cacheKey, allFeatures);
      logger.debug(`Cached query result: ${cacheKey}`, 'MapService');
      return allFeatures;
    } catch (error) {
      logger.error(`Query failed for layer ${layer.id} after retries`, 'MapService', error instanceof Error ? error : undefined);
      throw new FeatureQueryError(
        `Failed to query features from layer ${layer.id}`,
        layer.id,
        error instanceof Error ? error : undefined
      );
    }
  }

  // Update the existing queryAllFeatures method to use the new pagination
  private async queryAllFeatures(layer: FeatureLayer): Promise<__esri.Graphic[]> {
    try {
      const query = layer.createQuery();
      query.returnGeometry = false;
      query.outFields = ['*'];
      query.where = '1=1';
      
      return await this.queryFeaturesWithPagination(layer, query);
    } catch (error) {
      throw new FeatureQueryError(
        `Failed to query features from layer ${layer.id}`,
        layer.id,
        error instanceof Error ? error : undefined
      );
    }
  }

  async initializeMap(container: HTMLDivElement): Promise<MapView> {
    try {
      const webmapId = process.env.NEXT_PUBLIC_ARCGIS_WEBMAP_ID;
      if (!webmapId) {
        throw new MapServiceError('ARCGIS_WEBMAP_ID environment variable is not set');
      }

      logger.info('Initializing map with optimizations', 'MapService');

      // Create the map view with performance optimizations
      const view = new MapView({
        container,
        center: ARCGIS_CONFIG.DEFAULT_CENTER,
        zoom: ARCGIS_CONFIG.DEFAULT_ZOOM,
        popupEnabled: false,
        // Performance optimizations
        constraints: {
          rotationEnabled: false, // Disable rotation for better performance
          snapToZoom: false, // Disable snap to zoom for smoother zooming
        },
        // Optimize view state
        ui: {
          components: [] // Remove default UI components for better performance
        },
        // Prevent feature unloading during navigation
        navigation: {
          gamepad: {
            enabled: false
          }
        },
        // Optimize for persistence
        highlightOptions: {
          color: [255, 255, 0, 0.4],
          haloOpacity: 0.9,
          fillOpacity: 0.2
        }
      });

      // Create and load the webmap
      const webmap = new WebMap({
        portalItem: {
          id: webmapId
        }
      });

      // Wait for the webmap to load
      await webmap.load();

      // Set the map to the view
      view.map = webmap;

      // Wait for the view to load
      await view.when();

      // Configure all webmap layers to prevent unloading
      this.configureWebMapLayers(view);

      // Initialize layers in parallel for better performance
      await Promise.all([
        this.initializeParkingLayer(view),
        this.initializeBayLayers(view)
      ]);

      // Apply comprehensive feature unloading prevention to all layers
      this.preventFeatureUnloading(view);

      // Apply view optimizations after layers are loaded
      this.optimizeView(view);
      
      // Setup zoom optimization
      this.setupZoomOptimization(view);

      this.view = view;
      logger.info('Map initialized successfully', 'MapService');
      return view;
    } catch (error) {
      logger.error(ERROR_MESSAGES.MAP_INITIALIZATION, 'MapService', error instanceof Error ? error : undefined);
      throw new MapServiceError(
        'Failed to initialize map',
        error instanceof Error ? error : undefined
      );
    }
  }

  // Optimize view to prevent layer unloading
  private optimizeView(view: MapView): void {
    try {
      logger.info('Optimizing view with basic settings', 'MapService');
      
      // Set basic view properties
      view.constraints = {
        ...view.constraints,
        rotationEnabled: false, // Disable rotation
        snapToZoom: false // Disable snap to zoom
      };
      
      logger.info('View optimization completed', 'MapService');
    } catch (error) {
      logger.error('Failed to optimize view', 'MapService', error instanceof Error ? error : undefined);
    }
  }

  private async initializeParkingLayer(view: MapView): Promise<void> {
    try {
      logger.debug('Initializing parking layer', 'MapService');

      // Get the existing parking layer from the WebMap
      if (!view.map) {
        throw new LayerInitializationError('Map is not initialized on the view', 'parkingLayer');
      }
      const parkingLayer = view.map.layers.find(layer => {
        if (!(layer instanceof FeatureLayer)) return false;
        const featureLayer = layer as FeatureLayer;
        return typeof featureLayer.url === 'string' && featureLayer.url.startsWith(PARKING_LAYER_URL);
      }) as FeatureLayer;

      logger.debug(`Found parking layer in webmap: ${parkingLayer ? 'Yes' : 'No'}`, 'MapService');
      if (parkingLayer) {
        logger.debug(`Parking layer URL: ${parkingLayer.url}`, 'MapService');
        logger.debug(`Parking layer ID: ${parkingLayer.id}`, 'MapService');
      }

      if (!parkingLayer) {
        // Create a new parking layer if not found in WebMap
        logger.debug('Creating new parking layer', 'MapService');
        const newParkingLayer = new FeatureLayer({
          url: PARKING_LAYER_URL,
          outFields: ['Zone', 'status', 'isMonitored'],
          // Performance optimizations
          visible: true,
          // Prevent unloading when out of view
          persistenceEnabled: true,
          // Optimize rendering
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-fill",
              color: [0, 0, 0, 0.1],
              outline: {
                color: [0, 0, 0, 0.5],
                width: 1
              }
            }
          }
        });
        
        try {
          await newParkingLayer.load();
          view.map.add(newParkingLayer);
          newParkingLayer.id = "parkingLayer";
          this.parkingLayer = newParkingLayer;
          logger.debug('New parking layer created and added to map', 'MapService');
        } catch (error) {
          throw new LayerInitializationError(
            'Failed to load new parking layer',
            'parkingLayer',
            error instanceof Error ? error : undefined
          );
        }
        return;
      }

      try {
        await parkingLayer.load();
        parkingLayer.id = "parkingLayer";
        parkingLayer.outFields = ['Zone', 'status', 'isMonitored'];
        // Apply performance optimizations and prevent unloading
        parkingLayer.persistenceEnabled = true;
        this.parkingLayer = parkingLayer;
        logger.debug('Existing parking layer loaded and configured', 'MapService');
      } catch (error) {
        throw new LayerInitializationError(
          'Failed to load existing parking layer',
          'parkingLayer',
          error instanceof Error ? error : undefined
        );
      }
    } catch (error) {
      if (error instanceof LayerInitializationError) {
        throw error;
      }
      throw new LayerInitializationError(
        'Failed to initialize parking layer',
        'parkingLayer',
        error instanceof Error ? error : undefined
      );
    }
  }

  private async initializeBayLayers(view: MapView): Promise<void> {
    try {
      logger.debug('Initializing bay layers', 'MapService');

      if (!view.map) {
        throw new LayerInitializationError('Map is not initialized on the view', 'baysLayer');
      }

      // Create the bay layers with enhanced performance optimizations
      this.underBaysLayer = new FeatureLayer({
        url: "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays_Under/FeatureServer/0",
        outFields: ['*'],
        // Performance optimizations
        visible: true,
        // Enhanced unloading prevention
        persistenceEnabled: true,
        renderer: {
          type: "unique-value",
          field: "status",
          uniqueValueInfos: [
            {
              value: "Closed",
              symbol: {
                type: "simple-fill",
                color: [255, 0, 0, 0.7], // Red overlay for closed bays
                outline: {
                  color: [255, 0, 0, 1],
                  width: 2
                }
              }
            }
          ],
          defaultSymbol: {
            type: "simple-fill",
            color: [0, 0, 0, 0], // Transparent for open bays
            outline: {
              color: [128, 128, 128, 0.3],
              width: 0.5
            }
          }
        }
      });

      this.baysLayer = new FeatureLayer({
        url: "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays/FeatureServer/0",
        outFields: ['*'],
        // Performance optimizations
        visible: true,
        // Enhanced unloading prevention
        persistenceEnabled: true,
        renderer: {
          type: "unique-value",
          field: "status",
          uniqueValueInfos: [
            {
              value: "Closed",
              symbol: {
                type: "simple-fill",
                color: [255, 0, 0, 0.7], // Red overlay for closed bays
                outline: {
                  color: [255, 0, 0, 1],
                  width: 2
                }
              }
            }
          ],
          defaultSymbol: {
            type: "simple-fill",
            color: [0, 0, 0, 0], // Transparent for open bays
            outline: {
              color: [128, 128, 128, 0.3],
              width: 0.5
            }
          }
        }
      });

      // Load the layers in parallel for better performance
      const loadPromises = [
        this.underBaysLayer.load(),
        this.baysLayer.load()
      ];

      await Promise.all(loadPromises);

      // Add the layers to the map
      view.map.add(this.underBaysLayer);
      view.map.add(this.baysLayer);

      // Set layer IDs for reference
      this.underBaysLayer.id = "underBaysLayer";
      this.baysLayer.id = "baysLayer";

      // Apply additional unloading prevention properties after creation
      try {
        // Enhanced properties for underBaysLayer
        (this.underBaysLayer as any).loadAllFeatures = true;
        (this.underBaysLayer as any).disableClientCaching = false;
        (this.underBaysLayer as any).maxRecordCount = 0;
        (this.underBaysLayer as any).unloadInvisibleFeatures = false;
        (this.underBaysLayer as any).keepFeaturesInMemory = true;
        (this.underBaysLayer as any).autoRefreshEnabled = false;
        
        // Enhanced properties for baysLayer
        (this.baysLayer as any).loadAllFeatures = true;
        (this.baysLayer as any).disableClientCaching = false;
        (this.baysLayer as any).maxRecordCount = 0;
        (this.baysLayer as any).unloadInvisibleFeatures = false;
        (this.baysLayer as any).keepFeaturesInMemory = true;
        (this.baysLayer as any).autoRefreshEnabled = false;
        
        logger.debug('Enhanced unloading prevention properties applied to bay layers', 'MapService');
      } catch {
        logger.debug('Some enhanced unloading prevention properties not available', 'MapService');
      }

      // Debug: Check the fields available in the bay layers
      logger.debug(`UnderBays Layer Fields: ${this.underBaysLayer.fields?.map(f => f.name).join(', ')}`, 'MapService');
      logger.debug(`Bays Layer Fields: ${this.baysLayer.fields?.map(f => f.name).join(', ')}`, 'MapService');

      // Test query to see what status values exist
      const testQuery = this.underBaysLayer.createQuery();
      testQuery.where = '1=1';
      testQuery.outFields = ['status', 'baytype', 'parkinglot'];
      testQuery.num = 10;
      const testResult = await this.underBaysLayer.queryFeatures(testQuery);
      const statusValues = [...new Set(testResult.features.map(f => f.attributes.status))];
      logger.debug(`Sample status values from underBays layer: ${statusValues.join(', ')}`, 'MapService');

      logger.debug('Bay layers initialized successfully', 'MapService');

    } catch (error) {
      throw new LayerInitializationError(
        'Failed to initialize bay layers',
        'bays',
        error instanceof Error ? error : undefined
      );
    }
  }

  getView(): MapView | null {
    return this.view;
  }

  getParkingLayer(): FeatureLayer | null {
    return this.parkingLayer;
  }

  getUnderBaysLayer(): FeatureLayer | null {
    return this.underBaysLayer;
  }

  getBaysLayer(): FeatureLayer | null {
    return this.baysLayer;
  }

  // Method to find bay layers in the webmap
  getWebMapBayLayers(): FeatureLayer[] {
    if (!this.view?.map) {
      logger.warn('Map view not available', 'MapService');
      return [];
    }

    const bayLayers: FeatureLayer[] = [];
    
    // Find all FeatureLayers in the webmap that might be bay layers
    this.view.map.layers.forEach(layer => {
      if (layer instanceof FeatureLayer) {
        const featureLayer = layer as FeatureLayer;
        
        // Check if this layer has bay-related fields
        if (featureLayer.fields) {
          const hasBayType = featureLayer.fields.some(f => f.name === 'baytype');
          const hasParkingLot = featureLayer.fields.some(f => f.name === 'parkinglot');
          
          if (hasBayType || hasParkingLot) {
            bayLayers.push(featureLayer);
          }
        }
      }
    });

    return bayLayers;
  }

  // Efficient query with field selection for better performance
  private async queryFeaturesEfficiently(
    layer: FeatureLayer,
    whereClause: string,
    fields: string[] = ['*']
  ): Promise<__esri.Graphic[]> {
    try {
      const cacheKey = `efficient_query_${layer.id}_${whereClause}_${fields.join(',')}`;
      const cachedResult = this.cacheService.get<__esri.Graphic[]>(cacheKey);
      
      if (cachedResult) {
        logger.debug(`Cache hit for efficient query: ${cacheKey}`, 'MapService');
        return cachedResult;
      }
      
      // Use pagination to get all features, not just the first 2000
      let allFeatures: __esri.Graphic[] = [];
      let hasMore = true;
      let start = 0;
      const pageSize = 1000; // Use 1000 per page to get more than default 2000 limit
      
      while (hasMore) {
        const query = layer.createQuery();
        query.where = whereClause;
        query.outFields = fields;
        query.returnGeometry = false; // Don't return geometry for better performance
        query.start = start;
        query.num = pageSize;
        
        // Use retry logic for each page query
        const result = await this.retryWithBackoff(
          async () => {
            const queryResult = await layer.queryFeatures(query);
            if (!queryResult.features) {
              throw new FeatureQueryError(
                `No features returned from efficient query for layer ${layer.id}`,
                layer.id
              );
            }
            return queryResult;
          },
          `Efficient query page ${start / pageSize + 1} for layer ${layer.id}`
        );
        
        allFeatures = [...allFeatures, ...result.features];
        
        // If we got fewer features than requested, we've reached the end
        if (result.features.length < pageSize) {
          hasMore = false;
        } else {
          start += pageSize;
        }
      }
      
      this.cacheService.set(cacheKey, allFeatures);
      
      return allFeatures;
    } catch (error) {
      logger.error(`Efficient query failed for layer ${layer.id} after retries`, 'MapService', error instanceof Error ? error : undefined);
      throw new FeatureQueryError(
        `Failed to query features efficiently from layer ${layer.id}`,
        layer.id,
        error instanceof Error ? error : undefined
      );
    }
  }

  // Batch update renderer for better performance
  private async updateRendererBatch(rendererConfig: __esri.Renderer): Promise<void> {
    try {
      const layers = [this.parkingLayer, this.underBaysLayer, this.baysLayer].filter(Boolean);
      
      // Update all layers in parallel
      await Promise.all(
        layers.map(layer => {
          if (layer) {
            layer.renderer = rendererConfig;
          }
        })
      );
      
      logger.debug('Batch renderer update completed', 'MapService');
    } catch (error) {
      logger.error('Failed to update renderer batch', 'MapService', error instanceof Error ? error : undefined);
    }
  }

  // Optimized method to get parking lots with bay type
  async getParkingLotsWithBayType(bayType: string, filterTemporary: boolean = false): Promise<string[]> {
    try {
      const cacheKey = `parking_lots_with_bay_type_${bayType}_${filterTemporary}`;
      const cachedResult = this.cacheService.get<string[]>(cacheKey);
      
      if (cachedResult) {
        logger.debug(`Cache hit for parking lots with bay type: ${bayType}`, 'MapService');
        return cachedResult;
      }

      // Use efficient query to get parking lots with specific bay type
      const bayLayers = this.getWebMapBayLayers();
      const parkingLots = new Set<string>();
      const rawParkingLots = new Set<string>(); // For debugging

      logger.debug(`Searching for parking lots with bay type: ${bayType}`, 'MapService');
      logger.debug(`Found ${bayLayers.length} bay layers to search`, 'MapService');

      for (const layer of bayLayers) {
        try {
                  // Try different field name variations
        const bayTypeField = layer.fields?.find(f => f.name.toLowerCase().includes('baytype'))?.name || 'baytype';
        const parkingLotField = layer.fields?.find(f => f.name.toLowerCase().includes('parkinglot'))?.name || 'parkinglot';
          
          const features = await this.queryFeaturesEfficiently(
            layer,
            `${bayTypeField} = '${bayType}'`,
            [parkingLotField, bayTypeField]
          );

          logger.debug(`Found ${features.length} features with bay type ${bayType} in layer ${layer.id}`, 'MapService');

          features.forEach(feature => {
            const rawParkingLot = feature.attributes[parkingLotField];
            const cleanedParkingLot = this.cleanString(rawParkingLot);
            
            rawParkingLots.add(rawParkingLot);
            
            if (cleanedParkingLot) {
              // Filter out temporary parking lots if requested
              if (!filterTemporary || !this.isTemporaryParkingLot(cleanedParkingLot)) {
                parkingLots.add(cleanedParkingLot);
              } else {
                logger.debug(`Filtering out temporary parking lot: ${cleanedParkingLot}`, 'MapService');
              }
            }
            
          });
          
        } catch (error) {
          logger.warn(`Failed to query layer ${layer.id} for bay type ${bayType}`, 'MapService', error instanceof Error ? error : undefined);
        }
      }

      const result = Array.from(parkingLots);
      
      // Map to official parking lot names that match the parking layer
      const officialNames = await this.getOfficialParkingLotNames(result);
      
      this.cacheService.set(cacheKey, officialNames);
      
      logger.debug(`Found ${officialNames.length} parking lots with bay type: ${bayType}`, 'MapService');
      return officialNames;
    } catch (error) {
      logger.error(`Failed to get parking lots with bay type: ${bayType}`, 'MapService', error instanceof Error ? error : undefined);
      return [];
    }
  }

  // Optimized method to filter webmap bay layers
  async filterWebMapBayLayers(bayType: string | null): Promise<void> {
    try {
      const bayLayers = this.getWebMapBayLayers();
      
      for (const layer of bayLayers) {
        if (bayType) {
          // Apply filter for specific bay type
          layer.definitionExpression = `baytype = '${bayType}'`;
          logger.debug(`Applied filter to layer ${layer.id}: baytype = '${bayType}'`, 'MapService');
        } else {
          // Clear filter
          layer.definitionExpression = null;
          logger.debug(`Cleared filter from layer ${layer.id}`, 'MapService');
        }
      }
      

    } catch (error) {
      logger.error('Failed to filter webmap bay layers', 'MapService', error instanceof Error ? error : undefined);
    }
  }

  // Update getParkingLots to use caching
  async getParkingLots(): Promise<string[]> {
    const cacheKey = 'parking_lots';
    const cachedLots = this.cacheService.get<string[]>(cacheKey);
    if (cachedLots) {
      return cachedLots;
    }

    if (!this.parkingLayer) {
      throw new MapServiceError('Parking layer not initialized');
    }

    try {
      const query = this.parkingLayer.createQuery();
      query.returnGeometry = false;
      query.outFields = ['Zone'];
      
      const result = await this.retryWithBackoff(
        async () => {
          const queryResult = await this.parkingLayer!.queryFeatures(query);
          if (!queryResult.features) {
            throw new FeatureQueryError(
              'No features returned from parking lots query',
              this.parkingLayer!.id
            );
          }
          return queryResult;
        },
        `getParkingLots for layer ${this.parkingLayer.id}`
      );
      
      const lots = [...new Set(result.features.map(f => 
        this.cleanString((f.attributes as ParkingFeatureAttributes).Zone)
      ))];
      
      this.cacheService.set(cacheKey, lots);
      return lots;
    } catch (error) {
      throw new FeatureQueryError(
        'Failed to query parking lots',
        this.parkingLayer.id,
        error instanceof Error ? error : undefined
      );
    }
  }



  // Update getMonitoredCarparks to use caching
  async getMonitoredCarparks(): Promise<string[]> {
    const cacheKey = 'monitored_carparks';
    const cachedCarparks = this.cacheService.get<string[]>(cacheKey);
    if (cachedCarparks) {
      return cachedCarparks;
    }

    if (!this.parkingLayer) {
      throw new MapServiceError('Parking layer not initialized');
    }

    try {
      const query = this.parkingLayer.createQuery();
      query.where = "isMonitored = 'True'";
      query.outFields = ['Zone'];
      
      const result = await this.retryWithBackoff(
        async () => {
          const queryResult = await this.parkingLayer!.queryFeatures(query);
          if (!queryResult.features) {
            throw new FeatureQueryError(
              'No features returned from monitored carparks query',
              this.parkingLayer!.id
            );
          }
          return queryResult;
        },
        `getMonitoredCarparks for layer ${this.parkingLayer.id}`
      );
      
      const carparks = result.features.map(f => 
        this.cleanString((f.attributes as ParkingFeatureAttributes).Zone)
      );
      
      this.cacheService.set(cacheKey, carparks);
      return carparks;
    } catch (error) {
      throw new FeatureQueryError(
        'Failed to query monitored carparks',
        this.parkingLayer.id,
        error instanceof Error ? error : undefined
      );
    }
  }

  async loadAndProcessFeatures(): Promise<void> {
    try {
      if (this.featuresLoaded) return;

      logger.info('Starting to load and process features', 'MapService');

      // First, get monitored parking lots from the parking layer
      if (!this.parkingLayer) {
        throw new MapServiceError('Parking layer not initialized');
      }

      const parkingQuery = this.parkingLayer.createQuery();
      parkingQuery.where = "isMonitored = 'True'";
      parkingQuery.outFields = ['Zone'];
      const parkingResult = await this.retryWithBackoff(
        async () => {
          const queryResult = await this.parkingLayer!.queryFeatures(parkingQuery);
          if (!queryResult.features) {
            throw new FeatureQueryError(
              'No features returned from monitored parking lots query',
              this.parkingLayer!.id
            );
          }
          return queryResult;
        },
        `loadAndProcessFeatures - monitored parking lots query for layer ${this.parkingLayer.id}`
      );
      
      const monitoredParkingLots = new Set(
        parkingResult.features.map(f => 
          this.cleanString((f.attributes as ParkingFeatureAttributes).Zone)
        )
      );

      logger.info(`Found ${monitoredParkingLots.size} monitored parking lots`, 'MapService');

      // Use the already initialized bay layers
      if (!this.underBaysLayer || !this.baysLayer) {
        throw new MapServiceError('Bay layers not initialized');
      }

      logger.info('Querying bay layers for features', 'MapService');

      const [underBaysFeatures, baysFeatures] = await Promise.all([
        this.queryAllFeatures(this.underBaysLayer),
        this.queryAllFeatures(this.baysLayer)
      ]);

      logger.info(`Loaded ${underBaysFeatures.length} under bays features and ${baysFeatures.length} bays features`, 'MapService');

      // Deduplicate features within each layer based on OBJECTID
      // This prevents counting the same feature twice if it appears multiple times in the query results
      const deduplicateFeatures = (features: __esri.Graphic[], layerName: string): __esri.Graphic[] => {
        const seen = new Set<number>();
        const unique: __esri.Graphic[] = [];
        let duplicateCount = 0;
        
        features.forEach(feature => {
          const attributes = feature.attributes as BayFeatureAttributes;
          const objectId = attributes.OBJECTID;
          
          if (objectId && seen.has(objectId)) {
            duplicateCount++;
            logger.debug(`Duplicate OBJECTID ${objectId} found in ${layerName} layer`, 'MapService');
          } else {
            if (objectId) seen.add(objectId);
            unique.push(feature);
          }
        });
        
        if (duplicateCount > 0) {
          logger.warn(`Found ${duplicateCount} duplicate features in ${layerName} layer (deduplicated)`, 'MapService');
        }
        
        return unique;
      };
      
      const uniqueUnderBays = deduplicateFeatures(underBaysFeatures, 'underBays');
      const uniqueBays = deduplicateFeatures(baysFeatures, 'bays');
      
      // Initialize counts
      const totalCounts: { [key: string]: number } = {};
      const monitoredCounts: { [key: string]: number } = {};
      const individualBayClosedCounts: { [key: string]: number } = {};
      const parkingLotCounts: { [key: string]: { [key: string]: number } } = {};

      // Process all features from both layers (no overlap expected between layers)
      const allFeatures = [...uniqueUnderBays, ...uniqueBays];
      
      logger.info(`Processing ${allFeatures.length} total features (${uniqueUnderBays.length} underBays + ${uniqueBays.length} bays)`, 'MapService');
      
      // First, organize features by parking lot
      const featuresByParkingLot: { [key: string]: __esri.Graphic[] } = {};
      allFeatures.forEach(feature => {
        const attributes = feature.attributes as BayFeatureAttributes;
        const parkingLot = this.cleanString(attributes.parkinglot || 'Unknown');
        if (!featuresByParkingLot[parkingLot]) {
          featuresByParkingLot[parkingLot] = [];
        }
        featuresByParkingLot[parkingLot].push(feature);
      });

      logger.info(`Organized features into ${Object.keys(featuresByParkingLot).length} parking lots`, 'MapService');
      logger.debug(`Parking lots found: ${Object.keys(featuresByParkingLot).join(', ')}`, 'MapService');

      // Then process each parking lot's features
      Object.entries(featuresByParkingLot).forEach(([parkingLot, features]) => {
        // Cache features
        this.cachedFeatures[parkingLot] = features;

        // Initialize parking lot counts
        if (!parkingLotCounts[parkingLot]) {
          parkingLotCounts[parkingLot] = {};
        }

        // Check if this parking lot is monitored
        const isParkingLotMonitored = monitoredParkingLots.has(parkingLot);

        // Count bay types for this parking lot
        features.forEach(feature => {
          const attributes = feature.attributes as BayFeatureAttributes;
          // Keep original bay type name but clean it (preserves Reserved_* variants for separate counting)
          // Only clean special characters, but preserve underscores for Reserved_* types
          let bayType = attributes.baytype || 'Unknown';
          // Clean the bay type but preserve Reserved_* pattern
          if (!bayType.toLowerCase().startsWith('reserved_')) {
            bayType = this.cleanString(bayType);
            // Handle case where ReservedName (from cleaned Reserved_Name) might exist
            // Normalize ReservedName to Reserved_Name for consistency
            if (bayType.toLowerCase() === 'reservedname' || bayType.toLowerCase().startsWith('reservedname')) {
              // This was likely a Reserved_* variant that got cleaned - we can't recover the original
              // but we should handle it consistently. For now, keep it as is but log a warning
              logger.debug(`Found cleaned Reserved variant: ${bayType} (original: ${attributes.baytype})`, 'MapService');
            }
          } else {
            // For Reserved_* types, just trim and clean quotes (preserve underscore for separate counting)
            bayType = bayType.trim().replace(/['"]/g, '');
          }
          const bayStatus = this.cleanString(String(attributes.status || 'Open'));
          
          // Update total counts (Reserved_* variants counted separately)
          totalCounts[bayType] = (totalCounts[bayType] || 0) + 1;
          
          // Update individual bay closed counts if bay status indicates closed
          const closedStatuses = ['closed', 'Closed', 'CLOSED', 'inactive', 'Inactive', 'INACTIVE'];
          if (closedStatuses.includes(bayStatus)) {
            individualBayClosedCounts[bayType] = (individualBayClosedCounts[bayType] || 0) + 1;
          }
          
          // Update monitored counts if the parking lot is monitored
          if (isParkingLotMonitored) {
            monitoredCounts[bayType] = (monitoredCounts[bayType] || 0) + 1;
          }
          
          // Update parking lot counts
          parkingLotCounts[parkingLot][bayType] = (parkingLotCounts[parkingLot][bayType] || 0) + 1;
        });
      });

      logger.info(`Processed counts - Total: ${Object.keys(totalCounts).length} bay types, Closed: ${Object.keys(individualBayClosedCounts).length} bay types`, 'MapService');
      
      // Log summary of counts for debugging
      const topBayTypes = Object.entries(totalCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);
      logger.info(`Top 10 bay types: ${topBayTypes.map(([type, count]) => `${type}: ${count}`).join(', ')}`, 'MapService');
      
      // Log total count
      const totalBays = Object.values(totalCounts).reduce((sum, count) => sum + count, 0);
      logger.info(`Total bays counted: ${totalBays}`, 'MapService');

      // Cache the counts
      this.cachedTotalCounts = totalCounts;
      this.cachedMonitoredCounts = monitoredCounts;
      this.cachedIndividualBayClosedCounts = individualBayClosedCounts;
      
      // Convert parking lot counts to BayTypeCount arrays
      Object.entries(parkingLotCounts).forEach(([lot, counts]) => {
        this.cachedParkingLotCounts[lot] = Object.entries(counts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count);
      });



      this.featuresLoaded = true;
      logger.info('Feature loading and processing completed', 'MapService');
      logger.info(`Total parking lots loaded: ${Object.keys(this.cachedParkingLotCounts).length}`, 'MapService');
      logger.info(`Sample parking lots: ${Object.keys(this.cachedParkingLotCounts).slice(0, 5).join(', ')}`, 'MapService');
    } catch (error) {
      logger.error('Failed to load and process features', 'MapService', error instanceof Error ? error : undefined);
      throw new MapServiceError(
        'Failed to load and process features',
        error instanceof Error ? error : undefined
      );
    }
  }

  async getSelectedParkingLotBays(parkingLot: string): Promise<BayTypeCount[]> {
    try {
      await this.loadAndProcessFeatures();
      const cleanedParkingLot = this.cleanString(parkingLot);
      const result = this.cachedParkingLotCounts[cleanedParkingLot] || [];
              logger.debug(`getSelectedParkingLotBays - Parking lot: "${parkingLot}", Cleaned: "${cleanedParkingLot}", Result: ${JSON.stringify(result)}`, 'MapService');
      return result;
    } catch (error) {
      logger.error(`Failed to get bay counts for parking lot ${parkingLot}`, 'MapService', error instanceof Error ? error : undefined);
      throw new MapServiceError(
        `Failed to get bay counts for parking lot ${parkingLot}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async getSelectedParkingLotClosedBays(parkingLot: string): Promise<{ [key: string]: number }> {
    try {
      await this.loadAndProcessFeatures();
      const cleanedParkingLot = this.cleanString(parkingLot);
      const features = this.cachedFeatures[cleanedParkingLot] || [];
      
      
      
      const closedBayCounts: { [key: string]: number } = {};
      
      features.forEach(feature => {
        const attributes = feature.attributes as BayFeatureAttributes;
        // Keep original bay type name but clean it (preserves Reserved_* variants for separate counting)
        let bayType = attributes.baytype || 'Unknown';
        // Clean the bay type but preserve Reserved_* pattern
        if (!bayType.toLowerCase().startsWith('reserved_')) {
          bayType = this.cleanString(bayType);
        } else {
          // For Reserved_* types, just trim and clean quotes (preserve underscore for separate counting)
          bayType = bayType.trim().replace(/['"]/g, '');
        }
        const bayStatus = this.cleanString(String(attributes.status || 'Open'));
        
        // Check for various closed status values
        const closedStatuses = ['closed', 'Closed', 'CLOSED', 'inactive', 'Inactive', 'INACTIVE'];
        if (closedStatuses.includes(bayStatus)) {
          closedBayCounts[bayType] = (closedBayCounts[bayType] || 0) + 1;
        }
      });
      return closedBayCounts;
    } catch (error) {
      logger.error(`Failed to get closed bay counts for parking lot ${parkingLot}`, 'MapService', error instanceof Error ? error : undefined);
      throw new MapServiceError(
        `Failed to get closed bay counts for parking lot ${parkingLot}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async getBayCounts(): Promise<BayTypeCount[]> {
    try {
      await this.loadAndProcessFeatures();
      return Object.entries(this.cachedTotalCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      throw new MapServiceError(
        'Failed to get bay counts',
        error instanceof Error ? error : undefined
      );
    }
  }

  getTotalBayCounts(filterTemporary: boolean = false): { [key: string]: number } {
    if (!filterTemporary) {
      return this.cachedTotalCounts;
    }
    
    // Filter out temporary parking lots from total counts
    const filteredCounts: { [key: string]: number } = {};
    
    // Get all parking lots and their bay counts
    logger.debug(`Filtering total bay counts. Total parking lots: ${Object.keys(this.cachedParkingLotCounts).length}`, 'MapService');
    Object.entries(this.cachedParkingLotCounts).forEach(([parkingLot, bayCounts]) => {
      const isTemp = this.isTemporaryParkingLot(parkingLot);
      logger.debug(`Processing parking lot: ${parkingLot}, isTemporary: ${isTemp}`, 'MapService');
      
      if (!isTemp) {
        bayCounts.forEach(({ type, count }) => {
          filteredCounts[type] = (filteredCounts[type] || 0) + count;
        });
      } else {
        logger.debug(`Skipping temporary parking lot: ${parkingLot}`, 'MapService');
      }
    });
    
    return filteredCounts;
  }

  getMonitoredBayCounts(filterTemporary: boolean = false): { [key: string]: number } {
    if (!filterTemporary) {
      return this.cachedMonitoredCounts;
    }
    
    // For now, just return the original monitored counts when filtering
    // This is a simplified approach - in a real implementation, you'd need to
    // recalculate which parking lots are monitored after filtering
    return this.cachedMonitoredCounts;
  }

  getIndividualBayClosedCounts(): { [key: string]: number } {
    return this.cachedIndividualBayClosedCounts;
  }

  // Method to verify bay layer fields and log available fields
  async verifyBayLayerFields(): Promise<void> {
    try {
      if (!this.underBaysLayer || !this.baysLayer) {
        logger.warn('Bay layers not initialized', 'MapService');
        return;
      }

      // Load layer info to get field information
      await Promise.all([
        this.underBaysLayer.load(),
        this.baysLayer.load()
      ]);

      logger.debug('UnderBays Layer Fields:', 'MapService', this.underBaysLayer.fields?.map(f => f.name));
      logger.debug('Bays Layer Fields:', 'MapService', this.baysLayer.fields?.map(f => f.name));

      // Check if baytype field exists
      const underBaysHasBayType = this.underBaysLayer.fields?.some(f => f.name === 'baytype');
      const baysHasBayType = this.baysLayer.fields?.some(f => f.name === 'baytype');

      if (!underBaysHasBayType || !baysHasBayType) {
        logger.warn('baytype field not found in one or both bay layers', 'MapService');
        return;
      }

      // Query sample data to see what baytype values exist
      const sampleQuery = this.underBaysLayer.createQuery();
      sampleQuery.returnGeometry = false;
      sampleQuery.outFields = ['baytype'];
      sampleQuery.where = '1=1';
      sampleQuery.num = 10; // Get first 10 features

      await this.underBaysLayer.queryFeatures(sampleQuery);
      // const bayTypes = [...new Set(sampleResult.features.map(f => f.attributes.baytype))];
    } catch (error) {
      logger.error('Error verifying bay layer fields', 'MapService', error instanceof Error ? error : undefined);
    }
  }

  // Method to test bay type filtering
  async testBayTypeFiltering(bayType: string): Promise<void> {
    try {
      const bayLayers = this.getWebMapBayLayers();
      
      if (bayLayers.length === 0) {
        logger.warn('No bay layers found in webmap', 'MapService');
        return;
      }

      // Check layer visibility
      bayLayers.forEach((layer, index) => {
        logger.debug(`Layer ${index} visible:`, 'MapService', layer.visible);
        logger.debug(`Layer ${index} fields:`, 'MapService', layer.fields?.map(f => f.name));
      });

      // Ensure layers are visible
      bayLayers.forEach(layer => {
        layer.visible = true;
      });

      // Get total count before filtering
      await Promise.all(
        bayLayers.map(async layer => {
          const query = layer.createQuery();
          query.where = '1=1';
          query.returnGeometry = false;
          query.outFields = ['baytype'];
          const result = await layer.queryFeatures(query);
          return result.features.length;
        })
      );

      // Set definition expression
      const definitionExpression = `baytype = '${bayType}'`;
      bayLayers.forEach(layer => {
        layer.definitionExpression = definitionExpression;
      });

      // Wait a moment for the filter to take effect
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Query to see how many features match after filtering
      await Promise.all(
        bayLayers.map(async layer => {
          const query = layer.createQuery();
          query.where = '1=1'; // Query all visible features
          query.returnGeometry = false;
          query.outFields = ['baytype'];
          const result = await layer.queryFeatures(query);
          return result.features.length;
        })
      );

      // Clear the filter
      bayLayers.forEach(layer => {
        layer.definitionExpression = "";
      });

    } catch (error) {
      logger.error('Error testing bay type filtering', 'MapService', error instanceof Error ? error : undefined);
    }
  }

  private async ensureFeaturesLoaded(): Promise<void> {
    if (!this.featuresLoaded) {
      await this.loadAndProcessFeatures();
    }
  }

  // Add zoom change handler for layer optimization
  setupZoomOptimization(view: MapView): void {
    try {
      // Import reactiveUtils for modern watch functionality
      import('@arcgis/core/core/reactiveUtils').then(({ watch }) => {
        // Use modern reactiveUtils.watch instead of deprecated view.watch
        watch(() => view.zoom, (newZoom: number) => {
          // No longer optimizing layer visibility based on zoom
          logger.debug(`Zoom level changed to: ${newZoom}`, 'MapService');
        });
      }).catch((error) => {
        logger.warn('Failed to import reactiveUtils for zoom watching', 'MapService', error instanceof Error ? error : undefined);
      });

      // Add event listeners to prevent unloading during navigation
      view.on('drag', () => {
        // Prevent unloading during drag operations
        this.preventFeatureUnloading(view);
      });

      view.on('mouse-wheel', () => {
        // Prevent unloading during zoom operations
        this.preventFeatureUnloading(view);
      });

      view.on('double-click', () => {
        // Prevent unloading during double-click zoom
        this.preventFeatureUnloading(view);
      });

      logger.debug('Zoom optimization setup completed', 'MapService');
    } catch (error) {
      logger.warn('Failed to setup zoom optimization', 'MapService', error instanceof Error ? error : undefined);
    }
  }

  // Prevent feature unloading during navigation
  private preventFeatureUnloading(view: MapView): void {
    try {
      if (!view.map) {
        logger.warn('Map is not initialized on the view', 'MapService');
        return;
      }
      
      logger.debug('Configuring layers to prevent feature unloading', 'MapService');
      
      // Ensure all layers maintain their features
      view.map.layers.forEach(layer => {
        if (layer instanceof FeatureLayer) {
          // Core persistence setting
          layer.persistenceEnabled = true;
          
          // Additional ArcGIS-specific properties to prevent unloading
          try {
            // Force all features to stay loaded
            (layer as any).loadAllFeatures = true;
            
            // Disable client-side caching restrictions
            (layer as any).disableClientCaching = false;
            
            // Set maximum features to prevent unloading
            (layer as any).maxRecordCount = 0; // 0 means no limit
            
            // Disable feature unloading based on visibility
            (layer as any).unloadInvisibleFeatures = false;
            
            // Keep features in memory even when not visible
            (layer as any).keepFeaturesInMemory = true;
            
            // Disable automatic feature cleanup
            (layer as any).autoRefreshEnabled = false;
            
            logger.debug(`Enhanced unloading prevention configured for layer: ${layer.id}`, 'MapService');
          } catch {
            logger.debug(`Some unloading prevention properties not available for layer ${layer.id}`, 'MapService');
          }
        }
      });
      
      // Configure view-level settings to prevent feature unloading
      try {
        // Disable view-level feature unloading
        (view as any).unloadInvisibleFeatures = false;
        (view as any).keepFeaturesInMemory = true;
        
        // Set view to maintain all loaded features
        view.constraints = {
          ...view.constraints,
          rotationEnabled: false,
          snapToZoom: false
        };
        
        logger.debug('View-level feature unloading prevention configured', 'MapService');
              } catch {
          logger.debug('Some view-level unloading prevention properties not available', 'MapService');
        }
      
      logger.debug('Feature unloading prevention configuration completed', 'MapService');
    } catch (error) {
      logger.warn('Failed to prevent feature unloading', 'MapService', error instanceof Error ? error : undefined);
    }
  }

  // Preload all features to prevent unloading issues
  async preloadAllFeatures(): Promise<void> {
    try {
      logger.debug('Preloading all features to prevent unloading', 'MapService');
      
      // Get all feature layers from the webmap and our additional layers
      const allLayers: FeatureLayer[] = [];
      
      // Add our additional layers
      if (this.parkingLayer) allLayers.push(this.parkingLayer);
      if (this.underBaysLayer) allLayers.push(this.underBaysLayer);
      if (this.baysLayer) allLayers.push(this.baysLayer);
      
      // Add all webmap layers
      if (this.view && this.view.map) {
        this.view.map.layers.forEach(layer => {
          if (layer instanceof FeatureLayer) {
            allLayers.push(layer);
          }
        });
      }

      // Apply aggressive unloading prevention BEFORE preloading
      logger.debug('Applying aggressive unloading prevention to all layers', 'MapService');
      allLayers.forEach(layer => {
        try {
          // Core persistence setting
          layer.persistenceEnabled = true;
          
          // Apply ALL possible unloading prevention properties
          const layerAny = layer as any;
          
          // Force all features to stay loaded
          if (typeof layerAny.loadAllFeatures !== 'undefined') {
            layerAny.loadAllFeatures = true;
          }
          
          // Disable client-side caching restrictions
          if (typeof layerAny.disableClientCaching !== 'undefined') {
            layerAny.disableClientCaching = false;
          }
          
          // Set maximum features to prevent unloading
          if (typeof layerAny.maxRecordCount !== 'undefined') {
            layerAny.maxRecordCount = 0; // 0 means no limit
          }
          
          // Disable feature unloading based on visibility
          if (typeof layerAny.unloadInvisibleFeatures !== 'undefined') {
            layerAny.unloadInvisibleFeatures = false;
          }
          
          // Keep features in memory even when not visible
          if (typeof layerAny.keepFeaturesInMemory !== 'undefined') {
            layerAny.keepFeaturesInMemory = true;
          }
          
          // Disable automatic feature cleanup
          if (typeof layerAny.autoRefreshEnabled !== 'undefined') {
            layerAny.autoRefreshEnabled = false;
          }
          
          // Additional ArcGIS-specific properties
          if (typeof layerAny.refreshInterval !== 'undefined') {
            layerAny.refreshInterval = 0; // No auto refresh
          }
          
          if (typeof layerAny.visible !== 'undefined') {
            layerAny.visible = true; // Keep visible
          }
          
          logger.debug(`Applied aggressive unloading prevention to layer: ${layer.id}`, 'MapService');
        } catch {
          logger.debug(`Some unloading prevention properties not available for layer ${layer.id}`, 'MapService');
        }
      });
      
      // Enhanced preloading with progress tracking
      const totalLayers = allLayers.length;
      let completedLayers = 0;
      
      logger.debug(`Starting preload for ${totalLayers} layers:`, 'MapService');
      allLayers.forEach((layer, index) => {
        logger.debug(`Layer ${index + 1}: ${layer.id} (${layer.title || 'No title'})`, 'MapService');
      });
      
      for (const layer of allLayers) {
        try {
          // Set layer persistence to prevent unloading
          layer.persistenceEnabled = true;
          
          // Query all features to ensure they're loaded in memory
          const query = layer.createQuery();
          query.where = '1=1';
          query.returnGeometry = true; // Keep geometry for better performance
          query.outFields = ['*'];
          // Note: maxRecordCount is not available in this version, will get all records by default
          
          const result = await layer.queryFeatures(query);
          logger.debug(`Preloaded ${result.features.length} features from layer ${layer.id}`, 'MapService');
          
          // Cache features in memory for faster access
          this.cachedFeatures[layer.id] = result.features;
          
          // Force features to stay loaded by adding them to layer graphics
          try {
            const layerAny = layer as any;
            if (layerAny.graphics && Array.isArray(layerAny.graphics)) {
              // Add all features to the layer's graphics collection to force them to stay loaded
              result.features.forEach(feature => {
                if (!layerAny.graphics.some((g: any) => g.attributes?.OBJECTID === feature.attributes?.OBJECTID)) {
                  layerAny.graphics.add(feature);
                }
              });
              logger.debug(`Forced ${result.features.length} features to stay loaded in layer ${layer.id}`, 'MapService');
            }
          } catch {
            logger.debug(`Could not force features to graphics collection for layer ${layer.id}`, 'MapService');
          }
          
          completedLayers++;
          logger.debug(`Preloading progress: ${completedLayers}/${totalLayers} layers`, 'MapService');
        } catch (error) {
          logger.warn(`Failed to preload features from layer ${layer.id}`, 'MapService', error instanceof Error ? error : undefined);
          completedLayers++;
        }
      }
      
      // Configure view for optimal performance and prevent unloading
      if (this.view) {
        // Enable feature caching
        this.view.constraints = {
          ...this.view.constraints,
          rotationEnabled: false, // Disable rotation for better performance
          snapToZoom: false // Disable snap to zoom for smoother experience
        };
        
        // Apply aggressive view-level unloading prevention
        try {
          const viewAny = this.view as any;
          
          // Disable view-level feature unloading
          if (typeof viewAny.unloadInvisibleFeatures !== 'undefined') {
            viewAny.unloadInvisibleFeatures = false;
          }
          
          if (typeof viewAny.keepFeaturesInMemory !== 'undefined') {
            viewAny.keepFeaturesInMemory = true;
          }
          
          // Disable any automatic cleanup
          if (typeof viewAny.autoRefreshEnabled !== 'undefined') {
            viewAny.autoRefreshEnabled = false;
          }
          
          logger.debug('Applied aggressive view-level unloading prevention', 'MapService');
        } catch {
          logger.debug('Some view-level unloading prevention properties not available', 'MapService');
        }
        
        // Set up view extent caching
        this.setupViewExtentCaching();
      }
      
      logger.debug(`Feature preloading completed: ${completedLayers}/${totalLayers} layers`, 'MapService');
      
      // Monitor feature unloading status after preloading
      this.monitorFeatureUnloadingStatus();
      
      // Set up periodic monitoring to check if features are being unloaded (development only)
      if (process.env.NODE_ENV !== 'production') {
        setInterval(() => {
          this.monitorFeatureUnloadingStatus();
        }, 30000); // Check every 30 seconds
      }
    } catch (error) {
      logger.error('Failed to preload features', 'MapService', error instanceof Error ? error : undefined);
    }
  }

  // Enhanced view extent caching for better pan/zoom performance
  private setupViewExtentCaching(): void {
    if (!this.view) return;
    
    try {
      // Disable continuous extent caching since we're preloading all features
      // This was causing performance issues with continuous caching on every map move
      logger.debug('View extent caching disabled - using preloaded features instead', 'MapService');
    } catch (error) {
      logger.warn('Failed to setup view extent caching', 'MapService', error instanceof Error ? error : undefined);
    }
  }

  // Cache data for the current view extent - DISABLED
  // This method is disabled because it was causing continuous caching on every map move
  // We now use preloaded features instead for better performance
  /*
  private async cacheViewExtent(extent: __esri.Extent): Promise<void> {
    try {
      // Expand extent by 20% to preload adjacent areas
      const expandedExtent = extent.clone();
      const width = extent.xmax - extent.xmin;
      const height = extent.ymax - extent.ymin;
      
      expandedExtent.xmin -= width * 0.1;
      expandedExtent.xmax += width * 0.1;
      expandedExtent.ymin -= height * 0.1;
      expandedExtent.ymax += height * 0.1;
      
      // Preload features in expanded extent for all layers
      const allLayers = this.getAllFeatureLayers();
      
      for (const layer of allLayers) {
        try {
          const query = layer.createQuery();
          query.geometry = expandedExtent;
          query.returnGeometry = true;
          query.outFields = ['*'];
          
          // Use cache service for persistent storage
          const cacheKey = `extent_${layer.id}_${extent.xmin.toFixed(4)}_${extent.ymin.toFixed(4)}`;
          const cached = this.cacheService.get(cacheKey);
          
          if (!cached) {
            const result = await layer.queryFeatures(query);
            this.cacheService.set(cacheKey, result.features); // Cache using default TTL
            logger.debug(`Cached ${result.features.length} features for extent in layer ${layer.id}`, 'MapService');
          }
        } catch (error) {
          logger.debug(`Failed to cache extent for layer ${layer.id}`, 'MapService', error instanceof Error ? error : undefined);
        }
      }
    } catch (error) {
      logger.warn('Failed to cache view extent', 'MapService', error instanceof Error ? error : undefined);
    }
  }
  */

  // Monitor feature unloading status across all layers
  private monitorFeatureUnloadingStatus(): void {
    try {
      if (!this.view || !this.view.map) return;
      
      const totalLayers = this.view.map.layers.length;
      const featureLayers = this.view.map.layers.filter(layer => layer instanceof FeatureLayer);
      
      logger.debug(`Monitoring feature unloading status: ${featureLayers.length} feature layers out of ${totalLayers} total layers`, 'MapService');
      
      let totalFeatures = 0;
      this.view.map.layers.forEach((layer, index) => {
        if (layer instanceof FeatureLayer) {
          const featureCount = (layer as any).graphics?.length || 0;
          const cachedCount = this.cachedFeatures[layer.id]?.length || 0;
          const isPersistent = (layer as any).persistenceEnabled;
          const loadAllFeatures = (layer as any).loadAllFeatures;
          const unloadInvisible = (layer as any).unloadInvisibleFeatures;
          
          totalFeatures += featureCount;
          
          // Check if features are being unloaded
          if (cachedCount > 0 && featureCount < cachedCount) {
            logger.warn(`⚠️ FEATURE UNLOADING DETECTED: Layer ${layer.id} has ${featureCount} features but cached ${cachedCount}`, 'MapService');
          }
          
          logger.debug(`Layer ${index + 1}: ${layer.id} (${layer.title || 'No title'}): ${featureCount}/${cachedCount} features, persistent: ${isPersistent}, loadAll: ${loadAllFeatures}, unloadInvisible: ${unloadInvisible}`, 'MapService');
        } else {
          logger.debug(`Layer ${index + 1}: ${layer.id} (${layer.title || 'No title'}): ${layer.constructor.name}`, 'MapService');
        }
      });
      
      logger.debug(`Total features across all layers: ${totalFeatures}`, 'MapService');
    } catch (error) {
      logger.debug('Failed to monitor feature unloading status', 'MapService', error instanceof Error ? error : undefined);
    }
  }

  // Get all feature layers for caching operations
  private getAllFeatureLayers(): FeatureLayer[] {
    const layers: FeatureLayer[] = [];
    
    if (this.parkingLayer) layers.push(this.parkingLayer);
    if (this.underBaysLayer) layers.push(this.underBaysLayer);
    if (this.baysLayer) layers.push(this.baysLayer);
    
    if (this.view && this.view.map) {
      this.view.map.layers.forEach(layer => {
        if (layer instanceof FeatureLayer) {
          layers.push(layer);
        }
      });
    }
    
    return layers;
  }

  // Configure all webmap layers to prevent unloading
  private configureWebMapLayers(view: MapView): void {
    try {
      if (!view.map) {
        logger.warn('Map is not initialized on the view', 'MapService');
        return;
      }
      logger.debug('Configuring webmap layers with enhanced unloading prevention', 'MapService');
      
      // Configure all layers in the webmap with comprehensive unloading prevention
      view.map.layers.forEach(layer => {
        if (layer instanceof FeatureLayer) {
          // Core persistence setting
          layer.persistenceEnabled = true;
          
          // Apply comprehensive unloading prevention properties
          try {
            // Force all features to stay loaded
            (layer as any).loadAllFeatures = true;
            
            // Disable client-side caching restrictions
            (layer as any).disableClientCaching = false;
            
            // Set maximum features to prevent unloading
            (layer as any).maxRecordCount = 0; // 0 means no limit
            
            // Disable feature unloading based on visibility
            (layer as any).unloadInvisibleFeatures = false;
            
            // Keep features in memory even when not visible
            (layer as any).keepFeaturesInMemory = true;
            
            // Disable automatic feature cleanup
            (layer as any).autoRefreshEnabled = false;
            
            logger.debug(`Enhanced unloading prevention configured for webmap layer: ${layer.id}`, 'MapService');
          } catch {
            logger.debug(`Some unloading prevention properties not available for webmap layer ${layer.id}`, 'MapService');
          }
        }
      });
      
      logger.debug('Webmap layers configured successfully with enhanced unloading prevention', 'MapService');
    } catch (error) {
      logger.error('Failed to configure webmap layers', 'MapService', error instanceof Error ? error : undefined);
    }
  }

  // Get official parking lot names that match the parking layer Zone names
  async getOfficialParkingLotNames(bayTypeParkingLots: string[]): Promise<string[]> {
    try {
      if (!this.parkingLayer) {
        logger.warn('Parking layer not available for name mapping', 'MapService');
        return bayTypeParkingLots;
      }

      // Get all official parking lot names from the parking layer
      const query = this.parkingLayer.createQuery();
      query.returnGeometry = false;
      query.outFields = ['Zone'];
      const result = await this.retryWithBackoff(
        async () => {
          const queryResult = await this.parkingLayer!.queryFeatures(query);
          if (!queryResult.features) {
            throw new FeatureQueryError(
              'No features returned from official parking lot names query',
              this.parkingLayer!.id
            );
          }
          return queryResult;
        },
        `getOfficialParkingLotNames for layer ${this.parkingLayer.id}`
      );
      
      const officialNames = result.features.map(f => 
        this.cleanString((f.attributes as ParkingFeatureAttributes).Zone)
      );



      // Try to match bay type parking lots with official names
      const matchedNames: string[] = [];
      
              for (const bayTypeLot of bayTypeParkingLots) {
          // First try exact match
          if (officialNames.includes(bayTypeLot)) {
            matchedNames.push(bayTypeLot);
            continue;
          }
          
          // Try case-insensitive match
          const caseInsensitiveMatch = officialNames.find(name => 
            name.toLowerCase() === bayTypeLot.toLowerCase()
          );
          if (caseInsensitiveMatch) {
            matchedNames.push(caseInsensitiveMatch);
            continue;
          }
          
          // Try partial match (one contains the other)
          const partialMatch = officialNames.find(name => 
            name.toLowerCase().includes(bayTypeLot.toLowerCase()) || 
            bayTypeLot.toLowerCase().includes(name.toLowerCase())
          );
          if (partialMatch) {
            matchedNames.push(partialMatch);
            continue;
          }
          
          // Try fuzzy matching for common variations
          const fuzzyMatch = officialNames.find(name => {
            const normalizedBayType = bayTypeLot.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedOfficial = name.toLowerCase().replace(/[^a-z0-9]/g, '');
            return normalizedBayType === normalizedOfficial;
          });
          if (fuzzyMatch) {
            matchedNames.push(fuzzyMatch);
            continue;
          }
          
          // If no match found, use the original name
          matchedNames.push(bayTypeLot);
          logger.warn(`No match found for parking lot: ${bayTypeLot}`, 'MapService');
        }
      return matchedNames;
    } catch (error) {
      logger.error('Failed to get official parking lot names', 'MapService', error instanceof Error ? error : undefined);
      return bayTypeParkingLots;
    }
  }
}

