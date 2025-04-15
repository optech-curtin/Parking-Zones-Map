'use client';

import React, { useState } from 'react';

interface BayTypeCount {
  type: string;
  count: number;
}

interface SideMenuProps {
  isOpen: boolean;
  selectedParkingLot: string;
  bayTypes: BayTypeCount[];
  onToggleMenu: () => void;
  onToggleCarpark: (isOpen: boolean) => void;
  carparkStatus: { [key: string]: boolean };
  closedBayCounts: { [key: string]: number };
}

export default function SideMenu({
  isOpen,
  selectedParkingLot,
  bayTypes,
  onToggleMenu,
  onToggleCarpark,
  carparkStatus,
  closedBayCounts
}: SideMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const isCarparkOpen = carparkStatus[selectedParkingLot] ?? true;

  return (
    <div className={`fixed left-0 top-0 h-screen bg-white shadow-lg transition-all duration-300 ${isOpen ? 'w-64' : 'w-12'}`}>
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="w-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        {isOpen ? '←' : '→'}
      </button>

      {isOpen && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Parking Planner</h2>
          
          {selectedParkingLot && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">{selectedParkingLot}</h3>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => onToggleCarpark(true)}
                  disabled={isCarparkOpen}
                  className={`px-4 py-2 rounded ${isCarparkOpen ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                >
                  Open
                </button>
                <button
                  onClick={() => onToggleCarpark(false)}
                  disabled={!isCarparkOpen}
                  className={`px-4 py-2 rounded ${!isCarparkOpen ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Closed Bays Summary</h3>
            {Object.entries(closedBayCounts).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center py-1">
                <span>{type}</span>
                <span className="text-red-500">{count} closed</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 