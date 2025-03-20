'use client';

import React, { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import IdentityManager from '@arcgis/core/identity/IdentityManager';

export default function MapViewComponent() {
  const mapDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapDivRef.current) return;

    // Step 1: Fetch the token from your Next.js server route
    fetch('/api/arcgis/token')
      .then((res) => res.json())
      .then((data) => {
        if (!data.token) {
          console.error('No token returned from server:', data);
          // Initialize anyway (won’t be able to see secured content if required)
          initializeMap();
          return;
        }
        const myToken = data.token;
        console.log('ArcGIS token acquired:', myToken);

        // Step 2: Register the token so ArcGIS library uses it for relevant requests
        // a) If your FeatureLayer is hosted at https://cssl.maps.arcgis.com, specify that
        IdentityManager.registerToken({
          server: 'https://arcgis.curtin.edu.au', // or your enterprise URL
          token: myToken,
          userId: 'ArcGISUser', // or omit if not needed
        });

        // Step 3: Now that the token is available, initialize the map
        initializeMap();
      })
      .catch((err) => {
        console.error('Error fetching ArcGIS token:', err);
        // Fallback: map without authentication
        initializeMap();
      });

    function initializeMap() {
      console.log('Initializing map...');
      const map = new Map({
        basemap: 'streets',
      });

      const view = new MapView({
        container: mapDivRef.current,
        map: map,
        center: [-117.1956, 34.056],
        zoom: 16,
      });

      // Example: secure feature service that requires the token
      const carparkLayer = new FeatureLayer({
        url: 'https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays/FeatureServer/0', 
        outFields: ['*'],
      });
      map.add(carparkLayer);

      view.on('click', async (event) => {
        try {
          const hitTestResult = await view.hitTest(event);
          const carparkGraphic = (hitTestResult.results as any[]).find(
            (result) => result.graphic?.layer === carparkLayer
          )?.graphic;

          if (carparkGraphic) {
            console.log('Clicked carpark:', carparkGraphic.attributes);
            // ... your logic ...
          }
        } catch (error) {
          console.error('Map click error:', error);
        }
      });
    }
  }, []);

  return <div ref={mapDivRef} className="w-full h-screen" />;
}
