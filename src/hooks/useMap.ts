import { useEffect, useRef, useState, useCallback } from 'react';
import { MapService } from '../services/MapService';
import { useParking } from '../context/ParkingContext';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import type { ParkingFeatureAttributes, BayFeatureAttributes } from '../types';

const PARKING_LAYER_URL = "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/4";

export function useMap() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapServiceRef = useRef<MapService | null>(null);
  const bayHighlightGraphicRef = useRef<__esri.Graphic | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isZoneInfoMinimized, setIsZoneInfoMinimized] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ 
    monitoredCarparks: false,
    paygZones: false 
  });

  const { 
    state: { 
      highlightedParkingLot,
      carparkStatus,
      monitoredCarparks
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
    setIndividualBayClosedCounts,
    setError
  } = useParking();

  // Store state setters in a ref to avoid dependency issues
  const stateSettersRef = useRef({
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
    setIndividualBayClosedCounts,
    setError
  });

  // Update ref when setters change
  useEffect(() => {
    stateSettersRef.current = {
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
      setIndividualBayClosedCounts,
      setError
    };
  }, [
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
    setIndividualBayClosedCounts,
    setError
  ]);



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
        color: [0, 255, 255, 0.5], // Cyan highlight
        outline: {
          color: [0, 255, 255, 1],
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
        console.error('Error highlighting bay with geometry:', error);
      }
  }, []);



  const handleSelectParkingLot = useCallback(async (parkingLot: string, shouldZoom: boolean = false) => {
    const cleanedParkingLot = mapServiceRef.current?.cleanString(parkingLot);
    if (!cleanedParkingLot) return;

    const { setSelectedParkingLot, setHighlightedParkingLot, setSelectedBayCounts, setSelectedClosedBayCounts, setError } = stateSettersRef.current;
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
              view.goTo({
                target: geometry,
                padding: {
                  top: 150,
                  bottom: 150,
                  left: 150,
                  right: 150
                }
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling parking lot selection:', error);
      setError(error instanceof Error ? error : new Error('Failed to handle parking lot selection'));
    }
  }, []); // Empty dependency array since we're using refs

  // Initialize map and load initial data
  useEffect(() => {
    let isMounted = true;

    const initializeMapAndData = async () => {
      if (!mapDivRef.current) {
        console.error('Map container ref is not available');
        return;
      }

      const { 
        setIsLoading, 
        setParkingLots, 
        setMonitoredCarparks, 
        setBayTypeCounts, 
        setTotalBayCounts, 
        setMonitoredBayCounts,
        setIndividualBayClosedCounts,
        setError,
        setSelectedParkingLot,
        setHighlightedParkingLot,
        setSelectedBayCounts,
        setSelectedClosedBayCounts
      } = stateSettersRef.current;

      try {
        setIsLoading(true);
        
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

        // Initialize map service
        const mapService = new MapService();
        mapServiceRef.current = mapService;

        // Initialize the map
        await mapService.initializeMap(mapDivRef.current);

        // Load and process features
        await mapService.loadAndProcessFeatures();

        if (!isMounted) return;

        // Get all required data
        const [lots, monitoredCarparks, bayCounts] = await Promise.all([
          mapService.getParkingLots(),
          mapService.getMonitoredCarparks(),
          mapService.getBayCounts()
        ]);

        if (!isMounted) return;

        // Update all state in a single batch
        setParkingLots(lots);
        setMonitoredCarparks(monitoredCarparks);
        setBayTypeCounts(bayCounts);
        setTotalBayCounts(mapService.getTotalBayCounts());
        setMonitoredBayCounts(mapService.getMonitoredBayCounts());
        setIndividualBayClosedCounts(mapService.getIndividualBayClosedCounts());

        // Set up click handler with zoom-based layer detection
        // Set up click handler with zoom-based layer detection
        const view = mapService.getView();
        if (view) {
          view.on('click', async (event) => {
            try {
              const parkingLayer = mapService.getParkingLayer();
              const underBaysLayer = mapService.getUnderBaysLayer();
              const baysLayer = mapService.getBaysLayer();
              
              if (!parkingLayer) {
                console.error('Parking layer not available for click handling');
                return;
              }

              const response = await view.hitTest(event);
              
              // Define zoom threshold for bay interaction (adjust as needed)
              const BAY_INTERACTION_ZOOM = 19; // Temporarily lowered for testing
              
              if (view.zoom >= BAY_INTERACTION_ZOOM) {
                // At high zoom levels, ONLY interact with bay layers
                const bayFeature = response.results.find(
                  (result) => 'graphic' in result && 
                  (result.graphic?.layer === underBaysLayer || result.graphic?.layer === baysLayer)
                );

                if (bayFeature && 'graphic' in bayFeature) {
                  const attributes = bayFeature.graphic.attributes as BayFeatureAttributes;
                  
                  // Validate attributes before processing
                  if (!attributes.objectid) {
                    console.error('Missing objectid in bay attributes:', attributes);
                    return;
                  }
                  
                  // Create a bay ID for display purposes
                  const bayId = `${attributes.parkinglot || 'Unknown'}_${attributes.baytype || 'Unknown'}_${attributes.objectid}`;
                  
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
                  const parkingLot = mapService.cleanString(attributes.parkinglot || 'Unknown');
                  if (parkingLot) {
                    setSelectedParkingLot(parkingLot);
                    // Don't set highlightedParkingLot - we want to highlight only the bay
                    
                    const [selectedBays, selectedClosedBays] = await Promise.all([
                      mapService.getSelectedParkingLotBays(parkingLot),
                      mapService.getSelectedParkingLotClosedBays(parkingLot)
                    ]);
                    
                    if (selectedBays) {
                      setSelectedBayCounts(selectedBays);
                    }
                    
                    if (selectedClosedBays) {
                      setSelectedClosedBayCounts(selectedClosedBays);
                    }
                  }
                } else {
                  // At high zoom, if no bay was clicked, clear everything
                  // Do NOT fall back to parking lot selection at high zoom
                  setSelectedBay(null);
                  setHighlightedBay(null);
                  setSelectedBayAttributes(null);
                  setSelectedParkingLot('');
                  setHighlightedParkingLot('');
                  setSelectedBayCounts([]);
                  setSelectedClosedBayCounts({});
                  
                  // Remove bay highlight
                  if (bayHighlightGraphicRef.current) {
                    const view = mapServiceRef.current?.getView();
                    if (view) {
                      view.graphics.remove(bayHighlightGraphicRef.current);
                      bayHighlightGraphicRef.current = null;
                    }
                  }
                }
              } else {
                // At low zoom levels, only interact with parking lots
                // Filter out bay features completely at low zoom
                const nonBayResults = response.results.filter(
                  (result) => 'graphic' in result && 
                  result.graphic?.layer !== underBaysLayer && 
                  result.graphic?.layer !== baysLayer
                );
                
                const parkingFeature = nonBayResults.find(
                  (result) => 'graphic' in result && result.graphic?.layer === parkingLayer
                );

                if (parkingFeature && 'graphic' in parkingFeature) {
                  const attributes = parkingFeature.graphic.attributes as ParkingFeatureAttributes;
                  const parkingLot = mapService.cleanString(attributes.Zone || 'Unknown');
                  if (parkingLot) {
                    setSelectedParkingLot(parkingLot);
                    setHighlightedParkingLot(parkingLot);
                    
                    const [selectedBays, selectedClosedBays] = await Promise.all([
                      mapService.getSelectedParkingLotBays(parkingLot),
                      mapService.getSelectedParkingLotClosedBays(parkingLot)
                    ]);
                    
                    if (selectedBays) {
                      setSelectedBayCounts(selectedBays);
                    }
                    
                    if (selectedClosedBays) {
                      setSelectedClosedBayCounts(selectedClosedBays);
                    }
                  }
                } else {
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
                  const view = mapServiceRef.current?.getView();
                  if (view) {
                    view.graphics.remove(bayHighlightGraphicRef.current);
                    bayHighlightGraphicRef.current = null;
                  }
                }
              }
            } catch (error) {
              console.error('Error handling map click:', error);
              setError(error instanceof Error ? error : new Error('Failed to handle map click'));
            }
          });
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to initialize map';
          const errorStack = error instanceof Error ? error.stack : undefined;
          console.error('Error details:', { message: errorMessage, stack: errorStack });
          setError(new Error(`Failed to initialize map: ${errorMessage}`));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeMapAndData();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array since we're using refs

  // Update renderer when carpark status, highlight, or monitored filter changes
  useEffect(() => {
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
        
        const rendererConfig = {
          type: "unique-value" as const,
          field: "Zone",
          uniqueValueInfos: [
            ...(highlightedParkingLot ? [{
              value: highlightedParkingLot.trim(),
              symbol: {
                type: "simple-fill" as const,
                color: [0, 255, 255, 0.3],
                outline: {
                  color: [0, 255, 255, 1],
                  width: 3
                }
              }
            }] : []),
            ...(filters.monitoredCarparks ? monitoredCarparks.map(zone => ({
              value: zone,
              symbol: {
                type: "simple-fill" as const,
                color: [0, 0, 255, 0.3],
                outline: {
                  color: [0, 0, 255, 1],
                  width: 2
                }
              }
            })) : []),
            ...closedZones.map(zone => ({
              value: zone,
              symbol: {
                type: "simple-fill" as const,
                color: [255, 0, 0, 0.5],
                outline: {
                  color: [255, 0, 0, 1],
                  width: 3
                }
              }
            })),
            ...Object.entries(carparkStatus)
              .filter(([, isClosed]) => isClosed)
              .map(([zone]) => ({
                value: zone.trim(),
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
        console.error('Error updating renderer:', error);
      }
    };

    updateRenderer();
  }, [carparkStatus, highlightedParkingLot, monitoredCarparks, filters.monitoredCarparks]);

  // Initialize bay renderers once (no longer need to update based on selection)
  useEffect(() => {
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
        console.error('Error initializing bay renderers:', error);
      }
    };

    initializeBayRenderers();
  }, []); // Only run once on initialization

  return {
    mapDivRef,
    isMenuOpen,
    setIsMenuOpen,
    isZoneInfoMinimized,
    setIsZoneInfoMinimized,
    isFilterOpen,
    setIsFilterOpen,
    filters,
    setFilters,
    handleSelectParkingLot
  };
} 