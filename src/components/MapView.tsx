'use client';

import React, { useRef } from 'react';
import { LazyParkingInfoTable, LazySideMenu, LazySearchMenu } from './LazyComponents';
import { useParking } from '../context/ParkingContext';
import { useMap } from '../hooks/useMap';
import { ErrorBoundary } from './ErrorBoundary';
import LoadingScreen from './LoadingScreen';

interface MapViewComponentProps {
  authProgress?: {
    phase: 'initializing' | 'authenticating' | 'loading-map';
    progress: number;
    message: string;
  };
}

export default function MapViewComponent({ authProgress }: MapViewComponentProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  
  const { 
    state: { 
      parkingLots,
      isLoading,
      loadingProgress
    }
  } = useParking();

  // Combine authentication and map loading states
  const isCombinedLoading = isLoading || (authProgress && authProgress.progress < 100);
  const combinedProgress = isLoading 
    ? loadingProgress 
    : (authProgress ?? { phase: 'initializing' as const, progress: 0, message: 'Loading...' });

  const {
    isMenuOpen,
    toggleMenu,
    isZoneInfoMinimized,
    toggleZoneInfo,
    isFilterOpen,
    toggleFilter,
    filters,
    setFilters,
    selectedBayTypeFilter,
    handleBayTypeSelect,
    parkingLotsWithSelectedBayType,
    isBayTypeFilterLoading,
    handleSelectParkingLot
  } = useMap(mapDivRef);

  return (
    <ErrorBoundary>
      <div className="relative w-full h-screen">
        {/* Always render the map div so ref is available */}
        <div ref={mapDivRef} className="w-full h-screen" />
        
        {/* Show loading screen as overlay if still loading */}
        {isCombinedLoading ? (
          <LoadingScreen progress={combinedProgress} />
        ) : (
          <>
            <LazySearchMenu
              parkingLots={parkingLots}
              onSelectParkingLot={handleSelectParkingLot}
              isZoneInfoMinimized={isZoneInfoMinimized}
              isFilterOpen={isFilterOpen}
              isMenuOpen={isMenuOpen}
            />
            <LazySideMenu
              isOpen={isMenuOpen}
              onToggleMenu={toggleMenu}
              isZoneInfoMinimized={isZoneInfoMinimized}
              setIsZoneInfoMinimized={toggleZoneInfo}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={toggleFilter}
              filters={filters}
              setFilters={setFilters}
              selectedBayTypeFilter={selectedBayTypeFilter}
              handleBayTypeSelect={handleBayTypeSelect}
              parkingLotsWithSelectedBayType={parkingLotsWithSelectedBayType}
              isBayTypeFilterLoading={isBayTypeFilterLoading}
            />
            <LazyParkingInfoTable filters={filters} />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

