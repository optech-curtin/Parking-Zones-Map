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

export default function MapViewComponent() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const [selectedParkingLot, setSelectedParkingLot] = useState<string>('');
  const [bayTypeCounts, setBayTypeCounts] = useState<BayTypeCount[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [carparkStatus, setCarparkStatus] = useState<{ [key: string]: boolean }>({});
  const [closedBayCounts, setClosedBayCounts] = useState<{ [key: string]: number }>({});
  const [totalBayCounts, setTotalBayCounts] = useState<{ [key: string]: number }>({});
  
  // Fetch all bay types when map loads
  useEffect(() => {
    const fetchAllBayTypes = async () => {
      try {
        // Create FeatureLayers for all services
        const parkingLotsLayer = new FeatureLayer({
          url: "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/4"
        });

        const underBaysLayer = new FeatureLayer({
          url: "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays_Under/FeatureServer/0"
        });

        const baysLayer = new FeatureLayer({
          url: "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays/FeatureServer/0"
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
        const parkingLots = parkingLotsResult.features.map((f: __esri.Graphic) => f.attributes.Zone.trim());

        // Calculate total bay type counts
        const totalCounts: { [key: string]: number } = {};

        // Query each parking lot's bays
        for (const parkingLot of parkingLots) {
          const underBaysQuery = underBaysLayer.createQuery();
          underBaysQuery.where = `parkinglot = '${parkingLot}'`;
          underBaysQuery.returnGeometry = false;
          underBaysQuery.outFields = ['*'];
          
          const baysQuery = baysLayer.createQuery();
          baysQuery.where = `parkinglot = '${parkingLot}'`;
          baysQuery.returnGeometry = false;
          baysQuery.outFields = ['*'];

          // Execute queries
          const [underBaysResult, baysResult] = await Promise.all([
            underBaysLayer.queryFeatures(underBaysQuery),
            baysLayer.queryFeatures(baysQuery)
          ]);

          // Combine all features
          const allFeatures = [...underBaysResult.features, ...baysResult.features];

          // Accumulate counts
          allFeatures.forEach(feature => {
            const bayType = feature.attributes.baytype || 'Unknown';
            totalCounts[bayType] = (totalCounts[bayType] || 0) + 1;
          });
        }

        console.log('Total bay counts:', totalCounts); // Debug log
        setTotalBayCounts(totalCounts);
      } catch (error) {
        console.error('Error fetching all bay types:', error);
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
    });

    viewRef.current = view;

    // Cleanup function
    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, []);

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

  // Update renderer when carpark status changes
  useEffect(() => {
    if (!viewRef.current) return;

    const view = viewRef.current;
    const parkingLayer = new FeatureLayer({
      url: "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/4",
      renderer: {
        type: "unique-value" as const,
        field: "Zone",
        uniqueValueInfos: Object.entries(carparkStatus).map(([zone, isClosed]) => ({
          value: zone,
          symbol: {
            type: "simple-fill" as const,
            color: isClosed ? [255, 0, 0, 0.5] : [255, 255, 255, 0],
            outline: {
              color: isClosed ? [255, 0, 0, 1] : [0, 0, 0, 1],
              width: isClosed ? 2 : 1
            }
          }
        })),
        defaultSymbol: {
          type: "simple-fill" as const,
          color: [255, 255, 255, 0],
          outline: {
            color: [0, 0, 0, 1],
            width: 1
          }
        }
      }
    });

    // Remove existing parking layer if it exists
    const existingLayer = view.map.layers.find(layer => 
      layer.id === "parkingLayer"
    );
    if (existingLayer) {
      view.map.remove(existingLayer);
    }

    // Add the new layer with updated renderer
    parkingLayer.id = "parkingLayer";
    view.map.add(parkingLayer);
  }, [carparkStatus]);

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
        onResetAll={resetAllCarparks}
      />
      <div ref={mapDivRef} className="w-full h-screen" />
      {selectedParkingLot && (
        <ParkingInfoTable 
          parkingLot={selectedParkingLot}
          bayTypes={bayTypeCounts}
        />
      )}
    </div>
  );
}
