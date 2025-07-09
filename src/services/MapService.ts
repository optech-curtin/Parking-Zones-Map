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

  constructor() {
    const portalUrl = process.env.NEXT_PUBLIC_ARCGIS_PORTAL_URL;
    if (!portalUrl) {
      throw new MapServiceError('ARCGIS_PORTAL_URL environment variable is not set');
    }
    esriConfig.portalUrl = portalUrl;
    this.cacheService = CacheService.getInstance();
  }

  // Helper function to check if a parking lot is temporary
  isTemporaryParkingLot(parkingLot: string): boolean {
    const tempPattern = /^TCP\d+$/i; // Matches TCP1, TCP2, TCP3, etc.
    return tempPattern.test(parkingLot.trim());
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
      
      const result = await layer.queryFeatures(query);
      
      if (!result.features) {
        throw new FeatureQueryError(
          `No features returned from query for layer ${layer.id}`,
          layer.id
        );
      }

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
      logger.error(`Query failed for layer ${layer.id}`, 'MapService', error instanceof Error ? error : undefined);
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

      // Create the bay layers with performance optimizations
      this.underBaysLayer = new FeatureLayer({
        url: "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays_Under/FeatureServer/0",
        outFields: ['*'],
        // Performance optimizations
        visible: true,
        // Prevent unloading when out of view
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
        // Prevent unloading when out of view
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
      console.warn('Map view not available');
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
            console.log('Found potential bay layer:', featureLayer.id, featureLayer.title);
            console.log('Layer fields:', featureLayer.fields.map(f => f.name));
            bayLayers.push(featureLayer);
          }
        }
      }
    });

    console.log(`Found ${bayLayers.length} bay layers in webmap`);
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
        
        const result = await layer.queryFeatures(query);
        
        if (!result.features) {
          break;
        }
        
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
      logger.error(`Efficient query failed for layer ${layer.id}`, 'MapService', error instanceof Error ? error : undefined);
      throw new FeatureQueryError(
        `Failed to query features efficiently from layer ${layer.id}`,
        layer.id,
        error instanceof Error ? error : undefined
      );
    }
  }

  // Batch update renderer for better performance
  private async updateRendererBatch(rendererConfig: any): Promise<void> {
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
  async getParkingLotsWithBayType(bayType: string): Promise<string[]> {
    try {
      const cacheKey = `parking_lots_with_bay_type_${bayType}`;
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
              // Don't filter out temporary parking lots for zone filtering
              parkingLots.add(cleanedParkingLot);
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
      const result = await this.parkingLayer.queryFeatures(query);
      
      if (!result.features) {
        throw new FeatureQueryError(
          'No features returned from parking lots query',
          this.parkingLayer.id
        );
      }

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
      const result = await this.parkingLayer.queryFeatures(query);
      
      if (!result.features) {
        throw new FeatureQueryError(
          'No features returned from monitored carparks query',
          this.parkingLayer.id
        );
      }

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
      const parkingResult = await this.parkingLayer.queryFeatures(parkingQuery);
      
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

      // Initialize counts
      const totalCounts: { [key: string]: number } = {};
      const monitoredCounts: { [key: string]: number } = {};
      const individualBayClosedCounts: { [key: string]: number } = {};
      const parkingLotCounts: { [key: string]: { [key: string]: number } } = {};

      // Process all features from both layers
      const allFeatures = [...underBaysFeatures, ...baysFeatures];
      
      logger.info(`Processing ${allFeatures.length} total features`, 'MapService');
      
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
          const bayType = this.cleanString(attributes.baytype || 'Unknown');
          const bayStatus = this.cleanString(String(attributes.status || 'Open'));
          
          // Update total counts
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
      return this.cachedParkingLotCounts[cleanedParkingLot] || [];
    } catch (error) {
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
        const bayType = this.cleanString(attributes.baytype || 'Unknown');
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

  getTotalBayCounts(): { [key: string]: number } {
    return this.cachedTotalCounts;
  }

  getMonitoredBayCounts(): { [key: string]: number } {
    return this.cachedMonitoredCounts;
  }

  getIndividualBayClosedCounts(): { [key: string]: number } {
    return this.cachedIndividualBayClosedCounts;
  }

  // Method to verify bay layer fields and log available fields
  async verifyBayLayerFields(): Promise<void> {
    try {
      if (!this.underBaysLayer || !this.baysLayer) {
        console.warn('Bay layers not initialized');
        return;
      }

      // Load layer info to get field information
      await Promise.all([
        this.underBaysLayer.load(),
        this.baysLayer.load()
      ]);

      console.log('UnderBays Layer Fields:', this.underBaysLayer.fields?.map(f => f.name));
      console.log('Bays Layer Fields:', this.baysLayer.fields?.map(f => f.name));

      // Check if baytype field exists
      const underBaysHasBayType = this.underBaysLayer.fields?.some(f => f.name === 'baytype');
      const baysHasBayType = this.baysLayer.fields?.some(f => f.name === 'baytype');

      console.log('UnderBays has baytype field:', underBaysHasBayType);
      console.log('Bays has baytype field:', baysHasBayType);

      if (!underBaysHasBayType || !baysHasBayType) {
        console.warn('baytype field not found in one or both bay layers');
        return;
      }

      // Query sample data to see what baytype values exist
      const sampleQuery = this.underBaysLayer.createQuery();
      sampleQuery.returnGeometry = false;
      sampleQuery.outFields = ['baytype'];
      sampleQuery.where = '1=1';
      sampleQuery.num = 10; // Get first 10 features

      const sampleResult = await this.underBaysLayer.queryFeatures(sampleQuery);
      const bayTypes = [...new Set(sampleResult.features.map(f => f.attributes.baytype))];
      console.log('Sample baytype values:', bayTypes);

    } catch (error) {
      console.error('Error verifying bay layer fields:', error);
    }
  }

  // Method to test bay type filtering
  async testBayTypeFiltering(bayType: string): Promise<void> {
    try {
      const bayLayers = this.getWebMapBayLayers();
      
      if (bayLayers.length === 0) {
        console.warn('No bay layers found in webmap');
        return;
      }

      console.log(`Testing bay type filtering for: ${bayType}`);
      console.log(`Found ${bayLayers.length} bay layers in webmap`);

      // Check layer visibility
      bayLayers.forEach((layer, index) => {
        console.log(`Layer ${index} visible:`, layer.visible);
        console.log(`Layer ${index} fields:`, layer.fields?.map(f => f.name));
      });

      // Ensure layers are visible
      bayLayers.forEach(layer => {
        layer.visible = true;
      });

      // Get total count before filtering
      const totalCounts = await Promise.all(
        bayLayers.map(async layer => {
          const query = layer.createQuery();
          query.where = '1=1';
          query.returnGeometry = false;
          query.outFields = ['baytype'];
          const result = await layer.queryFeatures(query);
          return result.features.length;
        })
      );

      console.log(`Total features before filtering:`, totalCounts);

      // Set definition expression
      const definitionExpression = `baytype = '${bayType}'`;
      bayLayers.forEach(layer => {
        layer.definitionExpression = definitionExpression;
      });

      // Wait a moment for the filter to take effect
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Query to see how many features match after filtering
      const filteredCounts = await Promise.all(
        bayLayers.map(async layer => {
          const query = layer.createQuery();
          query.where = '1=1'; // Query all visible features
          query.returnGeometry = false;
          query.outFields = ['baytype'];
          const result = await layer.queryFeatures(query);
          return result.features.length;
        })
      );

      console.log(`Features after filtering for ${bayType}:`, filteredCounts);

      // Clear the filter
      bayLayers.forEach(layer => {
        layer.definitionExpression = "";
      });

      console.log('Test completed - filter cleared');
    } catch (error) {
      console.error('Error testing bay type filtering:', error);
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
      // Disable automatic feature unloading during navigation
      view.watch('zoom', (newZoom: number) => {
        // No longer optimizing layer visibility based on zoom
        logger.debug(`Zoom level changed to: ${newZoom}`, 'MapService');
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
      // Ensure all layers maintain their features
      view.map.layers.forEach(layer => {
        if (layer instanceof FeatureLayer) {
          // Force persistence
          layer.persistenceEnabled = true;
          
          // Additional properties to prevent unloading
          (layer as any).loadAllFeatures = true;
          (layer as any).disableClientCaching = false;
        }
      });
    } catch (error) {
      logger.warn('Failed to prevent feature unloading', 'MapService', error instanceof Error ? error : undefined);
    }
  }

  // Preload all features to prevent unloading issues
  async preloadAllFeatures(): Promise<void> {
    try {
      logger.info('Preloading all features to prevent unloading', 'MapService');
      
      // Get all feature layers from the webmap and our additional layers
      const allLayers: FeatureLayer[] = [];
      
      // Add our additional layers
      if (this.parkingLayer) allLayers.push(this.parkingLayer);
      if (this.underBaysLayer) allLayers.push(this.underBaysLayer);
      if (this.baysLayer) allLayers.push(this.baysLayer);
      
      // Add all webmap layers
      if (this.view) {
        this.view.map.layers.forEach(layer => {
          if (layer instanceof FeatureLayer) {
            allLayers.push(layer);
          }
        });
      }
      
      for (const layer of allLayers) {
        try {
          // Query all features to ensure they're loaded in memory
          const query = layer.createQuery();
          query.where = '1=1';
          query.returnGeometry = false;
          query.outFields = ['*'];
          
          const result = await layer.queryFeatures(query);
          logger.debug(`Preloaded ${result.features.length} features from layer ${layer.id}`, 'MapService');
        } catch (error) {
          logger.warn(`Failed to preload features from layer ${layer.id}`, 'MapService', error instanceof Error ? error : undefined);
        }
      }
      
      logger.info('Feature preloading completed', 'MapService');
    } catch (error) {
      logger.error('Failed to preload features', 'MapService', error instanceof Error ? error : undefined);
    }
  }

  // Configure all webmap layers to prevent unloading
  private configureWebMapLayers(view: MapView): void {
    try {
      logger.info('Configuring webmap layers with minimal settings', 'MapService');
      
      // Configure all layers in the webmap with minimal settings
      view.map.layers.forEach(layer => {
        if (layer instanceof FeatureLayer) {
          // Only set basic persistence, don't override other properties
          layer.persistenceEnabled = true;
          
          logger.debug(`Configured layer ${layer.id} with minimal persistence`, 'MapService');
        }
      });
      
      logger.info('Webmap layers configured successfully', 'MapService');
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
      const result = await this.parkingLayer.queryFeatures(query);
      
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
