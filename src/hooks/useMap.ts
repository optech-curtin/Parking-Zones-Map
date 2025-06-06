import { useEffect, useRef, useState } from 'react';
import { MapService } from '../services/MapService';
import { useParking } from '../context/ParkingContext';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

export function useMap() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapServiceRef = useRef<MapService | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isZoneInfoMinimized, setIsZoneInfoMinimized] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ 
    monitoredCarparks: false,
    paygZones: false 
  });

  const { 
    state: { 
      selectedParkingLot,
      highlightedParkingLot,
      carparkStatus,
      bayTypeCounts,
      bayColors,
      isLoading,
      parkingLots,
      monitoredCarparks
    },
    setSelectedParkingLot,
    setHighlightedParkingLot,
    toggleCarparkStatus,
    setBayTypeCounts,
    setParkingLots,
    setMonitoredCarparks,
    setIsLoading,
    setSelectedBayCounts,
    setTotalBayCounts,
    setMonitoredBayCounts,
    setError
  } = useParking();

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        const mapService = new MapService();
        mapServiceRef.current = mapService;

        // Initialize the map
        await mapService.initializeMap(mapDivRef.current!);

        // Load and process features first
        await mapService.loadAndProcessFeatures();

        // Then get the data
        const [lots, monitoredCarparks, bayCounts] = await Promise.all([
          mapService.getParkingLots(),
          mapService.getMonitoredCarparks(),
          mapService.getBayCounts()
        ]);

        // Set all the data
        setParkingLots(lots);
        setMonitoredCarparks(monitoredCarparks);
        setBayTypeCounts(bayCounts);
        setTotalBayCounts(mapService.getTotalBayCounts());
        setMonitoredBayCounts(mapService.getMonitoredBayCounts());

        // Set up click handler after everything is loaded
        const view = mapService.getView();
        if (view) {
          view.on('click', async (event) => {
            try {
              const parkingLayer = mapService.getParkingLayer();
              if (!parkingLayer) {
                console.error('Parking layer not available for click handling');
                return;
              }

              const response = await view.hitTest(event);
              const parkingFeature = response.results.find(
                (result) => result.graphic.layer === parkingLayer
              );

              if (parkingFeature) {
                const attributes = parkingFeature.graphic.attributes as ParkingFeatureAttributes;
                const parkingLot = mapService.cleanString(attributes.Zone || 'Unknown');
                handleSelectParkingLot(parkingLot);
              } else {
                // Clear selection if clicking outside a parking lot
                setSelectedParkingLot('');
                setHighlightedParkingLot('');
                setSelectedBayCounts([]);
              }
            } catch (error) {
              console.error('Error handling map click:', error);
              setError(error instanceof Error ? error : new Error('Failed to handle map click'));
            }
          });
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setError(error instanceof Error ? error : new Error('Failed to initialize map'));
      } finally {
        setIsLoading(false);
      }
    };

    if (mapDivRef.current) {
      initializeMap();
    }
  }, []);

  // Update renderer when carpark status, highlight, or monitored filter changes
  useEffect(() => {
    const view = mapServiceRef.current?.getView();
    const parkingLayer = mapServiceRef.current?.getParkingLayer();
    
    if (!view || !parkingLayer) return;

    // Query for features with Closed status
    const query = parkingLayer.createQuery();
    query.where = "status = 'Closed'";
    query.outFields = ['Zone'];
    
    parkingLayer.queryFeatures(query).then((result) => {
      const closedZones = result.features.map(f => f.attributes.Zone.trim());
      
      parkingLayer.renderer = {
        type: "unique-value" as const,
        field: "Zone",
        uniqueValueInfos: [
          // Highlighted parking lot
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
          // Monitored parking lots (only when filter is active)
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
          // Closed parking lots from status
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
          // Manually closed parking lots
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
    });
  }, [carparkStatus, highlightedParkingLot, monitoredCarparks, filters.monitoredCarparks]);

  const handleSelectParkingLot = async (parkingLot: string, shouldZoom: boolean = false) => {
    const cleanedParkingLot = mapServiceRef.current?.cleanString(parkingLot);
    if (!cleanedParkingLot) return;

    setSelectedParkingLot(cleanedParkingLot);
    setHighlightedParkingLot(cleanedParkingLot);

    // Get selected parking lot's bays
    try {
      const selectedBays = await mapServiceRef.current?.getSelectedParkingLotBays(cleanedParkingLot);
      if (selectedBays) {
        setSelectedBayCounts(selectedBays);
      }

      // Only zoom if explicitly requested (from search menu)
      if (shouldZoom) {
        const parkingLayer = new FeatureLayer({
          url: "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/4"
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
  };

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