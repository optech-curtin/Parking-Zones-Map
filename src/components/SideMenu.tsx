'use client';

import React from 'react';

interface SideMenuProps {
  isOpen: boolean;
  selectedParkingLot: string;
  onToggleMenu: () => void;
  onToggleCarpark: () => void;
  carparkStatus: { [key: string]: boolean };
  closedBayCounts: { [key: string]: number };
  totalBayCounts: { [key: string]: number };
  onResetAll: () => void;
  isLoading: boolean;
}

export default function SideMenu({
  isOpen,
  selectedParkingLot,
  onToggleMenu,
  onToggleCarpark,
  carparkStatus,
  closedBayCounts,
  totalBayCounts,
  onResetAll,
  isLoading,
}: SideMenuProps) {
  const isCarparkOpen = !carparkStatus[selectedParkingLot];
  const [isZoneInfoMinimized, setIsZoneInfoMinimized] = React.useState(false);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({
    paygZones: false,
  });

  const handleFilterChange = (filterType: 'paygZones') => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const filteredBayTypes = React.useMemo(() => {
    if (filters.paygZones) {
      return Object.entries(totalBayCounts)
        .filter(([type]) => ['Green', 'Yellow', 'Blue', 'White'].includes(type))
        .sort(([, a], [, b]) => b - a);
    }
    return Object.entries(totalBayCounts)
      .sort(([, a], [, b]) => b - a);
  }, [totalBayCounts, filters.paygZones]);

  return (
    <>
      {/* Main Parking Planning Menu */}
      <div className="fixed left-[50px] top-0 h-full z-30">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-4 ml-4 w-64">
          <div className="flex items-center justify-between p-2 bg-gray-100 h-12 rounded-t-lg">
            <div className="flex items-center">
              <button
                onClick={() => setIsZoneInfoMinimized(!isZoneInfoMinimized)}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <svg
                  className={`w-5 h-5 transform transition-transform duration-200 ${
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
              <h2 className="text-sm font-medium ml-2">Zone Information</h2>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-5 h-5"
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
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-5 h-5"
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
            isZoneInfoMinimized ? 'max-h-0' : 'max-h-[80vh]'
          } overflow-hidden`}>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Bay Type Summary</h3>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[calc(80vh-8rem)] overflow-y-auto pr-2">
                  {filteredBayTypes.map(([type, totalCount]) => (
                    <div key={type} className="flex justify-between">
                      <span>{type}</span>
                      <span className="font-medium">
                        {totalCount} {closedBayCounts[type] > 0 && (
                          <span className="text-red-500">({closedBayCounts[type]} closed)</span>
                        )}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 space-y-2 sticky bottom-0 bg-white">
                    <div className="flex justify-between font-semibold">
                      <span>Total Bays</span>
                      <span>
                        {filteredBayTypes.reduce((sum, [, count]) => sum + count, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total Closed</span>
                      <span className="text-red-500">
                        {filteredBayTypes.reduce((sum, [type]) => sum + (closedBayCounts[type] || 0), 0)}
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
      <div className={`fixed left-[50px] top-0 h-full z-20 transition-all duration-300 ease-in-out ${
        isFilterOpen ? 'translate-x-[calc(16rem+1rem)]' : 'translate-x-0'
      }`}>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-4 ml-4 w-64">
          <div className="flex items-center p-2 bg-gray-100 h-12">
            <h2 className="text-sm font-medium">Filter Options</h2>
          </div>
          <div className={`transition-all duration-300 ease-in-out ${
            isFilterOpen && !isZoneInfoMinimized ? 'max-h-[80vh]' : 'max-h-0'
          } overflow-hidden`}>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.paygZones}
                    onChange={() => handleFilterChange('paygZones')}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">PAYG Zones</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parking Lot Controls Menu */}
      <div className={`fixed left-[50px] top-0 h-full z-10 transition-all duration-300 ease-in-out ${
        isOpen ? (isFilterOpen ? 'translate-x-[calc(32rem+2rem)]' : 'translate-x-[calc(16rem+1rem)]') : 'translate-x-0'
      }`}>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-4 ml-4 w-64">
          <div className="flex items-center p-2 bg-gray-100 h-12">
            <h2 className="text-sm font-medium">Parking Lot Controls</h2>
          </div>
          <div className={`transition-all duration-300 ease-in-out ${
            isOpen && !isZoneInfoMinimized ? 'max-h-[80vh]' : 'max-h-0'
          } overflow-hidden`}>
            <div className="p-4">
              {selectedParkingLot ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">{selectedParkingLot}</h3>
                  <div className="space-y-4">
                    <button
                      onClick={onToggleCarpark}
                      className={`w-full p-2 rounded ${
                        isCarparkOpen
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-500 hover:bg-green-600'
                      } text-white transition-colors`}
                    >
                      {isCarparkOpen ? 'Close Parking Lot' : 'Open Parking Lot'}
                    </button>
                    <button
                      onClick={onResetAll}
                      className="w-full p-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                    >
                      Reset All
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No parking lot selected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 