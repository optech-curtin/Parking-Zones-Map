'use client';

import React from 'react';
import { useParking } from '../context/ParkingContext';

interface SideMenuProps {
  isOpen: boolean;
  onToggleMenu: () => void;
  isZoneInfoMinimized: boolean;
  setIsZoneInfoMinimized: (minimized: boolean) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  filters: { monitoredCarparks: boolean; paygZones: boolean; baysInCap: boolean };
  setFilters: React.Dispatch<React.SetStateAction<{ monitoredCarparks: boolean; paygZones: boolean; baysInCap: boolean }>>;
  selectedBayTypeFilter: string | null;
  handleBayTypeSelect: (bayType: string) => void;
  parkingLotsWithSelectedBayType: string[];
  isBayTypeFilterLoading: boolean;
}

export default function SideMenu({
  isOpen,
  onToggleMenu,
  isZoneInfoMinimized,
  setIsZoneInfoMinimized,
  isFilterOpen,
  setIsFilterOpen,
  filters,
  setFilters,
  selectedBayTypeFilter,
  handleBayTypeSelect,
  parkingLotsWithSelectedBayType,
  isBayTypeFilterLoading,
}: SideMenuProps) {
  const { 
    state: { 
      selectedParkingLot, 
      carparkStatus, 
      closedBayCounts, 
      totalBayCounts,
      monitoredBayCounts,
      filteredTotalBayCounts,
      filteredMonitoredBayCounts,
      bayColors, 
      isLoading 
    },
    toggleCarparkStatus,
    resetAllCarparks
  } = useParking();

  const isCarparkOpen = !carparkStatus[selectedParkingLot];



  const handlePaygZonesChange = React.useCallback(() => {
    setFilters(prev => ({
      ...prev,
      paygZones: !prev.paygZones
    }));
  }, [setFilters]);

  const handleMonitoredCarparksChange = React.useCallback(() => {
    setFilters(prev => ({
      ...prev,
      monitoredCarparks: !prev.monitoredCarparks
    }));
  }, [setFilters]);

  const handleBaysInCapChange = React.useCallback(() => {
    setFilters(prev => ({
      ...prev,
      baysInCap: !prev.baysInCap
    }));
  }, [setFilters]);

  const handleToggleCarparkStatus = React.useCallback(() => {
    if (selectedParkingLot) {
      toggleCarparkStatus(selectedParkingLot);
    }
  }, [toggleCarparkStatus, selectedParkingLot]);

  const handleBayTypeClick = React.useCallback((type: string) => {
    handleBayTypeSelect(type);
  }, [handleBayTypeSelect]);

  const createBayTypeClickHandler = React.useCallback((type: string) => () => {
    handleBayTypeClick(type);
  }, [handleBayTypeClick]);

  // Get closed bays for filtered parking lots
  const filteredClosedBayCounts = React.useMemo(() => {
    // closedBayCounts already includes both individual bay closed counts and manually closed parking lot counts
    // So we can use it directly without additional processing
    const filteredCounts = { ...closedBayCounts };
    
    // Apply PAYG filter if active
    if (filters.paygZones) {
      const paygTypes = ['Green', 'Yellow', 'Blue', 'White'];
      const paygFilteredCounts: { [key: string]: number } = {};
      
      Object.entries(filteredCounts).forEach(([type, count]) => {
        if (paygTypes.includes(type)) {
          paygFilteredCounts[type] = count;
        }
      });
      
      return paygFilteredCounts;
    }

    // Apply Bays in Cap filter if active
    if (filters.baysInCap) {
      const baysInCapTypes = ['Green', 'White', 'Yellow', 'Blue', 'Reserved', 'ACROD', 'Courtesy', 'EV', '15Minute', '30Minute', '90Minute', 'Maintenance', 'Faculty'];
      const baysInCapFilteredCounts: { [key: string]: number } = {};
      
      Object.entries(filteredCounts).forEach(([type, count]) => {
        if (baysInCapTypes.includes(type)) {
          baysInCapFilteredCounts[type] = count;
        }
      });
      
      return baysInCapFilteredCounts;
    }
    
    return filteredCounts;
  }, [closedBayCounts, filters.paygZones, filters.baysInCap]);

  const filteredBayTypes = React.useMemo(() => {
    // Use monitoredBayCounts if the monitoredCarparks filter is active, otherwise use totalBayCounts
    const counts = filters.monitoredCarparks ? monitoredBayCounts : totalBayCounts;
    let filtered = Object.entries(counts);

    if (filters.paygZones) {
      filtered = filtered.filter(([type]) => ['Green', 'Yellow', 'Blue', 'White'].includes(type));
    }

    if (filters.baysInCap) {
      filtered = filtered.filter(([type]) => ['Green', 'White', 'Yellow', 'Blue', 'Reserved', 'Reserved_Residential', 'ACROD', 'Courtesy', 'EV', '15Minute', '30Minute', '90Minute', 'Maintenance', 'Faculty'].includes(type));
    }

    return filtered.sort(([, a], [, b]) => b - a);
  }, [totalBayCounts, monitoredBayCounts, filters.paygZones, filters.monitoredCarparks, filters.baysInCap]);

  // Calculate total closed bays across all bay types for filtered parking lots
  const totalClosedBays = React.useMemo(() => {
    return Object.values(filteredClosedBayCounts || {}).reduce((sum, count) => sum + count, 0);
  }, [filteredClosedBayCounts]);

  // Calculate total bays in cap (matching the baysInCap filter criteria)
  const totalBaysInCap = React.useMemo(() => {
    const baysInCapTypes = ['Green', 'White', 'Yellow', 'Blue', 'Reserved', 'Reserved_Residential', 'ACROD', 'Courtesy', 'EV', '15Minute', '30Minute', '90Minute', 'Maintenance', 'Faculty'];
    
    // Start with all bay types that match baysInCap criteria
    let eligibleTypes = baysInCapTypes;
    
    // Apply PAYG filter if active
    if (filters.paygZones) {
      const paygTypes = ['Green', 'Yellow', 'Blue', 'White'];
      eligibleTypes = eligibleTypes.filter(type => paygTypes.includes(type));
    }
    
    // Always use filtered counts for "Total in Cap" to exclude temporary parking lots (TCP1, TCP2, etc.)
    // and excluded parking lots (PT1, PT2, PT3, PT4, PT5, PT7)
    // This ensures "Total in Cap" represents the actual total of bays in cap, regardless of filter state
    const counts = filters.monitoredCarparks 
      ? filteredMonitoredBayCounts
      : filteredTotalBayCounts;
    
    const result = Object.entries(counts || {})
      .filter(([type]) => eligibleTypes.includes(type))
      .reduce((sum, [, count]) => sum + count, 0);
    
    // Debug logging for "Total in Cap" calculation
    // console.log(`Total in Cap calculation:`, {
    //   filters: { paygZones: filters.paygZones, monitoredCarparks: filters.monitoredCarparks },
    //   eligibleTypes,
    //   counts: Object.entries(counts || {}).filter(([type]) => eligibleTypes.includes(type)),
    //   result,
    //   note: 'Always uses filtered counts (excludes TCP1/TCP2 and PT1/PT2/PT3/PT4/PT5/PT7)'
    // });
    
    return result;
  }, [filteredTotalBayCounts, filteredMonitoredBayCounts, filters.paygZones, filters.monitoredCarparks]);

  return (
    <>
      {/* Main Parking Planning Menu */}
      <div className="fixed left-[50px] top-0 z-30">
        <div className="bg-[var(--menu-body-bg)] border border-[var(--card-border)] shadow-[var(--shadow)] rounded-lg overflow-hidden mt-4 ml-4 w-80 min-h-0 max-h-[calc(100vh-2rem)] flex flex-col transition-all duration-300">
          <div className="flex items-center justify-between p-2 bg-[var(--menu-header-bg)] h-12 rounded-t-lg flex-shrink-0">
            <div className="flex items-center">
              <button
                onClick={React.useCallback(() => setIsZoneInfoMinimized(!isZoneInfoMinimized), [isZoneInfoMinimized, setIsZoneInfoMinimized])}
                className="p-0.5 rounded-full hover:bg-[var(--menu-hover)] transition-colors"
              >
                <svg
                  className={`w-5 h-5 transform transition-transform duration-200 text-[var(--text-secondary)] ${
                    isZoneInfoMinimized ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <h2 className="text-sm font-medium ml-2 text-[var(--text-primary)]">Zone Information</h2>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={React.useCallback(() => setIsFilterOpen(!isFilterOpen), [isFilterOpen, setIsFilterOpen])}
                className="p-0.5 rounded-full hover:bg-[var(--menu-hover)] transition-colors"
              >
                <svg
                  className="w-5 h-5 text-[var(--text-secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </button>
              <button
                onClick={onToggleMenu}
                className="p-0.5 rounded-full hover:bg-[var(--menu-hover)] transition-colors"
              >
                <svg
                  className="w-5 h-5 text-[var(--text-secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
          <div className={`transition-all duration-300 ease-in-out ${
            isZoneInfoMinimized ? 'max-h-0' : 'max-h-[calc(100vh-6rem)]'
          } overflow-hidden`}>
            <div className="p-4 flex flex-col bg-[var(--menu-body-bg)]">
              <h3 className="text-lg font-semibold mb-4 flex-shrink-0 text-[var(--text-primary)]">Bay Type Summary</h3>
              {isLoading ? (
                <div className="flex justify-center items-center h-32 flex-shrink-0">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-blue)]"></div>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2">
                  {filteredBayTypes.map(([type, totalCount]) => (
                    <button
                      key={type}
                      onClick={createBayTypeClickHandler(type)}
                      className={`w-full cursor-pointer flex justify-between items-center p-px rounded transition-colors ${
                        selectedBayTypeFilter === type
                          ? 'bg-[var(--accent-blue)] bg-opacity-20 border border-[var(--accent-blue)]'
                          : 'hover:bg-[var(--menu-hover)]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-[var(--card-border)]"
                          style={{ backgroundColor: bayColors[type] || '#9E9E9E' }}
                        />
                        <span className="text-[var(--text-primary)]">{type}</span>
                        {selectedBayTypeFilter === type && parkingLotsWithSelectedBayType.length > 0 ? (
                          <span className="text-xs text-[var(--accent-blue)] font-medium">
                            ({parkingLotsWithSelectedBayType.length} lots)
                          </span>
                        ) : null}
                        {selectedBayTypeFilter === type && isBayTypeFilterLoading ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[var(--accent-blue)]"></div>
                        ) : null}
                      </div>
                      <span className="font-medium text-[var(--text-primary)]">
                        {totalCount} {filteredClosedBayCounts[type] > 0 ? (
                          <span className="text-[var(--accent-red)]">({filteredClosedBayCounts[type]} closed)</span>
                        ) : null}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-[var(--card-border)] pt-2 mt-2 space-y-2 sticky bottom-0 bg-[var(--menu-body-bg)]">
                    <div className="flex justify-between font-semibold text-[var(--text-primary)]">
                      <span>Total Bays</span>
                      <span>
                        {filteredBayTypes?.reduce((sum, [, count]) => sum + count, 0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-[var(--text-primary)]">
                      <span>Total in Cap</span>
                      <span className="text-[var(--accent-blue)]">
                        {totalBaysInCap}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-[var(--text-primary)]">
                      <span>Total Closed</span>
                      <span className="text-[var(--accent-red)]">
                        {totalClosedBays}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Menu */}
      <div className={`fixed left-[50px] top-0 z-20 transition-all duration-300 ease-in-out ${
        isFilterOpen ? 'translate-x-[calc(20rem+1.5rem)]' : 'translate-x-0'
      }`}>
        <div className="bg-[var(--menu-body-bg)] border border-[var(--card-border)] shadow-[var(--shadow)] rounded-lg overflow-hidden mt-4 ml-4 w-56 min-h-0 max-h-[calc(100vh-2rem)] flex flex-col transition-all duration-300">
          <div className="flex items-center p-2 bg-[var(--menu-header-bg)] h-12 flex-shrink-0">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Filter Options</h2>
          </div>
          <div className={`transition-all duration-300 ease-in-out ${
            isFilterOpen && !isZoneInfoMinimized ? 'max-h-[calc(100vh-6rem)]' : 'max-h-0'
          } overflow-hidden`}>
            <div className="p-4 bg-[var(--menu-body-bg)]">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.paygZones}
                    onChange={handlePaygZonesChange}
                    className="rounded text-[var(--accent-blue)] focus:ring-[var(--accent-blue)]"
                  />
                  <span className="text-sm font-medium text-[var(--text-primary)]">PAYG Zones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.monitoredCarparks}
                    onChange={handleMonitoredCarparksChange}
                    className="rounded text-[var(--accent-blue)] focus:ring-[var(--accent-blue)]"
                  />
                  <span className="text-sm font-medium text-[var(--text-primary)]">ParkAid Monitored Carparks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.baysInCap}
                    onChange={handleBaysInCapChange}
                    className="rounded text-[var(--accent-blue)] focus:ring-[var(--accent-blue)]"
                  />
                  <span className="text-sm font-medium text-[var(--text-primary)]">Bays in Cap</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parking Lot Controls Menu */}
      <div className={`fixed left-[50px] top-0 transition-all duration-300 ease-in-out ${
        isOpen ? (isFilterOpen ? 'translate-x-[calc(35rem+1.5rem)]' : 'translate-x-[calc(20rem+1.5rem)]') : 'translate-x-0'
      } ${isOpen ? 'z-30' : 'z-0 pointer-events-none'}`}>
        <div className="bg-[var(--menu-body-bg)] border border-[var(--card-border)] shadow-[var(--shadow)] rounded-lg overflow-hidden mt-4 ml-4 w-64 min-h-0 max-h-[calc(100vh-2rem)] flex flex-col transition-all duration-300">
          <div className="flex items-center p-2 bg-[var(--menu-header-bg)] h-12 flex-shrink-0">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Parking Lot Controls</h2>
          </div>
          <div className={`transition-all duration-300 ease-in-out ${
            isOpen && !isZoneInfoMinimized ? 'max-h-[calc(100vh-6rem)]' : 'max-h-0'
          } overflow-hidden`}>
            <div className="p-4 bg-[var(--menu-body-bg)]">
              {selectedParkingLot ? (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">{selectedParkingLot}</h3>
                  <div className="space-y-4">
                    <button
                      onClick={handleToggleCarparkStatus}
                      className={`w-full p-2 rounded transition-colors ${
                        isCarparkOpen
                          ? 'bg-[var(--accent-red)] hover:bg-red-600'
                          : 'bg-[var(--accent-green)] hover:bg-green-600'
                      } text-white`}
                    >
                      {isCarparkOpen ? 'Close Parking Lot' : 'Open Parking Lot'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-[var(--text-muted)] py-4">
                  No parking lot selected
                </div>
              )}
              <div className="mt-4">
                <button
                  onClick={resetAllCarparks}
                  className="w-full p-2 bg-[var(--menu-hover)] hover:bg-[var(--menu-bg)] rounded transition-colors text-[var(--text-primary)]"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 