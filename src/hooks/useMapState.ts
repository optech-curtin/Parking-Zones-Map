import { useState, useCallback, useMemo } from 'react';

export interface MapUIState {
  isMenuOpen: boolean;
  isZoneInfoMinimized: boolean;
  isFilterOpen: boolean;
  selectedBayTypeFilter: string | null;
  parkingLotsWithSelectedBayType: string[];
  isBayTypeFilterLoading: boolean;
  filters: {
    monitoredCarparks: boolean;
    paygZones: boolean;
    baysInCap: boolean;
  };
}

export interface MapUIHandlers {
  toggleMenu: () => void;
  toggleZoneInfo: () => void;
  toggleFilter: () => void;
  setSelectedBayTypeFilter: (filter: string | null) => void;
  setParkingLotsWithSelectedBayType: (lots: string[]) => void;
  setIsBayTypeFilterLoading: (loading: boolean) => void;
  setFilters: React.Dispatch<React.SetStateAction<{
    monitoredCarparks: boolean;
    paygZones: boolean;
    baysInCap: boolean;
  }>>;
}

export function useMapUIState(): [MapUIState, MapUIHandlers] {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isZoneInfoMinimized, setIsZoneInfoMinimized] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBayTypeFilter, setSelectedBayTypeFilter] = useState<string | null>(null);
  const [parkingLotsWithSelectedBayType, setParkingLotsWithSelectedBayType] = useState<string[]>([]);
  const [isBayTypeFilterLoading, setIsBayTypeFilterLoading] = useState(false);
  const [filters, setFilters] = useState({ 
    monitoredCarparks: false,
    paygZones: false,
    baysInCap: false
  });

  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const toggleZoneInfo = useCallback(() => setIsZoneInfoMinimized(prev => !prev), []);
  const toggleFilter = useCallback(() => setIsFilterOpen(prev => !prev), []);

  const state: MapUIState = useMemo(() => ({
    isMenuOpen,
    isZoneInfoMinimized,
    isFilterOpen,
    selectedBayTypeFilter,
    parkingLotsWithSelectedBayType,
    isBayTypeFilterLoading,
    filters
  }), [
    isMenuOpen,
    isZoneInfoMinimized,
    isFilterOpen,
    selectedBayTypeFilter,
    parkingLotsWithSelectedBayType,
    isBayTypeFilterLoading,
    filters
  ]);

  const handlers: MapUIHandlers = useMemo(() => ({
    toggleMenu,
    toggleZoneInfo,
    toggleFilter,
    setSelectedBayTypeFilter,
    setParkingLotsWithSelectedBayType,
    setIsBayTypeFilterLoading,
    setFilters
  }), [
    toggleMenu,
    toggleZoneInfo,
    toggleFilter,
    setSelectedBayTypeFilter,
    setParkingLotsWithSelectedBayType,
    setIsBayTypeFilterLoading,
    setFilters
  ]);

  return [state, handlers];
} 