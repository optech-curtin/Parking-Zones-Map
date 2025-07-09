import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { ParkingState, ParkingContextProps, BayTypeCount, BayFeatureAttributes } from '../types';
import { ContextError } from '../utils/errors';
import { logger } from '../utils/logger';

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

  // Memoized state setters to prevent unnecessary re-renders
  const setSelectedParkingLot = useCallback((parkingLot: string) => {
    try {
      setState(prev => ({ ...prev, selectedParkingLot: parkingLot }));
      logger.debug(`Selected parking lot: ${parkingLot}`, 'ParkingContext');
    } catch (error) {
      const contextError = new ContextError('Failed to set selected parking lot', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set selected parking lot', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const setHighlightedParkingLot = useCallback((parkingLot: string) => {
    try {
      setState(prev => ({ ...prev, highlightedParkingLot: parkingLot }));
    } catch (error) {
      const contextError = new ContextError('Failed to set highlighted parking lot', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set highlighted parking lot', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const setSelectedBay = useCallback((bay: string | null) => {
    try {
      setState(prev => ({ ...prev, selectedBay: bay }));
    } catch (error) {
      const contextError = new ContextError('Failed to set selected bay', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set selected bay', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const setHighlightedBay = useCallback((bay: string | null) => {
    try {
      setState(prev => ({ ...prev, highlightedBay: bay }));
    } catch (error) {
      const contextError = new ContextError('Failed to set highlighted bay', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set highlighted bay', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const setSelectedBayAttributes = useCallback((attributes: BayFeatureAttributes | null) => {
    try {
      setState(prev => ({ ...prev, selectedBayAttributes: attributes }));
    } catch (error) {
      const contextError = new ContextError('Failed to set selected bay attributes', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set selected bay attributes', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const toggleCarparkStatus = useCallback((parkingLot: string) => {
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
      logger.debug(`Toggled carpark status for: ${parkingLot}`, 'ParkingContext');
    } catch (error) {
      const contextError = new ContextError('Failed to toggle carpark status', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to toggle carpark status', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const resetAllCarparks = useCallback(() => {
    try {
      setState(prev => ({
        ...prev,
        carparkStatus: {},
        closedBayCounts: { ...prev.individualBayClosedCounts } // Reset to only individual bay status
      }));
      logger.info('Reset all carparks', 'ParkingContext');
    } catch (error) {
      const contextError = new ContextError('Failed to reset carparks', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to reset carparks', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const setBayTypeCounts = useCallback((counts: BayTypeCount[]) => {
    try {
      setState(prev => ({ ...prev, bayTypeCounts: counts }));
    } catch (error) {
      const contextError = new ContextError('Failed to set bay type counts', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set bay type counts', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const setSelectedBayCounts = useCallback((counts: BayTypeCount[]) => {
    try {
      setState(prev => ({ ...prev, selectedBayCounts: counts }));
    } catch (error) {
      const contextError = new ContextError('Failed to set selected bay counts', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set selected bay counts', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const setSelectedClosedBayCounts = useCallback((counts: { [key: string]: number }) => {
    try {
      setState(prev => ({ ...prev, selectedClosedBayCounts: counts }));
    } catch (error) {
      const contextError = new ContextError('Failed to set selected closed bay counts', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set selected closed bay counts', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const setTotalBayCounts = useCallback((counts: { [key: string]: number }) => {
    try {
      setState(prev => ({ ...prev, totalBayCounts: counts }));
    } catch (error) {
      const contextError = new ContextError('Failed to set total bay counts', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set total bay counts', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const setMonitoredBayCounts = useCallback((counts: { [key: string]: number }) => {
    try {
      setState(prev => ({ ...prev, monitoredBayCounts: counts }));
    } catch (error) {
      const contextError = new ContextError('Failed to set monitored bay counts', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set monitored bay counts', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const setParkingLots = useCallback((lots: string[]) => {
    try {
      setState(prev => ({ ...prev, parkingLots: lots }));
    } catch (error) {
      const contextError = new ContextError('Failed to set parking lots', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set parking lots', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const setMonitoredCarparks = useCallback((carparks: string[]) => {
    try {
      setState(prev => ({ ...prev, monitoredCarparks: carparks }));
    } catch (error) {
      const contextError = new ContextError('Failed to set monitored carparks', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set monitored carparks', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    try {
      setState(prev => ({ ...prev, isLoading: loading }));
    } catch (error) {
      const contextError = new ContextError('Failed to set loading state', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set loading state', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setIndividualBayClosedCounts = useCallback((counts: { [key: string]: number }) => {
    try {
      setState(prev => ({ ...prev, individualBayClosedCounts: counts }));
    } catch (error) {
      const contextError = new ContextError('Failed to set individual bay closed counts', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set individual bay closed counts', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  const setClosedBayCounts = useCallback((counts: { [key: string]: number }) => {
    try {
      setState(prev => ({ ...prev, closedBayCounts: counts }));
    } catch (error) {
      const contextError = new ContextError('Failed to set closed bay counts', error instanceof Error ? error : undefined);
      setState(prev => ({ ...prev, error: contextError }));
      logger.error('Failed to set closed bay counts', 'ParkingContext', error instanceof Error ? error : undefined);
    }
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo<ParkingContextProps>(() => ({
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
    setIndividualBayClosedCounts,
    setClosedBayCounts,
    setParkingLots,
    setMonitoredCarparks,
    setIsLoading,
    setError
  }), [
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
    setIndividualBayClosedCounts,
    setClosedBayCounts,
    setParkingLots,
    setMonitoredCarparks,
    setIsLoading,
    setError
  ]);

  return (
    <ParkingContext.Provider value={contextValue}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = (): ParkingContextProps => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
}; 