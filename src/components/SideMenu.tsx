'use client';

import React from 'react';

interface SideMenuProps {
  isOpen: boolean;
  selectedParkingLot: string;
  onToggleMenu: () => void;
  onToggleCarpark: (isOpen: boolean) => void;
  carparkStatus: { [key: string]: boolean };
  closedBayCounts: { [key: string]: number };
  onResetAll: () => void;
}

export default function SideMenu({
  isOpen,
  selectedParkingLot,
  onToggleMenu,
  onToggleCarpark,
  carparkStatus,
  closedBayCounts,
  onResetAll
}: SideMenuProps) {
  // If the carpark is not in the status map, it's open by default
  const isCarparkOpen = !carparkStatus[selectedParkingLot];

  return (
    <div className="fixed left-4 top-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Toggle Button */}
        <button
          onClick={onToggleMenu}
          className="w-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          {isOpen ? '←' : '→'}
        </button>

        {/* Content Area */}
        <div className={`transition-all duration-300 ${isOpen ? 'max-h-[80vh]' : 'max-h-0'}`}>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Parking Planner</h2>
            
            <button
              onClick={onResetAll}
              className="w-half mb-4 px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Reset All
            </button>

            {selectedParkingLot && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">{selectedParkingLot}</h3>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => onToggleCarpark(true)}
                    disabled={isCarparkOpen}
                    className={`px-4 py-2 rounded transition-colors cursor-pointer ${
                      isCarparkOpen 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => onToggleCarpark(false)}
                    disabled={!isCarparkOpen}
                    className={`px-4 py-2 rounded transition-colors cursor-pointer ${
                      !isCarparkOpen 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Closed Bays Summary</h3>
              {Object.entries(closedBayCounts)
                .filter(([, count]) => count > 0)
                .map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center py-1">
                    <span>{type}</span>
                    <span className="text-red-500">{count} closed</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 