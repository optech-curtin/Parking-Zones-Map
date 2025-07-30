// Feature attribute interfaces
export interface BayFeatureAttributes {
  OBJECTID: number;
  parkinglot: string;
  baytype: string;
  [key: string]: string | number; // For other potential attributes including status
}

export interface ParkingFeatureAttributes {
  Zone: string;
  status: string;
  isMonitored: string;
  [key: string]: string | number; // For other potential attributes
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

// Enhanced loading state interface
export interface LoadingProgress {
  phase: 'initializing' | 'authenticating' | 'loading-map' | 'loading-layers' | 'loading-data' | 'preloading' | 'complete';
  progress: number; // 0-100
  message: string;
  details?: string;
}

// Context state interfaces
export interface ParkingState {
  selectedParkingLot: string;
  highlightedParkingLot: string;
  selectedBay: string | null; // New: selected individual bay
  highlightedBay: string | null; // New: highlighted individual bay
  selectedBayAttributes: BayFeatureAttributes | null; // New: store bay attributes for display
  carparkStatus: { [key: string]: boolean };
  closedBayCounts: { [key: string]: number }; // Manually closed + individual bay status
  individualBayClosedCounts: { [key: string]: number }; // Individual bay status only
  selectedClosedBayCounts: { [key: string]: number }; // Individual bay closed counts for selected parking lot
  totalBayCounts: { [key: string]: number };
  monitoredBayCounts: { [key: string]: number };
  bayTypeCounts: BayTypeCount[];
  selectedBayCounts: BayTypeCount[];
  bayColors: { [key: string]: string };
  parkingLots: string[];
  monitoredCarparks: string[];
  isLoading: boolean;
  error: Error | null;
  loadingProgress: LoadingProgress; // Enhanced loading state
}

export interface ParkingContextProps {
  state: ParkingState;
  setSelectedParkingLot: (lot: string) => void;
  setHighlightedParkingLot: (lot: string) => void;
  setSelectedBay: (bay: string | null) => void; // New: set selected bay
  setHighlightedBay: (bay: string | null) => void; // New: set highlighted bay
  setSelectedBayAttributes: (attributes: BayFeatureAttributes | null) => void; // New: set bay attributes
  toggleCarparkStatus: (lot: string) => void;
  resetAllCarparks: () => void;
  setBayTypeCounts: (counts: BayTypeCount[]) => void;
  setSelectedBayCounts: (counts: BayTypeCount[]) => void;
  setSelectedClosedBayCounts: (counts: { [key: string]: number }) => void;
  setTotalBayCounts: (counts: { [key: string]: number }) => void;
  setMonitoredBayCounts: (counts: { [key: string]: number }) => void;
  setIndividualBayClosedCounts: (counts: { [key: string]: number }) => void;
  setClosedBayCounts: (counts: { [key: string]: number }) => void;
  setParkingLots: (lots: string[]) => void;
  setMonitoredCarparks: (carparks: string[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setLoadingProgress: (progress: LoadingProgress) => void; // Enhanced loading progress
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
    baysInCap: boolean;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    monitoredCarparks: boolean;
    paygZones: boolean;
    baysInCap: boolean;
  }>>;
}

export interface PopupModalProps {
  initialBayCount: number;
  onSubmit: (newBayCount: number) => void;
  onClose: () => void;
} 