import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ParkingState, ParkingContextProps, BayTypeCount, BayFeatureAttributes } from '../types';
import { ContextError } from '../utils/errors';

const initialState: ParkingState = {
  selectedParkingLot: '',
  highlightedParkingLot: '',
  selectedBay: null,
  highlightedBay: null,
  selectedBayAttributes: null,
  carparkStatus: {},
  closedBayCounts: {},
  individualBayClosedCounts: {},
  selectedClosedBayCounts: {},
  totalBayCounts: {},
  monitoredBayCounts: {},
  bayTypeCounts: [],
  selectedBayCounts: [],
  bayColors: {
    'Green': '#71ad47',
    'Yellow': '#ffff00',
    'Reserved': '#b7619b',
    '5Minute': '#ffd37f',
    '15Minute': '#ed7d32',
    '30Minute': '#ffd37f',
    '90Minute': '#e69800',
    'Blue': '#5b9bd5',
    'White': '#e7e6e6',
    'ACROD': '#4472c4',
    'Courtesy': '#9bc2e6',
    'Motorcycle': '#1a1a1a',
    'EV': '#06b050',
    'Visitor': '#149ece',
    'CarShare': '#e8e830',
    'Police': '#0133cc',
    'Loading': '#808080',
    'Taxi': '#ff0000',
    'Faculty': '#fce4d6',
    'Maintenance': '#bf8f00',
    'DropOff': '#833c0b',
    'Unknown': '#9E9E9E'
  },
  parkingLots: [],
  monitoredCarparks: [],
  isLoading: true,
  error: null
};

const ParkingContext = createContext<ParkingContextProps | undefined>(undefined);

export const ParkingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ParkingState>(initialState);

  const setSelectedParkingLot = (parkingLot: string) => {
    try {
      setState(prev => ({ ...prev, selectedParkingLot: parkingLot }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to set selected parking lot', error instanceof Error ? error : undefined)
      }));
    }
  };

  const setHighlightedParkingLot = (parkingLot: string) => {
    try {
      setState(prev => ({ ...prev, highlightedParkingLot: parkingLot }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to set highlighted parking lot', error instanceof Error ? error : undefined)
      }));
    }
  };

  const setSelectedBay = (bay: string | null) => {
    try {
      setState(prev => ({ ...prev, selectedBay: bay }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to set selected bay', error instanceof Error ? error : undefined)
      }));
    }
  };

  const setHighlightedBay = (bay: string | null) => {
    try {
      setState(prev => ({ ...prev, highlightedBay: bay }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to set highlighted bay', error instanceof Error ? error : undefined)
      }));
    }
  };

  const setSelectedBayAttributes = (attributes: BayFeatureAttributes | null) => {
    try {
      setState(prev => ({ ...prev, selectedBayAttributes: attributes }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to set selected bay attributes', error instanceof Error ? error : undefined)
      }));
    }
  };

  const toggleCarparkStatus = (parkingLot: string) => {
    try {
      setState(prev => {
        const newCarparkStatus = {
          ...prev.carparkStatus,
          [parkingLot]: !prev.carparkStatus[parkingLot]
        };

        // Calculate new closed bay counts combining manual and individual bay status
        const newClosedBayCounts = { ...prev.individualBayClosedCounts }; // Start with individual bay status
        const isClosed = newCarparkStatus[parkingLot];

        // If the parking lot is being closed, add its bays to closed counts
        if (isClosed) {
          prev.selectedBayCounts.forEach(({ type, count }) => {
            newClosedBayCounts[type] = (newClosedBayCounts[type] || 0) + count;
          });
        } else {
          // If the parking lot is being opened, remove its bays from closed counts
          // but keep the individual bay closed counts
          prev.selectedBayCounts.forEach(({ type, count }) => {
            const individualClosed = prev.individualBayClosedCounts[type] || 0;
            newClosedBayCounts[type] = Math.max(individualClosed, (newClosedBayCounts[type] || 0) - count);
          });
        }

        return {
          ...prev,
          carparkStatus: newCarparkStatus,
          closedBayCounts: newClosedBayCounts
        };
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to toggle carpark status', error instanceof Error ? error : undefined)
      }));
    }
  };

  const resetAllCarparks = () => {
    try {
      setState(prev => ({
        ...prev,
        carparkStatus: {},
        closedBayCounts: { ...prev.individualBayClosedCounts } // Reset to only individual bay status
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to reset carparks', error instanceof Error ? error : undefined)
      }));
    }
  };

  const setBayTypeCounts = (counts: BayTypeCount[]) => {
    try {
      setState(prev => ({ ...prev, bayTypeCounts: counts }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to set bay type counts', error instanceof Error ? error : undefined)
      }));
    }
  };

  const setSelectedBayCounts = (counts: BayTypeCount[]) => {
    try {
      setState(prev => ({ ...prev, selectedBayCounts: counts }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to set selected bay counts', error instanceof Error ? error : undefined)
      }));
    }
  };

  const setSelectedClosedBayCounts = (counts: { [key: string]: number }) => {
    try {
      setState(prev => ({ ...prev, selectedClosedBayCounts: counts }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to set selected closed bay counts', error instanceof Error ? error : undefined)
      }));
    }
  };

  const setTotalBayCounts = (counts: { [key: string]: number }) => {
    try {
      setState(prev => ({ ...prev, totalBayCounts: counts }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to set total bay counts', error instanceof Error ? error : undefined)
      }));
    }
  };

  const setMonitoredBayCounts = (counts: { [key: string]: number }) => {
    try {
      setState(prev => ({ ...prev, monitoredBayCounts: counts }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to set monitored bay counts', error instanceof Error ? error : undefined)
      }));
    }
  };

  const setParkingLots = (lots: string[]) => {
    try {
      setState(prev => ({ ...prev, parkingLots: lots }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to set parking lots', error instanceof Error ? error : undefined)
      }));
    }
  };

  const setMonitoredCarparks = (carparks: string[]) => {
    try {
      setState(prev => ({ ...prev, monitoredCarparks: carparks }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to set monitored carparks', error instanceof Error ? error : undefined)
      }));
    }
  };

  const setIsLoading = (loading: boolean) => {
    try {
      setState(prev => ({ ...prev, isLoading: loading }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to set loading state', error instanceof Error ? error : undefined)
      }));
    }
  };

  const setError = (error: Error | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setIndividualBayClosedCounts = (counts: { [key: string]: number }) => {
    try {
      setState(prev => ({
        ...prev, 
        individualBayClosedCounts: counts,
        closedBayCounts: { ...counts } // Start with individual bay closed counts
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to set individual bay closed counts', error instanceof Error ? error : undefined)
      }));
    }
  };

  const value = {
    state,
    setSelectedParkingLot,
    setHighlightedParkingLot,
    setSelectedBay,
    setHighlightedBay,
    setSelectedBayAttributes,
    toggleCarparkStatus,
    resetAllCarparks,
    setBayTypeCounts,
    setSelectedBayCounts,
    setSelectedClosedBayCounts,
    setTotalBayCounts,
    setMonitoredBayCounts,
    setParkingLots,
    setMonitoredCarparks,
    setIsLoading,
    setError,
    setIndividualBayClosedCounts
  };

  return (
    <ParkingContext.Provider
      value={value}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = (): ParkingContextProps => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new ContextError('useParking must be used within a ParkingProvider');
  }
  return context;
}; 