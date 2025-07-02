import React from 'react';
import { useParking } from '../context/ParkingContext';
import { ErrorBoundary } from './ErrorBoundary';
import { ComponentError } from '../utils/errors';

export default function ParkingInfoTable() {
  const [isMinimized, setIsMinimized] = React.useState(false);
  const { state } = useParking();
  const { selectedParkingLot, selectedBay, selectedBayAttributes, selectedBayCounts, selectedClosedBayCounts, isLoading, bayColors, error } = state;

  const cleanBayType = (type: string): string => {
    try {
      return type
        .replace(/['"]/g, '') // Remove quotes
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces and other invisible characters
        .trim();
    } catch (error) {
      throw new ComponentError(
        'Failed to clean bay type',
        'ParkingInfoTable',
        error instanceof Error ? error : undefined
      );
    }
  };

  if (error) {
    return (
      <div className="fixed right-0 top-0 z-20">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-4 mr-4 w-64">
          <div className="p-4 text-red-600">
            <h3 className="font-semibold">Error</h3>
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="fixed right-0 top-0 z-20">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-4 mr-4 w-64">
          <div className="flex items-center justify-between p-2 bg-gray-100 h-12 rounded-t-lg">
            <div className="flex items-center">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label={isMinimized ? "Expand table" : "Minimize table"}
              >
                <svg
                  className={`w-5 h-5 transform transition-transform duration-200 ${
                    isMinimized ? 'rotate-180' : ''
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
              <h2 className="text-sm font-medium ml-2">
                {selectedBay ? 'Bay Information' : 'Parking Lot Information'}
              </h2>
            </div>
          </div>
          <div className={`transition-all duration-300 ease-in-out ${
            isMinimized ? 'max-h-0' : 'max-h-[80vh]'
          }`}>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-3rem)]">
              {selectedBay ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">Selected Bay</h3>
                  <div className="space-y-2">
                    {selectedBayAttributes && (
                      <>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Zone:</p>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: bayColors[selectedBayAttributes.baytype] || '#9E9E9E' }}
                              role="img"
                              aria-label={`${selectedBayAttributes.baytype} bay type indicator`}
                            />
                            <span className="font-medium">{selectedBayAttributes.baytype || 'Unknown'}</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Parking Lot:</p>
                          <p className="font-medium">{selectedBayAttributes.parkinglot || 'Unknown'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : selectedParkingLot ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">{selectedParkingLot}</h3>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedBayCounts.map(({ type, count }) => {
                        const cleanedType = cleanBayType(type);
                        const closedCount = selectedClosedBayCounts[cleanedType] || 0;
                        return (
                          <div key={type} className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: bayColors[cleanedType] || '#9E9E9E' }}
                                role="img"
                                aria-label={`${cleanedType} bay type indicator`}
                              />
                              <span>{cleanedType}</span>
                            </div>
                            <span className="font-medium">
                              {count} {closedCount > 0 && (
                                <span className="text-red-500">({closedCount} closed)</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Bays</span>
                          <span>{selectedBayCounts.reduce((sum, { count }) => sum + count, 0)}</span>
                        </div>
                        {Object.values(selectedClosedBayCounts).reduce((sum, count) => sum + count, 0) > 0 && (
                          <div className="flex justify-between font-semibold">
                            <span>Total Closed</span>
                            <span className="text-red-500">
                              {Object.values(selectedClosedBayCounts).reduce((sum, count) => sum + count, 0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-4 p-3 bg-blue-50 rounded-lg">
                        <p>Zoom in to see individual bays. Click on a bay to select it.</p>
                      </div>
                    </div>
                  )}
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
    </ErrorBoundary>
  );
} 