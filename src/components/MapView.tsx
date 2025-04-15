'use client';

import React, { useEffect, useRef, useState } from 'react';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import esriConfig from "@arcgis/core/config";
import ParkingInfoTable from './ParkingInfoTable';

interface BayTypeCount {
  type: string;
  count: number;
}

export default function MapViewComponent() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [selectedParkingLot, setSelectedParkingLot] = useState<string>('');
  const [bayTypeCounts, setBayTypeCounts] = useState<BayTypeCount[]>([]);
  
  useEffect(() => {
    if (!mapDivRef.current) return;
        initializeMap();

    function initializeMap() {
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


      view.on('click', async (event) => {
        try {
          
          // Create a new FeatureLayer pointing to sublayer 4
          const parkingLayer = new FeatureLayer({
            url: "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/4"
          });

          // Create a query for the clicked location
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
      });
    }
  }, []);

  

  return (
    <div className="relative w-full h-screen">
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
