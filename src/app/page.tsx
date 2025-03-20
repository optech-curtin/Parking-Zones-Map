'use client';

import dynamic from 'next/dynamic';
import { ToolProvider } from '../context/ToolContext';
import ToolPanel from '../components/ToolPanel';

// Dynamically import MapView with SSR disabled.
const MapViewComponent = dynamic(() => import('../components/MapView'), {
  ssr: false,
});

export default function HomePage() {
  return (
    <ToolProvider>
      <div className="min-h-screen flex flex-col">
        <ToolPanel />
        <div className="flex-1">
          <MapViewComponent />
        </div>
      </div>
    </ToolProvider>
  );
}
