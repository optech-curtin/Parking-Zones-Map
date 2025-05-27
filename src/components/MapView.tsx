'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import esriConfig from "@arcgis/core/config";
import ParkingInfoTable from './ParkingInfoTable';
import SideMenu from './SideMenu';

interface BayTypeCount {
  type: string;
  count: number;
}

// Default colors for different bay types
const getDefaultColor = (bayType: string): string => {
  const colorMap: { [key: string]: string } = {
    'Green': '#4CAF50',
    'Yellow': '#FFC107',
    'Blue': '#2196F3',
    'White': '#FFFFFF',
    'ACROD': '#9C27B0',
    'Unknown': '#9E9E9E'
  };
  return colorMap[bayType] || '#9E9E9E';
};

export default function MapViewComponent() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const [selectedParkingLot, setSelectedParkingLot] = useState<string>('');
  const [highlightedParkingLot, setHighlightedParkingLot] = useState<string>('');
  const [bayTypeCounts, setBayTypeCounts] = useState<BayTypeCount[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [carparkStatus, setCarparkStatus] = useState<{ [key: string]: boolean }>({});
  const [closedBayCounts, setClosedBayCounts] = useState<{ [key: string]: number }>({});
  const [totalBayCounts, setTotalBayCounts] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [bayColors, setBayColors] = useState<{ [key: string]: string }>({});
  
  // Fetch all bay types when map loads
  useEffect(() => {
    const fetchAllBayTypes = async () => {
      try {
        setIsLoading(true);
        // Create FeatureLayers for all services
        const parkingLotsLayer = new FeatureLayer({
          url: "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/4"
        });

        const underBaysLayer = new FeatureLayer({
          url: "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays_Under/FeatureServer/0",
          outFields: ['*', 'baytype']
        });

        const baysLayer = new FeatureLayer({
          url: "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays/FeatureServer/0",
          outFields: ['*', 'baytype']
        });

        // Wait for all layers to load
        await Promise.all([
          parkingLotsLayer.load(),
          underBaysLayer.load(),
          baysLayer.load()
        ]);

        // Get all unique parking lots
        const parkingLotsQuery = parkingLotsLayer.createQuery();
        parkingLotsQuery.returnGeometry = false;
        parkingLotsQuery.outFields = ['Zone'];
        const parkingLotsResult = await parkingLotsLayer.queryFeatures(parkingLotsQuery);
        const parkingLots = [...new Set(parkingLotsResult.features.map((f: __esri.Graphic) => f.attributes.Zone.trim()))];

        // Calculate total bay type counts
        const totalCounts: { [key: string]: number } = {};
        const bayColors: { [key: string]: string } = {
          // Add your color mappings here
          'Green': '#4ce600',
          'Yellow': '#ffff00',
          'Reserved': '#c500ff',
          '5Minute': '#ffd37f',
          '15Minute': '#ffaa00',
          '30Minute': '#ffd37f',
          '90Minute': '#e69800',
          'Blue': '#0070ff',
          'White': '#d6d6d6',
          'ACROD': '#005ce6',
          'Courtesy': '#73ffdf',
          'Motorcycle': '#1a1a1a',
          'EV': '#4ce600',
          'Visitor': '#149ece',
          'CarShare': '#a7c636',
          'Police': '#ff0000',
          'Loading': '#242424',
          'Faculty': '#a87000',
          'Maintenance': '#a87000',
          'Unknown': '#9E9E9E'
        };

        let acrodRunningTotal = 0;

        // Query each parking lot's bays
        for (const parkingLot of parkingLots) {
          const underBaysQuery = underBaysLayer.createQuery();
          underBaysQuery.where = `parkinglot = '${parkingLot}'`;
          underBaysQuery.returnGeometry = false;
          underBaysQuery.outFields = ['*', 'baytype'];
          
          const baysQuery = baysLayer.createQuery();
          baysQuery.where = `parkinglot = '${parkingLot}'`;
          baysQuery.returnGeometry = false;
          baysQuery.outFields = ['*', 'baytype'];

          // Execute queries
          const [underBaysResult, baysResult] = await Promise.all([
            underBaysLayer.queryFeatures(underBaysQuery),
            baysLayer.queryFeatures(baysQuery)
          ]);

          // Clean bay types in the results
          underBaysResult.features.forEach(feature => {
            if (feature.attributes.baytype) {
              feature.attributes.baytype = feature.attributes.baytype
                .replace(/['"]/g, '') // Remove quotes
                .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces and other invisible characters
                .trim();
            }
          });
          baysResult.features.forEach(feature => {
            if (feature.attributes.baytype) {
              feature.attributes.baytype = feature.attributes.baytype
                .replace(/['"]/g, '') // Remove quotes
                .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces and other invisible characters
                .trim();
            }
          });

          // Combine all features
          const allFeatures = [...underBaysResult.features, ...baysResult.features];

          // Count ACROD bays for this parking lot
          const acrodCount = allFeatures.filter(f => f.attributes.baytype === 'ACROD').length;
          if (acrodCount > 0) {
            acrodRunningTotal += acrodCount;
            console.log(`Parking lot ${parkingLot} has ${acrodCount} ACROD bays (Total: ${acrodRunningTotal})`);
          }

          // Accumulate counts
          allFeatures.forEach(feature => {
            const bayType = feature.attributes.baytype || 'Unknown';
            totalCounts[bayType] = (totalCounts[bayType] || 0) + 1;
          });
        }

        console.log('Bay type counts:', totalCounts);
        setTotalBayCounts(totalCounts);
        setBayColors(bayColors);
      } catch (error) {
        console.error('Error fetching all bay types:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBayTypes();
  }, []);

  // Update bay type counts when a parking lot is selected
  useEffect(() => {
    const fetchSelectedBayTypes = async () => {
      if (!selectedParkingLot) return;

      try {
        // Create FeatureLayers for both parking bay services
        const underBaysLayer = new FeatureLayer({
          url: "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays_Under/FeatureServer/0"
        });

        const baysLayer = new FeatureLayer({
          url: "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays/FeatureServer/0"
        });

        // Wait for both layers to load
        await Promise.all([
          underBaysLayer.load(),
          baysLayer.load()
        ]);

        // Query features for selected parking lot
        const underBaysQuery = underBaysLayer.createQuery();
        underBaysQuery.where = `parkinglot = '${selectedParkingLot}'`;
        underBaysQuery.returnGeometry = false;
        underBaysQuery.outFields = ['*'];
        
        const baysQuery = baysLayer.createQuery();
        baysQuery.where = `parkinglot = '${selectedParkingLot}'`;
        baysQuery.returnGeometry = false;
        baysQuery.outFields = ['*'];

        // Execute queries
        const [underBaysResult, baysResult] = await Promise.all([
          underBaysLayer.queryFeatures(underBaysQuery),
          baysLayer.queryFeatures(baysQuery)
        ]);

        // Combine all features
        const allFeatures = [...underBaysResult.features, ...baysResult.features];

        // Calculate bay type counts
        const bayTypeCounts: { [key: string]: number } = {};
        allFeatures.forEach(feature => {
          const bayType = feature.attributes.baytype || 'Unknown';
          bayTypeCounts[bayType] = (bayTypeCounts[bayType] || 0) + 1;
        });

        // Convert to array and sort by count
        const sortedBayTypes: BayTypeCount[] = Object.entries(bayTypeCounts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count);

        setBayTypeCounts(sortedBayTypes);
      } catch (error) {
        console.error('Error fetching selected bay types:', error);
      }
    };

    fetchSelectedBayTypes();
  }, [selectedParkingLot]);

  const toggleCarparkStatus = useCallback((parkingLot: string) => {
    setCarparkStatus(prev => {
      const newStatus = { ...prev };
      newStatus[parkingLot] = !newStatus[parkingLot];
      return newStatus;
    });

    // Update closed bay counts
    setClosedBayCounts(prev => {
      const newCounts = { ...prev };
      bayTypeCounts.forEach(({ type, count }) => {
        if (carparkStatus[parkingLot]) {
          newCounts[type] = (newCounts[type] || 0) - count;
        } else {
          newCounts[type] = (newCounts[type] || 0) + count;
        }
      });
      return newCounts;
    });
  }, [bayTypeCounts, carparkStatus]);

  // Initialize map (runs once)
  useEffect(() => {
    if (!mapDivRef.current) return;

    esriConfig.portalUrl = "https://arcgis.curtin.edu.au/portal";

    const webmap = new WebMap({
      portalItem: {
        id: "34e3e14cea754a41a9b7f8455fef8c48"
      }
    });
    
    const view = new MapView({
      container: mapDivRef.current,
      map: webmap,
      center: [115.894, -32.005],
      zoom: 14,
      popupEnabled: false 
    });

    // Create and add the parking layer
    const parkingLayer = new FeatureLayer({
      url: "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/4",
      renderer: {
        type: "unique-value" as const,
        field: "Zone",
        uniqueValueInfos: [],
        defaultSymbol: {
          type: "simple-fill" as const,
          color: [255, 255, 255, 0],
          outline: {
            color: [0, 0, 0, 1],
            width: 1
          }
        }
      },
      outFields: ['Zone', 'status']
    });
    parkingLayer.id = "parkingLayer";
    view.map.add(parkingLayer);

    viewRef.current = view;

    // Cleanup function
    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, []);

  // Update renderer when carpark status or highlight changes
  useEffect(() => {
    if (!viewRef.current) return;

    const view = viewRef.current;
    const parkingLayer = view.map.layers.find(layer => layer.id === "parkingLayer") as FeatureLayer;
    
    if (!parkingLayer) return;

    // Query for features with Closed status
    const query = parkingLayer.createQuery();
    query.where = "status = 'Closed'";
    query.outFields = ['Zone'];
    
    parkingLayer.queryFeatures(query).then((result: __esri.FeatureSet) => {
      const closedZones = result.features.map((f: __esri.Graphic) => f.attributes.Zone.trim());
      
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
          // Closed parking lots from status
          ...closedZones.map((zone: string) => ({
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
  }, [carparkStatus, highlightedParkingLot]);

  // Add click handlers (updates when toggleCarparkStatus changes)
  useEffect(() => {
    if (!viewRef.current) return;

    const view = viewRef.current;

    // Add click handler
    const clickHandler = async (event: __esri.ViewClickEvent) => {
      if (event.button === 2) { // Right click
        try {
          const parkingLayer = new FeatureLayer({
            url: "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/4"
          });

          const query = parkingLayer.createQuery();
          query.geometry = event.mapPoint;
          query.spatialRelationship = "intersects";
          
          const result = await parkingLayer.queryFeatures(query);

          if (result.features.length > 0) {
            const clickedFeature = result.features[0];
            const parkinglot = clickedFeature.attributes.Zone.trim();
            toggleCarparkStatus(parkinglot);
          }
        } catch (error) {
          console.error('Right click error:', error);
        }
      } else { // Left click
        try {
          const parkingLayer = new FeatureLayer({
            url: "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/4"
          });

          const query = parkingLayer.createQuery();
          query.geometry = event.mapPoint;
          query.spatialRelationship = "intersects";
          
          const result = await parkingLayer.queryFeatures(query);

          if (result.features.length > 0) {
            const clickedFeature = result.features[0];
            const parkinglot = clickedFeature.attributes.Zone.trim();
            console.log('Clicked zone:', parkinglot);
            setSelectedParkingLot(parkinglot);
            setHighlightedParkingLot(parkinglot);

            // Create FeatureLayers for both parking bay services
            const underBaysLayer = new FeatureLayer({
              url: "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays_Under/FeatureServer/0"
            });

            const baysLayer = new FeatureLayer({
              url: "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays/FeatureServer/0"
            });

            // Wait for both layers to load
            await Promise.all([
              underBaysLayer.load(),
              baysLayer.load()
            ]);

            // Query both layers for features with matching zone
            const underBaysQuery = underBaysLayer.createQuery();
            underBaysQuery.where = `parkinglot = '${parkinglot}'`;
            underBaysQuery.returnGeometry = false;
            underBaysQuery.outFields = ['*'];
            
            const baysQuery = baysLayer.createQuery();
            baysQuery.where = `parkinglot = '${parkinglot}'`;
            baysQuery.returnGeometry = false;
            baysQuery.outFields = ['*'];

            // Execute queries
            const [underBaysResult, baysResult] = await Promise.all([
              underBaysLayer.queryFeatures(underBaysQuery),
              baysLayer.queryFeatures(baysQuery)
            ]);

            // Combine all features
            const allFeatures = [...underBaysResult.features, ...baysResult.features];

            // Calculate bay type counts using an object instead of Map
            const bayTypeCounts: { [key: string]: number } = {};
            allFeatures.forEach(feature => {
              const bayType = feature.attributes.baytype || 'Unknown';
              bayTypeCounts[bayType] = (bayTypeCounts[bayType] || 0) + 1;
            });

            // Convert to array and sort by count
            const sortedBayTypes: BayTypeCount[] = Object.entries(bayTypeCounts)
              .map(([type, count]) => ({ type, count }))
              .sort((a, b) => b.count - a.count);

            setBayTypeCounts(sortedBayTypes);
          } else {
            // Clear highlight when clicking outside a parking lot
            setHighlightedParkingLot('');
            setSelectedParkingLot('');
            setBayTypeCounts([]);
          }
        } catch (error) {
          console.error('Map click error:', error);
        }
      }
    };

    const handle = view.on('click', clickHandler);

    // Cleanup function
    return () => {
      handle.remove();
    };
  }, [toggleCarparkStatus]);

  const resetAllCarparks = () => {
    // Reset all carpark statuses to open (false)
    setCarparkStatus({});
    // Reset all closed bay counts
    setClosedBayCounts({});
  };

  return (
    <div className="relative w-full h-screen">
      <SideMenu
        isOpen={isMenuOpen}
        selectedParkingLot={selectedParkingLot}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        onToggleCarpark={() => toggleCarparkStatus(selectedParkingLot)}
        carparkStatus={carparkStatus}
        closedBayCounts={closedBayCounts}
        totalBayCounts={totalBayCounts}
        bayColors={bayColors}
        onResetAll={resetAllCarparks}
        isLoading={isLoading}
      />
      <div ref={mapDivRef} className="w-full h-screen" />
      <ParkingInfoTable 
        selectedParkingLot={selectedParkingLot}
        bayTypes={bayTypeCounts}
        isLoading={isLoading}
      />
    </div>
  );
}

