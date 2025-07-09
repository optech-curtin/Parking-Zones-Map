import React from 'react';
import { useParking } from '../context/ParkingContext';
import { ErrorBoundary } from './ErrorBoundary';
import { ComponentError } from '../utils/errors';

interface ParkingInfoTableProps {
  filters: {
    monitoredCarparks: boolean;
    paygZones: boolean;
    baysInCap: boolean;
  };
}

export default function ParkingInfoTable({ filters: _filters }: ParkingInfoTableProps) {
  const [isMinimized, setIsMinimized] = React.useState(false);
  
  const handleToggleMinimize = React.useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);
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
        <div className="bg-[var(--menu-body-bg)] border border-[var(--card-border)] shadow-[var(--shadow)] rounded-lg overflow-hidden mt-4 mr-4 w-64 transition-all duration-300">
          <div className="p-4 text-[var(--accent-red)]">
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
        <div className="bg-[var(--menu-body-bg)] border border-[var(--card-border)] shadow-[var(--shadow)] rounded-lg overflow-hidden mt-4 mr-4 w-64 transition-all duration-300">
          <div className="flex items-center justify-between p-2 bg-[var(--menu-header-bg)] h-12 rounded-t-lg">
            <div className="flex items-center">
              <button
                onClick={handleToggleMinimize}
                className="p-2 rounded-full hover:bg-[var(--menu-hover)] transition-colors"
                aria-label={isMinimized ? "Expand table" : "Minimize table"}
              >
                <svg
                  className={`w-5 h-5 transform transition-transform duration-200 text-[var(--text-secondary)] ${
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
              <h2 className="text-sm font-medium ml-2 text-[var(--text-primary)]">
                {selectedBay ? 'Bay Information' : 'Parking Lot Information'}
              </h2>
            </div>
          </div>
          <div className={`transition-all duration-300 ease-in-out ${
            isMinimized ? 'max-h-0' : 'max-h-[80vh]'
          }`}>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-3rem)] bg-[var(--menu-body-bg)]">
              {selectedBay ? (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Selected Bay</h3>
                  <div className="space-y-2">
                    {selectedBayAttributes && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-primary)]">Zone</span>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-[var(--card-border)]"
                              style={{ backgroundColor: bayColors[selectedBayAttributes.baytype] || '#9E9E9E' }}
                              role="img"
                              aria-label={`${selectedBayAttributes.baytype} bay type indicator`}
                            />
                            <span className="font-medium text-[var(--text-primary)]">{selectedBayAttributes.baytype || 'Unknown'}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-primary)]">Parking Lot</span>
                          <span className="font-medium text-[var(--text-primary)]">{selectedBayAttributes.parkinglot || 'Unknown'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : selectedParkingLot ? (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">{selectedParkingLot}</h3>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-blue)]"></div>
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
                                className="w-4 h-4 rounded-full border border-[var(--card-border)]"
                                style={{ backgroundColor: bayColors[cleanedType] || '#9E9E9E' }}
                                role="img"
                                aria-label={`${cleanedType} bay type indicator`}
                              />
                              <span className="text-[var(--text-primary)]">{cleanedType}</span>
                            </div>
                            <span className="font-medium text-[var(--text-primary)]">
                              {count}
                              {closedCount > 0 && (
                                <span className="text-[var(--accent-red)]"> ({closedCount} closed)</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                      <div className="border-t border-[var(--card-border)] pt-2 mt-2">
                        <div className="flex justify-between font-semibold text-[var(--text-primary)]">
                          <span>Total Bays</span>
                          <span>{selectedBayCounts.reduce((sum, { count }) => sum + count, 0)}</span>
                        </div>
                        {Object.values(selectedClosedBayCounts).reduce((sum, count) => sum + count, 0) > 0 ? (
                          <div className="flex justify-between font-semibold text-[var(--text-primary)]">
                            <span>Total Closed</span>
                            <span className="text-[var(--accent-red)]">
                              {Object.values(selectedClosedBayCounts).reduce((sum, count) => sum + count, 0)}
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <div className="text-sm text-[var(--text-primary)] mt-4 p-3 bg-[var(--menu-hover)] border border-[var(--card-border)] rounded-lg">
                        <p>Zoom in to see individual bays. Click on a bay to select it.</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-[var(--text-muted)] py-8">
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