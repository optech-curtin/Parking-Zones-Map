import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import esriConfig from "@arcgis/core/config";
import { CacheService } from './CacheService';

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
  private featuresLoaded = false;
  private cachedFeatures: { [key: string]: __esri.Graphic[] } = {};
  private cachedTotalCounts: { [key: string]: number } = {};
  private cachedMonitoredCounts: { [key: string]: number } = {};
  private cachedParkingLotCounts: { [key: string]: BayTypeCount[] } = {};
  private cacheService: CacheService;
  private readonly PAGE_SIZE = 1000;

  constructor() {
    const portalUrl = process.env.NEXT_PUBLIC_ARCGIS_PORTAL_URL;
    if (!portalUrl) {
      throw new MapServiceError('ARCGIS_PORTAL_URL environment variable is not set');
    }
    esriConfig.portalUrl = portalUrl;
    this.cacheService = CacheService.getInstance();
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

  // Helper function to query features with pagination
  private async queryFeaturesWithPagination(
    layer: FeatureLayer,
    query: __esri.Query,
    pageSize: number = this.PAGE_SIZE
  ): Promise<__esri.Graphic[]> {
    const cacheKey = `query_${layer.id}_${JSON.stringify(query)}`;
    const cachedResult = this.cacheService.get<__esri.Graphic[]>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    let allFeatures: __esri.Graphic[] = [];
    let hasMore = true;
    let start = 0;

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
    return allFeatures;
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

      // Create the map view first
      const view = new MapView({
        container,
        center: [115.894, -32.005],
        zoom: 14,
        popupEnabled: false
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

      // Initialize parking layer
      await this.initializeParkingLayer(view);

      this.view = view;
      return view;
    } catch (error) {
      throw new MapServiceError(
        'Failed to initialize map',
        error instanceof Error ? error : undefined
      );
    }
  }

  private async initializeParkingLayer(view: MapView): Promise<void> {
    try {
      // Get the existing parking layer from the WebMap
      const parkingLayer = view.map.layers.find(layer => {
        if (!(layer instanceof FeatureLayer)) return false;
        const featureLayer = layer as FeatureLayer;
        return typeof featureLayer.url === 'string' && featureLayer.url.startsWith(PARKING_LAYER_URL);
      }) as FeatureLayer;

      if (!parkingLayer) {
        // Create a new parking layer if not found in WebMap
        const newParkingLayer = new FeatureLayer({
          url: PARKING_LAYER_URL,
          outFields: ['Zone', 'status', 'isMonitored']
        });
        
        try {
          await newParkingLayer.load();
          view.map.add(newParkingLayer);
          newParkingLayer.id = "parkingLayer";
          this.parkingLayer = newParkingLayer;
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
        this.parkingLayer = parkingLayer;
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

  getView(): MapView | null {
    return this.view;
  }

  getParkingLayer(): FeatureLayer | null {
    return this.parkingLayer;
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

      const underBaysLayer = new FeatureLayer({
        url: "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays_Under/FeatureServer/0",
        outFields: ['*']
      });

      const baysLayer = new FeatureLayer({
        url: "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays/FeatureServer/0",
        outFields: ['*']
      });

      await Promise.all([
        underBaysLayer.load(),
        baysLayer.load()
      ]);

      const [underBaysFeatures, baysFeatures] = await Promise.all([
        this.queryAllFeatures(underBaysLayer),
        this.queryAllFeatures(baysLayer)
      ]);

      // Initialize counts
      const totalCounts: { [key: string]: number } = {};
      const monitoredCounts: { [key: string]: number } = {};
      const parkingLotCounts: { [key: string]: { [key: string]: number } } = {};

      // Process all features from both layers
      const allFeatures = [...underBaysFeatures, ...baysFeatures];
      
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
          
          // Update total counts
          totalCounts[bayType] = (totalCounts[bayType] || 0) + 1;
          
          // Update monitored counts if the parking lot is monitored
          if (isParkingLotMonitored) {
            monitoredCounts[bayType] = (monitoredCounts[bayType] || 0) + 1;
          }
          
          // Update parking lot counts
          parkingLotCounts[parkingLot][bayType] = (parkingLotCounts[parkingLot][bayType] || 0) + 1;
        });
      });

      // Cache the counts
      this.cachedTotalCounts = totalCounts;
      this.cachedMonitoredCounts = monitoredCounts;
      
      // Convert parking lot counts to BayTypeCount arrays
      Object.entries(parkingLotCounts).forEach(([lot, counts]) => {
        this.cachedParkingLotCounts[lot] = Object.entries(counts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count);
      });

      this.featuresLoaded = true;
    } catch (error) {
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

  private async ensureFeaturesLoaded(): Promise<void> {
    if (!this.featuresLoaded) {
      await this.loadAndProcessFeatures();
    }
  }
}
