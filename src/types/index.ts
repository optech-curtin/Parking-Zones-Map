// Feature attribute interfaces
export interface BayFeatureAttributes {
  OBJECTID: number;
  parkinglot: string;
  baytype: string;
  [key: string]: any; // For other potential attributes
}

export interface ParkingFeatureAttributes {
  Zone: string;
  status: string;
  isMonitored: string;
  [key: string]: any; // For other potential attributes
}

// Parking-related interfaces
export interface BayTypeCount {
  type: string;
  count: number;
}

export interface ParkingLotCount {
  parkingLot: string;
  total: number;
  bayCounts: {
    [bayType: string]: number;
  };
}

// Context state interfaces
export interface ParkingState {
  selectedParkingLot: string;
  highlightedParkingLot: string;
  carparkStatus: { [key: string]: boolean };
  closedBayCounts: { [key: string]: number };
  totalBayCounts: { [key: string]: number };
  monitoredBayCounts: { [key: string]: number };
  bayTypeCounts: BayTypeCount[];
  selectedBayCounts: BayTypeCount[];
  bayColors: { [key: string]: string };
  parkingLots: string[];
  monitoredCarparks: string[];
  isLoading: boolean;
  error: Error | null;
}

export interface ParkingContextProps {
  state: ParkingState;
  setSelectedParkingLot: (lot: string) => void;
  setHighlightedParkingLot: (lot: string) => void;
  toggleCarparkStatus: (lot: string) => void;
  resetAllCarparks: () => void;
  setBayTypeCounts: (counts: BayTypeCount[]) => void;
  setSelectedBayCounts: (counts: BayTypeCount[]) => void;
  setTotalBayCounts: (counts: { [key: string]: number }) => void;
  setMonitoredCarparks: (carparks: string[]) => void;
  setParkingLots: (lots: string[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

// Component prop interfaces
export interface SearchMenuProps {
  onSelectParkingLot: (parkingLot: string) => void;
  parkingLots: string[];
  isZoneInfoMinimized: boolean;
  isFilterOpen: boolean;
  isMenuOpen: boolean;
}

export interface SideMenuProps {
  isOpen: boolean;
  onToggleMenu: () => void;
  isZoneInfoMinimized: boolean;
  setIsZoneInfoMinimized: (minimized: boolean) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  filters: {
    monitoredCarparks: boolean;
    paygZones: boolean;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    monitoredCarparks: boolean;
    paygZones: boolean;
  }>>;
}

export interface PopupModalProps {
  initialBayCount: number;
  onSubmit: (newBayCount: number) => void;
  onClose: () => void;
} 