import { useEffect, useRef, useState, useCallback, useMemo, useLayoutEffect } from 'react';
import { MapService } from '../services/MapService';
import { useParking } from '../context/ParkingContext';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import type { ParkingFeatureAttributes, BayFeatureAttributes } from '../types';
import { debounce } from '../utils/debounce';
import { logger } from '../utils/logger';
import { performanceMonitor } from '../utils/performance';

const PARKING_LAYER_URL = "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/4";

export function useMap(mapDivRef: React.RefObject<HTMLDivElement | null>) {
  const mapServiceRef = useRef<MapService | null>(null);
  const bayHighlightGraphicRef = useRef<__esri.Graphic | null>(null);
  const isInitializedRef = useRef(false);
  const clickHandlerRef = useRef<__esri.Handle | null>(null);
  const [isRefReady, setIsRefReady] = useState(false);
  
  // UI State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isZoneInfoMinimized, setIsZoneInfoMinimized] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBayTypeFilter, setSelectedBayTypeFilter] = useState<string | null>(null);
  const [parkingLotsWithSelectedBayType, setParkingLotsWithSelectedBayType] = useState<string[]>([]);
  const [isBayTypeFilterLoading, setIsBayTypeFilterLoading] = useState(false);
  
  // Filter State - memoized to prevent unnecessary re-renders
  const [filters, setFilters] = useState({ 
    monitoredCarparks: false,
    paygZones: false,
    baysInCap: false
  });

  const { 
    state: { 
      highlightedParkingLot,
      carparkStatus,
      monitoredCarparks,
      bayColors
    },
    setSelectedParkingLot,
    setHighlightedParkingLot,
    setSelectedBay,
    setHighlightedBay,
    setSelectedBayAttributes,
    setBayTypeCounts,
    setParkingLots,
    setMonitoredCarparks,
    setIsLoading,
    setSelectedBayCounts,
    setSelectedClosedBayCounts,
    setTotalBayCounts,
    setMonitoredBayCounts,
    setFilteredTotalBayCounts,
    setFilteredMonitoredBayCounts,
    setIndividualBayClosedCounts,
    setError,
    setClosedBayCounts,
    setLoadingProgress
  } = useParking();

  // Memoized state setters to prevent unnecessary re-renders
  const stateSetters = useMemo(() => ({
    setSelectedParkingLot,
    setHighlightedParkingLot,
    setSelectedBay,
    setHighlightedBay,
    setSelectedBayAttributes,
    setBayTypeCounts,
    setParkingLots,
    setMonitoredCarparks,
    setIsLoading,
    setSelectedBayCounts,
    setSelectedClosedBayCounts,
    setTotalBayCounts,
    setMonitoredBayCounts,
    setFilteredTotalBayCounts,
    setFilteredMonitoredBayCounts,
    setIndividualBayClosedCounts,
    setError,
    setClosedBayCounts,
    setLoadingProgress
  }), [
    setSelectedParkingLot,
    setHighlightedParkingLot,
    setSelectedBay,
    setHighlightedBay,
    setSelectedBayAttributes,
    setBayTypeCounts,
    setParkingLots,
    setMonitoredCarparks,
    setIsLoading,
    setSelectedBayCounts,
    setSelectedClosedBayCounts,
    setTotalBayCounts,
    setMonitoredBayCounts,
    setFilteredTotalBayCounts,
    setFilteredMonitoredBayCounts,
    setIndividualBayClosedCounts,
    setError,
    setClosedBayCounts,
    setLoadingProgress
  ]);

  // Memoized UI state handlers
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const toggleZoneInfo = useCallback(() => setIsZoneInfoMinimized(prev => !prev), []);
  const toggleFilter = useCallback(() => setIsFilterOpen(prev => !prev), []);

  // Function to highlight a bay using the graphic's geometry directly (fixes offset issues)
  const highlightBayWithGeometry = useCallback(async (bayGraphic: __esri.Graphic) => {
    const view = mapServiceRef.current?.getView();
    if (!view || !bayGraphic.geometry) return;

    // Remove previous highlight
    if (bayHighlightGraphicRef.current) {
      view.graphics.remove(bayHighlightGraphicRef.current);
      bayHighlightGraphicRef.current = null;
    }

    try {
      const highlightSymbol = {
        type: "simple-fill" as const,
        color: [0, 255, 255, 0.3], // Cyan highlight - same as parking lot selection
        outline: {
          color: [0, 255, 255, 1], // Solid cyan outline - same as parking lot selection
          width: 3
        }
      };

      const highlightGraphic = new (await import('@arcgis/core/Graphic')).default({
        geometry: bayGraphic.geometry,
        symbol: highlightSymbol
      });

      view.graphics.add(highlightGraphic);
      bayHighlightGraphicRef.current = highlightGraphic;
    } catch (error) {
      logger.error('Error highlighting bay with geometry', 'useMap', error instanceof Error ? error : undefined);
    }
  }, []);

  // Debounced parking lot selection for better performance
  const debouncedHandleSelectParkingLot = useMemo(
    () => debounce(async (...args: unknown[]) => {
      const [parkingLot, shouldZoom = false] = args as [string, boolean];
      const cleanedParkingLot = mapServiceRef.current?.cleanString(parkingLot);
      if (!cleanedParkingLot) return;

      const { setSelectedParkingLot, setHighlightedParkingLot, setSelectedBayCounts, setSelectedClosedBayCounts, setError } = stateSetters;
      setSelectedParkingLot(cleanedParkingLot);
      setHighlightedParkingLot(cleanedParkingLot);

      try {
        const [selectedBays, selectedClosedBays] = await Promise.all([
          mapServiceRef.current?.getSelectedParkingLotBays(cleanedParkingLot),
          mapServiceRef.current?.getSelectedParkingLotClosedBays(cleanedParkingLot)
        ]);
        
        if (selectedBays) {
          setSelectedBayCounts(selectedBays);
        }
        
        if (selectedClosedBays) {
          setSelectedClosedBayCounts(selectedClosedBays);
        }

        if (shouldZoom) {
          const parkingLayer = new FeatureLayer({
            url: PARKING_LAYER_URL
          });

          const query = parkingLayer.createQuery();
          query.where = `Zone = '${cleanedParkingLot}'`;
          query.returnGeometry = true;
          
          const result = await parkingLayer.queryFeatures(query);
          
          if (result.features.length > 0) {
            const view = mapServiceRef.current?.getView();
            if (view) {
              const geometry = result.features[0].geometry;
              if (geometry) {
                // Use a more robust navigation approach to prevent interruption
                view.goTo({
                  target: geometry,
                  padding: {
                    top: 150,
                    bottom: 150,
                    left: 150,
                    right: 150
                  }
                }).catch((error) => {
                  // Ignore interruption errors as they're expected when multiple operations occur
                  if (error.name !== 'view:goto-interrupted') {
                    logger.warn('Navigation error:', error);
                  }
                });
              }
            }
          }
        }
      } catch (error) {
        logger.error('Error handling parking lot selection', 'useMap', error instanceof Error ? error : undefined);
        setError(error instanceof Error ? error : new Error('Failed to handle parking lot selection'));
      }
    }, 150), // 150ms debounce for better performance
    [stateSetters]
  );

  const handleSelectParkingLot = useCallback((parkingLot: string, shouldZoom: boolean = false) => {
    debouncedHandleSelectParkingLot(parkingLot, shouldZoom);
  }, [debouncedHandleSelectParkingLot]);

  const handleBayTypeSelect = useCallback(async (bayType: string) => {
    try {
      if (selectedBayTypeFilter === bayType) {
        // Clear filter
        setSelectedBayTypeFilter(null);
        setParkingLotsWithSelectedBayType([]);
        await mapServiceRef.current?.filterWebMapBayLayers(null);
      } else {
        // Apply filter
        setIsBayTypeFilterLoading(true);
        setSelectedBayTypeFilter(bayType);
        
        // Find parking lots with this bay type
        // Filter out temporary parking lots when "Bays in Cap" filter is active
        const parkingLotsWithBayType = await mapServiceRef.current?.getParkingLotsWithBayType(bayType, filters.baysInCap) || [];
        setParkingLotsWithSelectedBayType(parkingLotsWithBayType);
        
        // Apply filter to map layers
        await mapServiceRef.current?.filterWebMapBayLayers(bayType);
      }
    } catch (error) {
      logger.error('Error handling bay type selection', 'useMap', error instanceof Error ? error : undefined);
      setError(error instanceof Error ? error : new Error('Failed to handle bay type selection'));
    } finally {
      setIsBayTypeFilterLoading(false);
    }
  }, [selectedBayTypeFilter, setError, filters.baysInCap]);

  // Optimized click handler with better performance
  const setupClickHandler = useCallback((view: __esri.MapView) => {
    logger.debug('Setting up click handler for view', 'useMap');
    
    // Remove existing click handler if any
    if (clickHandlerRef.current) {
      clickHandlerRef.current.remove();
    }

    // Create optimized click handler
    clickHandlerRef.current = view.on('click', async (event) => {
      logger.info('Click event received', 'useMap');
      
      // Start pan/zoom performance timer
      performanceMonitor.startTimer('pan-zoom');
      
      try {
        const parkingLayer = mapServiceRef.current?.getParkingLayer();
        const underBaysLayer = mapServiceRef.current?.getUnderBaysLayer();
        const baysLayer = mapServiceRef.current?.getBaysLayer();
        
        logger.debug(`Layers found - Parking: ${!!parkingLayer}, UnderBays: ${!!underBaysLayer}, Bays: ${!!baysLayer}`, 'useMap');
        if (underBaysLayer) {
          logger.debug(`UnderBays layer title: ${underBaysLayer.title || 'Unknown'}`, 'useMap');
        }
        if (baysLayer) {
          logger.debug(`Bays layer title: ${baysLayer.title || 'Unknown'}`, 'useMap');
        }
        
        // Debug layer information (only in development)
        if (process.env.NODE_ENV === 'development' && view.map) {
          const mapLayers = view.map.layers.toArray();
          const bayLayers = mapLayers.filter(layer => 
            layer.title && layer.title.toLowerCase().includes('bay')
          );
          logger.debug(`Map has ${mapLayers.length} layers, ${bayLayers.length} bay-related`, 'useMap');
        }
        
        if (!parkingLayer) {
          logger.error('Parking layer not available for click handling', 'useMap');
          return;
        }

        const response = await view.hitTest(event);
        
        logger.debug(`Hit test response results: ${response.results.length}`, 'useMap');
        
        // Define zoom threshold for bay interaction
        const BAY_INTERACTION_ZOOM = 19;
        
        logger.debug(`Current zoom level: ${view.zoom}, Threshold: ${BAY_INTERACTION_ZOOM}`, 'useMap');
        logger.debug(`Zoom level comparison: ${view.zoom} >= ${BAY_INTERACTION_ZOOM} = ${view.zoom >= BAY_INTERACTION_ZOOM}`, 'useMap');
        
        if (view.zoom >= BAY_INTERACTION_ZOOM) {
          logger.info(`High zoom level (${view.zoom}) - looking for bay features`, 'useMap');
          logger.info(`Response results count: ${response.results.length}`, 'useMap');
          logger.debug(`About to check each result for bay layers...`, 'useMap');
          
          // At high zoom levels, ONLY interact with bay layers
          logger.debug(`Looking for bay features in ${response.results.length} results`, 'useMap');
          
          // Debug bay layer detection (only in development)
          if (process.env.NODE_ENV === 'development') {
            response.results.forEach((result, index) => {
              if ('graphic' in result) {
                const layer = result.graphic.layer;
                const layerTitle = layer?.title || 'Unknown';
                const layerTitleLower = layerTitle.toLowerCase();
                const isUnderBays = layer === underBaysLayer || 
                                   layerTitleLower.includes('bays under') || 
                                   layerTitleLower.includes('bay under');
                const isBays = layer === baysLayer || 
                              (layerTitleLower.includes('bay') && !layerTitleLower.includes('under') && !layerTitleLower.includes('lot'));
                if (isBays || isUnderBays) {
                  logger.debug(`Result ${index}: Layer = ${layerTitle}, isUnderBays = ${isUnderBays}, isBays = ${isBays}`, 'useMap');
                }
              }
            });
          }
          
          const bayFeature = response.results.find(
            (result) => 'graphic' in result && 
            (() => {
              const layer = result.graphic?.layer;
              const layerTitle = layer?.title || '';
              const layerTitleLower = layerTitle.toLowerCase();
              const isExactUnderBays = layer === underBaysLayer;
              const isExactBays = layer === baysLayer;
              const isTitleUnderBays = layerTitleLower.includes('bays under') || layerTitleLower.includes('bay under');
              const isTitleBays = layerTitleLower.includes('bay') && !layerTitleLower.includes('under') && !layerTitleLower.includes('lot');
              
              // Only log if it's a bay layer or in development
              if (isTitleBays || isTitleUnderBays || process.env.NODE_ENV === 'development') {
                logger.debug(`Checking layer: ${layerTitle}, isExactUnderBays=${isExactUnderBays}, isExactBays=${isExactBays}, isTitleUnderBays=${isTitleUnderBays}, isTitleBays=${isTitleBays}`, 'useMap');
              }
              
              return isExactUnderBays || isExactBays || isTitleUnderBays || isTitleBays;
            })()
          );
          
          logger.debug(`Bay feature found: ${!!bayFeature}`, 'useMap');
          if (bayFeature && 'graphic' in bayFeature) {
            logger.debug(`Bay feature layer: ${bayFeature.graphic.layer?.title || 'Unknown'}`, 'useMap');
          }

          if (bayFeature && 'graphic' in bayFeature) {
            const attributes = bayFeature.graphic.attributes as BayFeatureAttributes;
            
            // Validate attributes before processing
            if (!attributes.objectid) {
              logger.error('Missing objectid in bay attributes', 'useMap');
              return;
            }
            
            // Create a bay ID for display purposes
            // Extract parking lot from parkaid_zone for the bay ID
            let parkingLotForId = 'Unknown';
            if (attributes.parkaid_zone && typeof attributes.parkaid_zone === 'string') {
              const zoneParts = attributes.parkaid_zone.split('-');
              if (zoneParts.length >= 2) {
                parkingLotForId = zoneParts[1]; // Get the middle part (PE3 in this case)
              }
            }
            const bayId = `${parkingLotForId}_${attributes.baytype || 'Unknown'}_${attributes.objectid}`;
            
            logger.debug(`Setting selected bay: ${bayId}`, 'useMap');
            logger.debug(`Bay attributes: ${JSON.stringify(attributes)}`, 'useMap');
            
            // Set selected and highlighted bay
            setSelectedBay(bayId);
            setHighlightedBay(bayId);
            
            // Store bay attributes for display
            setSelectedBayAttributes(attributes);
            
            // Highlight the specific bay using the clicked graphic's geometry directly
            await highlightBayWithGeometry(bayFeature.graphic);
            
            // Clear parking lot highlight since we're highlighting a bay instead
            setHighlightedParkingLot('');
            
            // Set the parking lot context but DON'T highlight the parking lot
            // Extract parking lot from parkaid_zone (e.g., "BEN-PH1-Yellow" -> "PH1")
            let parkingLot = 'Unknown';
            if (attributes.parkaid_zone && typeof attributes.parkaid_zone === 'string') {
              const zoneParts = attributes.parkaid_zone.split('-');
              if (zoneParts.length >= 2) {
                parkingLot = zoneParts[1]; // Get the middle part (PH1 in this case)
              }
            }
            parkingLot = mapServiceRef.current?.cleanString(parkingLot) || parkingLot;
            if (parkingLot) {
              setSelectedParkingLot(parkingLot);
              
              const [selectedBays, selectedClosedBays] = await Promise.all([
                mapServiceRef.current?.getSelectedParkingLotBays(parkingLot),
                mapServiceRef.current?.getSelectedParkingLotClosedBays(parkingLot)
              ]);
              
              if (selectedBays) {
                setSelectedBayCounts(selectedBays);
              }
              
              if (selectedClosedBays) {
                setSelectedClosedBayCounts(selectedClosedBays);
              }
            }
          } else {
            logger.debug('No bay feature found at high zoom, clearing bay selection', 'useMap');
            // At high zoom, if no bay was clicked, clear everything
            setSelectedBay(null);
            setHighlightedBay(null);
            setSelectedBayAttributes(null);
            setSelectedParkingLot('');
            setHighlightedParkingLot('');
            setSelectedBayCounts([]);
            setSelectedClosedBayCounts({});
            
            // Remove bay highlight
            if (bayHighlightGraphicRef.current) {
              view.graphics.remove(bayHighlightGraphicRef.current);
              bayHighlightGraphicRef.current = null;
            }
          }
        } else {
          // At low zoom levels, only interact with parking lots
          const nonBayResults = response.results.filter(
            (result) => 'graphic' in result && 
            (() => {
              const layer = result.graphic?.layer;
              const layerTitle = layer?.title || '';
              const layerTitleLower = layerTitle.toLowerCase();
              const isUnderBays = layer === underBaysLayer || 
                                 layerTitleLower.includes('bays under') || 
                                 layerTitleLower.includes('bay under');
              const isBays = layer === baysLayer || 
                            (layerTitleLower.includes('bay') && !layerTitleLower.includes('under') && !layerTitleLower.includes('lot'));
              return !isUnderBays && !isBays;
            })()
          );
          
          const parkingFeature = nonBayResults.find(
            (result) => 'graphic' in result && result.graphic?.layer === parkingLayer
          );

          logger.info(`Click handler - Zoom level: ${view.zoom}, Found parking feature: ${!!parkingFeature}`, 'useMap');

          if (parkingFeature && 'graphic' in parkingFeature) {
            const attributes = parkingFeature.graphic.attributes as ParkingFeatureAttributes;
            const rawParkingLot = attributes.Zone || 'Unknown';
            const parkingLot = mapServiceRef.current?.cleanString(rawParkingLot);
            
            logger.info(`Click handler - Raw parking lot: "${rawParkingLot}", Cleaned: "${parkingLot}"`, 'useMap');
            
            if (parkingLot) {
              logger.info(`Selecting parking lot: ${parkingLot}`, 'useMap');
              
              setSelectedParkingLot(parkingLot);
              setHighlightedParkingLot(parkingLot);
              
              const [selectedBays, selectedClosedBays] = await Promise.all([
                mapServiceRef.current?.getSelectedParkingLotBays(parkingLot),
                mapServiceRef.current?.getSelectedParkingLotClosedBays(parkingLot)
              ]);
              
              logger.debug(`Selected bays: ${JSON.stringify(selectedBays)}`, 'useMap');
              logger.debug(`Selected closed bays: ${JSON.stringify(selectedClosedBays)}`, 'useMap');
              
              if (selectedBays) {
                setSelectedBayCounts(selectedBays);
              }
              
              if (selectedClosedBays) {
                setSelectedClosedBayCounts(selectedClosedBays);
              }
            }
          } else {
            logger.info('No parking feature found, clearing selection', 'useMap');
            setSelectedParkingLot('');
            setHighlightedParkingLot('');
            setSelectedBayCounts([]);
            setSelectedClosedBayCounts({});
          }
          
          // Clear bay selection at low zoom
          setSelectedBay(null);
          setHighlightedBay(null);
          setSelectedBayAttributes(null);
          
          // Remove bay highlight
          if (bayHighlightGraphicRef.current) {
            view.graphics.remove(bayHighlightGraphicRef.current);
            bayHighlightGraphicRef.current = null;
          }
        }
      } catch (error) {
        logger.error('Error in click handler', 'useMap', error instanceof Error ? error : undefined);
      } finally {
        // Record pan/zoom performance time
        const panZoomTime = performanceMonitor.endTimer('pan-zoom');
        performanceMonitor.recordPanZoomTime(panZoomTime);
      }
    });
  }, [setSelectedBay, setHighlightedBay, setSelectedBayAttributes, setHighlightedParkingLot, setSelectedParkingLot, setSelectedBayCounts, setSelectedClosedBayCounts, highlightBayWithGeometry]);

  // Optimized initialization function
  const initializeMapAndData = useCallback(async () => {
    if (isInitializedRef.current) {
      logger.debug('Map already initialized, skipping', 'useMap');
      return;
    }

    try {
      setIsLoading(true);
      
      // Start performance monitoring
      performanceMonitor.startTimer('total-initialization');
      
      // Update loading progress
      setLoadingProgress({
        phase: 'loading-map',
        progress: 10,
        message: 'Initializing map service...'
      });
      
      // Check environment variables
      const webmapId = process.env.NEXT_PUBLIC_ARCGIS_WEBMAP_ID;
      const portalUrl = process.env.NEXT_PUBLIC_ARCGIS_PORTAL_URL;

      if (!webmapId || !portalUrl) {
        throw new Error(
          `Missing required environment variables: ${
            !webmapId ? 'NEXT_PUBLIC_ARCGIS_WEBMAP_ID ' : ''
          }${
            !portalUrl ? 'NEXT_PUBLIC_ARCGIS_PORTAL_URL' : ''
          }`
        );
      }

      logger.info('Initializing map service', 'useMap');

      setLoadingProgress({
        phase: 'loading-map',
        progress: 20,
        message: 'Creating map service...'
      });

      // Start map initialization timer
      performanceMonitor.startTimer('map-initialization');

      // Initialize map service
      logger.debug('Creating new MapService instance', 'useMap');
      const mapService = new MapService();
      mapServiceRef.current = mapService;
      logger.debug('MapService instance created successfully', 'useMap');

      setLoadingProgress({
        phase: 'loading-map',
        progress: 30,
        message: 'Initializing map view...'
      });

      // Initialize the map
      if (!mapDivRef.current) {
        throw new Error('Map container ref is not available');
      }
      const view = await mapService.initializeMap(mapDivRef.current);
      
      // Record map initialization time
      const mapInitTime = performanceMonitor.endTimer('map-initialization');
      performanceMonitor.recordMapInitializationTime(mapInitTime);

      setLoadingProgress({
        phase: 'loading-layers',
        progress: 40,
        message: 'Loading map layers...'
      });
      logger.debug('[useMap] Starting feature loading phase (40%)', 'useMap');

      // Start layer loading timer
      performanceMonitor.startTimer('layer-loading');

      // Helper function to add timeout to promises
      const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
          )
        ]);
      };

      // Load and process features with timeout - make it non-blocking
      // Use shorter timeout since CORS errors will block immediately
      const FEATURE_LOAD_TIMEOUT = 45000; // 45 seconds timeout (reduced from 2 minutes)
      
      logger.debug(`[useMap] Starting loadAndProcessFeatures with ${FEATURE_LOAD_TIMEOUT}ms timeout`, 'useMap');
      
      // Start feature loading in background - don't block on it
      const featureLoadPromise = withTimeout(
        mapService.loadAndProcessFeatures(),
        FEATURE_LOAD_TIMEOUT,
        'Feature loading timed out. The server may be experiencing CORS or timeout issues.'
      ).catch(error => {
        logger.error('Feature loading failed or timed out', 'useMap', error);
        console.warn('[useMap] Feature loading failed. The map will continue with limited functionality:', error.message || error);
        return null; // Don't throw, just return null
      });

      // Non-critical operations with shorter timeouts - don't wait for these
      logger.debug('[useMap] Starting non-critical operations (field verification, filtering test)', 'useMap');
      Promise.allSettled([
        withTimeout(
          mapService.verifyBayLayerFields(),
          15000, // 15 second timeout
          'Bay field verification timed out'
        ).catch((error) => {
          logger.debug('[useMap] Bay field verification failed (non-critical)', 'useMap');
          return null;
        }),
        withTimeout(
          mapService.testBayTypeFiltering('Green'),
          15000, // 15 second timeout
          'Bay filtering test timed out'
        ).catch((error) => {
          logger.debug('[useMap] Bay filtering test failed (non-critical)', 'useMap');
          return null;
        })
      ]).then(results => {
        logger.debug('[useMap] Non-critical operations completed', 'useMap');
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            logger.warn(`Operation ${index} failed`, 'useMap', result.reason);
          }
        });
      });
      
      // Wait for feature loading with a maximum wait time, then continue regardless
      logger.debug(`[useMap] Waiting for feature loading (max ${FEATURE_LOAD_TIMEOUT}ms)`, 'useMap');
      const featureLoadStartTime = Date.now();
      
      try {
        await Promise.race([
          featureLoadPromise,
          new Promise<void>((resolve) => 
            setTimeout(() => {
              const elapsed = Date.now() - featureLoadStartTime;
              logger.warn(`[useMap] Feature loading timeout reached after ${elapsed}ms, continuing without it...`, 'useMap');
              console.warn(`[useMap] Feature loading timeout reached after ${elapsed}ms, continuing without it...`);
              resolve();
            }, FEATURE_LOAD_TIMEOUT)
          )
        ]);
        const elapsed = Date.now() - featureLoadStartTime;
        logger.debug(`[useMap] Feature loading phase completed in ${elapsed}ms`, 'useMap');
      } catch (error) {
        // Ignore errors - continue anyway
        logger.warn('[useMap] Feature loading error, continuing anyway', 'useMap', error);
        console.warn('[useMap] Feature loading error, continuing anyway:', error);
      }
      
      // Record layer loading time
      const layerLoadTime = performanceMonitor.endTimer('layer-loading');
      performanceMonitor.recordLayerLoadTime(layerLoadTime);
      logger.debug(`[useMap] Layer loading phase completed, moving to preloading (60%)`, 'useMap');

      setLoadingProgress({
        phase: 'preloading',
        progress: 60,
        message: 'Preloading map data...',
        details: 'Caching features for smooth navigation'
      });
      console.log('[useMap] Progress: 60% - Starting preloading phase');

      // Start preloading timer
      performanceMonitor.startTimer('preloading');

      // Preload all features to prevent unloading issues - with timeout and better error handling
      logger.debug('[useMap] Starting preloadAllFeatures with 30s timeout', 'useMap');
      const PRELOAD_TIMEOUT = 30000; // 30 second timeout
      const preloadStartTime = Date.now();
      
      try {
        await Promise.race([
          mapService.preloadAllFeatures().catch(error => {
            logger.warn('[useMap] preloadAllFeatures failed (non-critical)', 'useMap', error);
            console.warn('[useMap] preloadAllFeatures failed, continuing:', error);
            return null; // Don't throw
          }),
          new Promise<void>((resolve) => 
            setTimeout(() => {
              const elapsed = Date.now() - preloadStartTime;
              logger.warn(`[useMap] Preloading timeout reached after ${elapsed}ms, continuing...`, 'useMap');
              console.warn(`[useMap] Preloading timeout reached after ${elapsed}ms, continuing...`);
              resolve();
            }, PRELOAD_TIMEOUT)
          )
        ]);
        const elapsed = Date.now() - preloadStartTime;
        logger.debug(`[useMap] Preloading completed in ${elapsed}ms`, 'useMap');
      } catch (error) {
        logger.warn('[useMap] Preloading error, continuing anyway', 'useMap', error);
        console.warn('[useMap] Preloading error, continuing anyway:', error);
      }
      
      // Record preloading time
      const preloadTime = performanceMonitor.endTimer('preloading');
      performanceMonitor.recordPreloadTime(preloadTime);
      logger.debug(`[useMap] Preloading phase completed, moving to data loading (70%)`, 'useMap');
      console.log('[useMap] Progress: 70% - Starting data loading phase');

      setLoadingProgress({
        phase: 'loading-data',
        progress: 70,
        message: 'Loading parking data...'
      });

      // Start data loading timer
      performanceMonitor.startTimer('data-loading');
      logger.debug('[useMap] Starting parking data loading operations', 'useMap');
      console.log('[useMap] Starting parking data loading operations (getParkingLots, getMonitoredCarparks, getBayCounts)');

      // Get all required data in parallel with timeouts
      const DATA_LOAD_TIMEOUT = 30000; // 30 second timeout for data loading
      const dataLoadStartTime = Date.now();
      
      logger.debug(`[useMap] Starting data loading operations with ${DATA_LOAD_TIMEOUT}ms timeout`, 'useMap');
      console.log('[useMap] Starting data loading (getParkingLots, getMonitoredCarparks, getBayCounts)');
      
      let lots: string[] = [];
      let monitoredCarparks: string[] = [];
      let bayCounts: BayTypeCount[] = [];
      
      try {
        [lots, monitoredCarparks, bayCounts] = await Promise.race([
          Promise.all([
            mapService.getParkingLots().catch(error => {
              logger.warn('[useMap] getParkingLots failed, using empty array', 'useMap', error);
              console.warn('[useMap] getParkingLots failed:', error);
              return [] as string[];
            }),
            mapService.getMonitoredCarparks().catch(error => {
              logger.warn('[useMap] getMonitoredCarparks failed, using empty array', 'useMap', error);
              console.warn('[useMap] getMonitoredCarparks failed:', error);
              return [] as string[];
            }),
            mapService.getBayCounts().catch(error => {
              logger.warn('[useMap] getBayCounts failed, using empty array', 'useMap', error);
              console.warn('[useMap] getBayCounts failed:', error);
              return [] as BayTypeCount[];
            })
          ]),
          new Promise<[string[], string[], BayTypeCount[]]>((resolve) => 
            setTimeout(() => {
              const elapsed = Date.now() - dataLoadStartTime;
              logger.warn(`[useMap] Data loading timeout reached after ${elapsed}ms, using empty data`, 'useMap');
              console.warn(`[useMap] Data loading timeout reached after ${elapsed}ms, using empty data`);
              resolve([[], [], []]); // Return empty arrays on timeout
            }, DATA_LOAD_TIMEOUT)
          )
        ]);
        
        const elapsed = Date.now() - dataLoadStartTime;
        logger.debug(`[useMap] Data loading completed in ${elapsed}ms - lots: ${lots.length}, carparks: ${monitoredCarparks.length}, bayCounts: ${bayCounts.length}`, 'useMap');
        console.log(`[useMap] Data loading completed in ${elapsed}ms - lots: ${lots.length}, carparks: ${monitoredCarparks.length}, bayCounts: ${bayCounts.length}`);
      } catch (error) {
        logger.error('[useMap] Data loading error, using empty data', 'useMap', error);
        console.error('[useMap] Data loading error, using empty data:', error);
        // Already initialized to empty arrays above, so continue
      }
      
      // Record data loading time
      const dataLoadTime = performanceMonitor.endTimer('data-loading');
      performanceMonitor.recordDataLoadTime(dataLoadTime);
      logger.debug(`[useMap] Data loading phase completed, updating state (90%)`, 'useMap');
      console.log('[useMap] Progress: 90% - Updating state and setting up interactions');

      // Update all state in a single batch
      stateSetters.setParkingLots(lots);
      stateSetters.setMonitoredCarparks(monitoredCarparks);
      stateSetters.setBayTypeCounts(bayCounts);
      stateSetters.setTotalBayCounts(mapService.getTotalBayCounts());
      stateSetters.setMonitoredBayCounts(mapService.getMonitoredBayCounts());
      stateSetters.setFilteredTotalBayCounts(mapService.getTotalBayCounts(true));
      stateSetters.setFilteredMonitoredBayCounts(mapService.getMonitoredBayCounts(true));
      stateSetters.setIndividualBayClosedCounts(mapService.getIndividualBayClosedCounts());
      
      // Initialize closedBayCounts with individual bay closed counts
      stateSetters.setClosedBayCounts(mapService.getIndividualBayClosedCounts());

      setLoadingProgress({
        phase: 'loading-data',
        progress: 90,
        message: 'Setting up map interactions...'
      });
      logger.debug('[useMap] Updating parking state with loaded data', 'useMap');

      // Update all state in a single batch
      try {
        stateSetters.setParkingLots(lots);
        stateSetters.setMonitoredCarparks(monitoredCarparks);
        stateSetters.setBayTypeCounts(bayCounts);
        stateSetters.setTotalBayCounts(mapService.getTotalBayCounts());
        stateSetters.setMonitoredBayCounts(mapService.getMonitoredBayCounts());
        stateSetters.setFilteredTotalBayCounts(mapService.getTotalBayCounts(true));
        stateSetters.setFilteredMonitoredBayCounts(mapService.getMonitoredBayCounts(true));
        stateSetters.setIndividualBayClosedCounts(mapService.getIndividualBayClosedCounts());
        
        // Initialize closedBayCounts with individual bay closed counts
        stateSetters.setClosedBayCounts(mapService.getIndividualBayClosedCounts());
        logger.debug('[useMap] State updated successfully', 'useMap');
      } catch (error) {
        logger.error('[useMap] Error updating state', 'useMap', error);
        console.error('[useMap] Error updating state:', error);
      }

      // Set up optimized click handler
      logger.info('[useMap] Setting up click handler', 'useMap');
      console.log('[useMap] Setting up click handler');
      try {
        setupClickHandler(view);
        logger.info('[useMap] Click handler setup completed', 'useMap');
        console.log('[useMap] Click handler setup completed');
      } catch (error) {
        logger.error('[useMap] Error setting up click handler', 'useMap', error);
        console.error('[useMap] Error setting up click handler:', error);
      }

      isInitializedRef.current = true;
      logger.info('[useMap] Map initialization completed successfully', 'useMap');
      console.log('[useMap] Map initialization completed - setting progress to 100%');

      setLoadingProgress({
        phase: 'complete',
        progress: 100,
        message: 'Map ready!'
      });

      // Record total initialization time and log performance summary
      const totalTime = performanceMonitor.endTimer('total-initialization');
      performanceMonitor.recordTotalLoadTime(totalTime);
      performanceMonitor.logPerformanceSummary();

    } catch (error) {
      logger.error('Failed to initialize map', 'useMap', error instanceof Error ? error : undefined);
      setError(error instanceof Error ? error : new Error('Failed to initialize map'));
    } finally {
      setIsLoading(false);
    }
  }, [stateSetters, setIsLoading, setError, setupClickHandler, mapDivRef, setLoadingProgress]);

  // Update renderer when carpark status, highlight, or monitored filter changes
  useEffect(() => {
    // Only run if map is initialized
    if (!isInitializedRef.current) {
      return;
    }

    const view = mapServiceRef.current?.getView();
    const parkingLayer = mapServiceRef.current?.getParkingLayer();
    
    if (!view || !parkingLayer) return;

    const updateRenderer = async () => {
      try {
        const query = parkingLayer.createQuery();
        query.where = "status = 'Closed'";
        query.outFields = ['Zone'];
        
        const result = await parkingLayer.queryFeatures(query);
        const closedZones = result.features.map(f => f.attributes.Zone.trim());
        
        // Debug: Log all parking lot names from the parking layer
        const allParkingLots = result.features.map(f => f.attributes.Zone);
        logger.debug(`All parking lots in parking layer: ${allParkingLots.join(', ')}`, 'useMap');
        logger.debug(`Closed zones from parking layer: ${closedZones.join(', ')}`, 'useMap');
        
        // Filter out temporary parking lots when baysInCap filter is active
        const filteredClosedZones = filters.baysInCap 
          ? closedZones.filter(zone => {
              const isTemp = mapServiceRef.current?.isTemporaryParkingLot(zone);
              if (isTemp) {
                logger.debug(`Filtering out temporary parking lot: ${zone}`, 'useMap');
              }
              return !isTemp;
            })
          : closedZones;

        // Helper to get outline color for a zone (bay type)
        const getZoneOutlineColor = (zone: string) => {
          // Use bayColors from context, fallback to yellow if not found
          const hexColor = bayColors[zone] || '#ffff00';
          
          // Convert hex to RGB for ArcGIS
          const hex = hexColor.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          
          return [r, g, b, 1]; // Return RGB array for ArcGIS
        };

        // Helper to get cleaned zone name
        const cleanZone = (zone: string) => mapServiceRef.current?.cleanString(zone) || zone;
        
        const rendererConfig = {
          type: "unique-value" as const,
          field: "Zone",
          uniqueValueInfos: [
            // Cyan outline for selected lot (should override zone filter outline)
            ...(highlightedParkingLot ? [{
              value: cleanZone(highlightedParkingLot),
              symbol: {
                type: "simple-fill" as const,
                color: [255, 255, 255, 0], // Transparent fill
                outline: {
                  color: [0, 255, 255, 1], // Cyan outline
                  width: 4 // Slightly thicker to ensure it's visible
                }
              }
            }] : []),
            // Blue outline for monitored carparks
            ...(filters.monitoredCarparks ? monitoredCarparks.map(zone => ({
              value: cleanZone(zone),
              symbol: {
                type: "simple-fill" as const,
                color: [255, 255, 255, 0], // Transparent fill
                outline: {
                  color: [0, 0, 255, 1],
                  width: 2
                }
              }
            })) : []),
            // Zone filter: outline color matches bayColors, no overlay
            ...(selectedBayTypeFilter ? parkingLotsWithSelectedBayType
              .filter(zone => cleanZone(zone) !== cleanZone(highlightedParkingLot)) // Exclude selected lot from zone filter
              .map(zone => ({
                value: cleanZone(zone),
                symbol: {
                  type: "simple-fill" as const,
                  color: [255, 255, 255, 0], // Transparent fill
                  outline: {
                    color: getZoneOutlineColor(selectedBayTypeFilter),
                    width: 4 // Slightly thicker to ensure visibility
                  }
                }
              })) : []),
            // Closed zones (red overlay)
            ...filteredClosedZones.map(zone => ({
              value: cleanZone(zone),
              symbol: {
                type: "simple-fill" as const,
                color: [255, 0, 0, 0.5],
                outline: {
                  color: [255, 0, 0, 1],
                  width: 3
                }
              }
            })),
            // Manually closed carparks (red overlay)
            ...Object.entries(carparkStatus)
              .filter(([, isClosed]) => isClosed)
              .filter(([zone]) => {
                if (filters.baysInCap) {
                  const isTemp = mapServiceRef.current?.isTemporaryParkingLot(zone);
                  if (isTemp) {
                    logger.debug(`Filtering out manually closed temporary parking lot: ${zone}`, 'useMap');
                  }
                  return !isTemp;
                }
                return true;
              })
              .map(([zone]) => ({
                value: cleanZone(zone),
                symbol: {
                  type: "simple-fill" as const,
                  color: [255, 0, 0, 0.5],
                  outline: {
                    color: [255, 0, 0, 1],
                    width: 3
                  }
                }
              }))
          ],
          defaultSymbol: {
            type: "simple-fill" as const,
            color: [255, 255, 255, 0],
            outline: {
              color: [0, 0, 0, 1],
              width: 1
            }
          }
        };
        


        parkingLayer.renderer = rendererConfig;
      } catch (error) {
        logger.error('Error updating renderer', 'useMap', error instanceof Error ? error : undefined);
      }
    };

    updateRenderer();
  }, [carparkStatus, highlightedParkingLot, monitoredCarparks, filters.monitoredCarparks, filters.baysInCap, selectedBayTypeFilter, parkingLotsWithSelectedBayType, bayColors]);

  // Update bay layer filters when selected bay type changes
  useEffect(() => {
    // Only run if map is initialized
    if (!isInitializedRef.current) {
      return;
    }

    try {
      const mapService = mapServiceRef.current;
      if (!mapService) {
        logger.warn('Map service not available for filtering', 'useMap');
        return;
      }

      logger.debug(`Updating webmap bay layer filters for: ${selectedBayTypeFilter || 'none'}`, 'useMap');
      
      // Use the webmap bay layers instead of separate layers
      mapService.filterWebMapBayLayers(selectedBayTypeFilter);
      
    } catch (error) {
      logger.error('Error updating bay layer filters', 'useMap', error instanceof Error ? error : undefined);
    }
  }, [selectedBayTypeFilter]);

  // Update parking lots when "Bays in Cap" filter changes
  useEffect(() => {
    const updateParkingLotsForFilter = async () => {
      if (selectedBayTypeFilter && mapServiceRef.current) {
        try {
          logger.debug(`Updating parking lots for bay type "${selectedBayTypeFilter}" with baysInCap filter: ${filters.baysInCap}`, 'useMap');
          const parkingLotsWithBayType = await mapServiceRef.current.getParkingLotsWithBayType(selectedBayTypeFilter, filters.baysInCap);
          logger.debug(`Found ${parkingLotsWithBayType.length} parking lots after filtering`, 'useMap');
          setParkingLotsWithSelectedBayType(parkingLotsWithBayType);
        } catch (error) {
          logger.error('Error updating parking lots for filter change', 'useMap', error instanceof Error ? error : undefined);
        }
      }
    };

    updateParkingLotsForFilter();
  }, [filters.baysInCap, selectedBayTypeFilter]);

  // Update bay counts when "Bays in Cap" filter changes
  useEffect(() => {
    if (mapServiceRef.current) {
      try {
        logger.debug(`Updating bay counts with baysInCap filter: ${filters.baysInCap}`, 'useMap');
        const totalBayCounts = mapServiceRef.current.getTotalBayCounts(filters.baysInCap);
        const monitoredBayCounts = mapServiceRef.current.getMonitoredBayCounts(filters.baysInCap);
        
        logger.debug(`Total bay counts after filtering: ${JSON.stringify(totalBayCounts)}`, 'useMap');
        logger.debug(`Monitored bay counts after filtering: ${JSON.stringify(monitoredBayCounts)}`, 'useMap');
        
        setTotalBayCounts(totalBayCounts);
        setMonitoredBayCounts(monitoredBayCounts);
        
        // Also set the filtered counts for use in SideMenu
        const filteredTotalBayCounts = mapServiceRef.current.getTotalBayCounts(true);
        const filteredMonitoredBayCounts = mapServiceRef.current.getMonitoredBayCounts(true);
        
        setFilteredTotalBayCounts(filteredTotalBayCounts);
        setFilteredMonitoredBayCounts(filteredMonitoredBayCounts);
      } catch (error) {
        logger.error('Error updating bay counts for filter change', 'useMap', error instanceof Error ? error : undefined);
      }
    }
  }, [filters.baysInCap, setTotalBayCounts, setMonitoredBayCounts, setFilteredTotalBayCounts, setFilteredMonitoredBayCounts]);

  // Initialize bay renderers once (no longer need to update based on selection)
  useEffect(() => {
    // Only run if map is initialized
    if (!isInitializedRef.current) {
      return;
    }

    const underBaysLayer = mapServiceRef.current?.getUnderBaysLayer();
    const baysLayer = mapServiceRef.current?.getBaysLayer();
    
    if (!underBaysLayer || !baysLayer) return;

    const initializeBayRenderers = () => {
      try {
        // Create a simple renderer for status-based coloring
        const bayRenderer = {
          type: "unique-value" as const,
          field: "status",
          uniqueValueInfos: [
            {
              value: "Closed",
              symbol: {
                type: "simple-fill" as const,
                color: [255, 0, 0, 0.7], // Red overlay for closed bays
                outline: {
                  color: [255, 0, 0, 1],
                  width: 2
                }
              }
            }
          ],
          defaultSymbol: {
            type: "simple-fill" as const,
            color: [0, 0, 0, 0], // Transparent for open bays
            outline: {
              color: [128, 128, 128, 0.3],
              width: 0.5
            }
          }
        };

        // Set renderers for both bay layers
        underBaysLayer.renderer = bayRenderer;
        baysLayer.renderer = bayRenderer;
      } catch (error) {
        logger.error('Error initializing bay renderers', 'useMap', error instanceof Error ? error : undefined);
      }
    };

    initializeBayRenderers();
  }, []); // Only run once on initialization

  // Set ref ready when mapDivRef becomes available - use useLayoutEffect for synchronous execution
  useLayoutEffect(() => {
    if (mapDivRef.current && !isRefReady) {
      logger.debug('Map container ref is now available', 'useMap');
      setIsRefReady(true);
    }
  }, [mapDivRef, isRefReady]); // Add dependencies to prevent infinite updates

  // Initialize map and load initial data
  useEffect(() => {
    if (!isRefReady || !mapDivRef.current) {
      logger.debug('Map container ref not ready yet', 'useMap');
      return;
    }

    // Only initialize once
    if (!isInitializedRef.current) {
      logger.debug('Starting map initialization', 'useMap');
      initializeMapAndData();
    }
  }, [isRefReady, mapDivRef, initializeMapAndData]); // Add missing dependencies

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup click handler
      if (clickHandlerRef.current) {
        clickHandlerRef.current.remove();
      }
      
      // Cleanup bay highlight
      if (bayHighlightGraphicRef.current) {
        const view = mapServiceRef.current?.getView();
        if (view) {
          view.graphics.remove(bayHighlightGraphicRef.current);
        }
      }
    };
  }, []);

  return {
    isMenuOpen,
    toggleMenu,
    isZoneInfoMinimized,
    toggleZoneInfo,
    isFilterOpen,
    toggleFilter,
    selectedBayTypeFilter,
    setSelectedBayTypeFilter,
    parkingLotsWithSelectedBayType,
    isBayTypeFilterLoading,
    filters,
    setFilters,
    handleSelectParkingLot,
    handleBayTypeSelect,
    mapService: mapServiceRef.current
  };
} 