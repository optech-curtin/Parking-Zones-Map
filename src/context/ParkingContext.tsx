import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ParkingState, ParkingContextProps, BayTypeCount } from '../types';
import { ContextError } from '../utils/errors';

const initialState: ParkingState = {
  selectedParkingLot: '',
  highlightedParkingLot: '',
  carparkStatus: {},
  closedBayCounts: {},
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

  const toggleCarparkStatus = (parkingLot: string) => {
    try {
      setState(prev => ({
        ...prev,
        carparkStatus: {
          ...prev.carparkStatus,
          [parkingLot]: !prev.carparkStatus[parkingLot]
        }
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: new ContextError('Failed to toggle carpark status', error instanceof Error ? error : undefined)
      }));
    }
  };

  const resetAllCarparks = () => {
    try {
      setState(prev => ({ ...prev, carparkStatus: {} }));
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

  const value = {
    state,
    setSelectedParkingLot,
    setHighlightedParkingLot,
    toggleCarparkStatus,
    resetAllCarparks,
    setBayTypeCounts,
    setSelectedBayCounts,
    setTotalBayCounts,
    setMonitoredBayCounts,
    setParkingLots,
    setMonitoredCarparks,
    setIsLoading,
    setError
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