'use client';

import dynamic from 'next/dynamic';
import { ToolProvider } from '../context/ToolContext';
// Dynamically import MapView with SSR disabled.
const MapViewComponent = dynamic(() => import('../components/MapView'), {
  ssr: false,
});

export default function HomePage() {
  return (
    <ToolProvider>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <MapViewComponent />
        </div>
      </div>
    </ToolProvider>
  );
}
