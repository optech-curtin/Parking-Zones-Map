'use client';

import React, { useRef } from 'react';
import { LazyParkingInfoTable, LazySideMenu, LazySearchMenu } from './LazyComponents';
import { useParking } from '../context/ParkingContext';
import { useMap } from '../hooks/useMap';
import { ErrorBoundary } from './ErrorBoundary';
import LoadingScreen from './LoadingScreen';
import ExcelExportButton from './ExcelExportButton';

export default function MapViewComponent() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  
  const { 
    state: { 
      parkingLots,
      isLoading,
      loadingProgress
    }
  } = useParking();

  // Only show loading for map initialization, not authentication
  const isMapLoading = isLoading;
  const mapProgress = loadingProgress;

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
    handleSelectParkingLot,
    mapService
  } = useMap(mapDivRef);

  return (
    <ErrorBoundary>
      <div className="relative w-full h-screen">
        {/* Always render the map div so ref is available */}
        <div ref={mapDivRef} className="w-full h-screen" />
        
        {/* Show loading screen only for map initialization */}
        {isMapLoading ? (
          <LoadingScreen progress={mapProgress} />
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
        
        {/* Excel Export Button - only show when map is loaded */}
        {!isMapLoading && (
          <div className="fixed bottom-20 right-6 z-50">
            <ExcelExportButton 
              variant="secondary"
              size="sm"
              className="shadow-[var(--shadow)]"
              mapService={mapService}
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

