import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import esriConfig from "@arcgis/core/config";
import { ARCGIS_CONFIG, ERROR_MESSAGES } from '../constants';
import { logger } from '../utils/logger';
import { MapServiceError, LayerInitializationError } from '../utils/errors';

export class MapInitializationService {
  private static instance: MapInitializationService;

  private constructor() {
    const portalUrl = process.env.NEXT_PUBLIC_ARCGIS_PORTAL_URL;
    if (!portalUrl) {
      throw new MapServiceError('ARCGIS_PORTAL_URL environment variable is not set');
    }
    esriConfig.portalUrl = portalUrl;
  }

  public static getInstance(): MapInitializationService {
    if (!MapInitializationService.instance) {
      MapInitializationService.instance = new MapInitializationService();
    }
    return MapInitializationService.instance;
  }

  async initializeMap(container: HTMLDivElement): Promise<MapView> {
    try {
      const webmapId = process.env.NEXT_PUBLIC_ARCGIS_WEBMAP_ID;
      if (!webmapId) {
        throw new MapServiceError('ARCGIS_WEBMAP_ID environment variable is not set');
      }

      logger.info('Initializing map view', 'MapInitializationService');

      // Create the map view
      const view = new MapView({
        container,
        center: ARCGIS_CONFIG.DEFAULT_CENTER,
        zoom: ARCGIS_CONFIG.DEFAULT_ZOOM,
        popupEnabled: false
      });

      // Create and load the webmap
      const webmap = new WebMap({
        portalItem: {
          id: webmapId
        }
      });

      await webmap.load();
      view.map = webmap;
      await view.when();

      logger.info('Map view initialized successfully', 'MapInitializationService');
      return view;
    } catch (error) {
      logger.error(ERROR_MESSAGES.MAP_INITIALIZATION, 'MapInitializationService', error instanceof Error ? error : undefined);
      throw new MapServiceError(ERROR_MESSAGES.MAP_INITIALIZATION, error instanceof Error ? error : undefined);
    }
  }

  async initializeParkingLayer(view: MapView): Promise<FeatureLayer> {
    try {
      logger.info('Initializing parking layer', 'MapInitializationService');

      const parkingLayer = new FeatureLayer({
        url: ARCGIS_CONFIG.PARKING_LAYER_URL
      });

      await parkingLayer.load();
      if (view.map) {
        view.map.add(parkingLayer);
      } else {
        throw new MapServiceError('Map is not initialized');
      }

      logger.info('Parking layer initialized successfully', 'MapInitializationService');
      return parkingLayer;
    } catch (error) {
      logger.error(ERROR_MESSAGES.LAYER_LOADING, 'MapInitializationService', error instanceof Error ? error : undefined);
      throw new LayerInitializationError('Failed to initialize parking layer', 'parking', error instanceof Error ? error : undefined);
    }
  }

  async initializeBayLayers(view: MapView): Promise<{ underBaysLayer: FeatureLayer; baysLayer: FeatureLayer }> {
    try {
      logger.info('Initializing bay layers', 'MapInitializationService');

      const underBaysLayer = new FeatureLayer({
        url: "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/2"
      });

      const baysLayer = new FeatureLayer({
        url: "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/3"
      });

      await Promise.all([
        underBaysLayer.load(),
        baysLayer.load()
      ]);

      if (view.map) {
        view.map.add(underBaysLayer);
        view.map.add(baysLayer);
      } else {
        throw new MapServiceError('Map is not initialized');
      }

      logger.info('Bay layers initialized successfully', 'MapInitializationService');
      return { underBaysLayer, baysLayer };
    } catch (error) {
      logger.error(ERROR_MESSAGES.LAYER_LOADING, 'MapInitializationService', error instanceof Error ? error : undefined);
      throw new LayerInitializationError('Failed to initialize bay layers', 'bays', error instanceof Error ? error : undefined);
    }
  }
} 