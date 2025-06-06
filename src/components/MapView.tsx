'use client';

import React from 'react';
import ParkingInfoTable from './ParkingInfoTable';
import SideMenu from './SideMenu';
import SearchMenu from './SearchMenu';
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
    setIsMenuOpen,
    isZoneInfoMinimized,
    setIsZoneInfoMinimized,
    isFilterOpen,
    setIsFilterOpen,
    filters,
    setFilters,
    handleSelectParkingLot
  } = useMap();

  return (
    <ErrorBoundary>
    <div className="relative w-full h-screen">
      <SearchMenu
        parkingLots={parkingLots}
        onSelectParkingLot={handleSelectParkingLot}
        isZoneInfoMinimized={isZoneInfoMinimized}
        isFilterOpen={isFilterOpen}
        isMenuOpen={isMenuOpen}
      />
      <SideMenu
        isOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        isZoneInfoMinimized={isZoneInfoMinimized}
        setIsZoneInfoMinimized={setIsZoneInfoMinimized}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        filters={filters}
        setFilters={setFilters}
      />
      <div ref={mapDivRef} className="w-full h-screen" />
        <ParkingInfoTable />
    </div>
    </ErrorBoundary>
  );
}

