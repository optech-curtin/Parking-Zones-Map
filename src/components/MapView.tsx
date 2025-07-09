'use client';

import React from 'react';
import { LazyParkingInfoTable, LazySideMenu, LazySearchMenu } from './LazyComponents';
import { useParking } from '../context/ParkingContext';
import { useMap } from '../hooks/useMap';
import { ErrorBoundary } from './ErrorBoundary';

export default function MapViewComponent() {
  const { 
    state: { 
      parkingLots
    }
  } = useParking();

  const {
    mapDivRef,
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
  } = useMap();

  return (
    <ErrorBoundary>
      <div className="relative w-full h-screen">
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
        <div ref={mapDivRef} className="w-full h-screen" />
        <LazyParkingInfoTable filters={filters} />
      </div>
    </ErrorBoundary>
  );
}

