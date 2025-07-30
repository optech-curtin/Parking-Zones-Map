# API Reference

This document provides a comprehensive reference for all APIs, services, hooks, and utilities in the Parking Zones Map application.

## Table of Contents

- [Context APIs](#context-apis)
- [Service APIs](#service-apis)
- [Hook APIs](#hook-apis)
- [Component APIs](#component-apis)
- [Utility APIs](#utility-apis)
- [Type Definitions](#type-definitions)
- [Constants](#constants)

## Context APIs

### ParkingContext

Global state management for parking-related data and operations.

#### State Interface

```typescript
interface ParkingState {
  // Selection State
  selectedParkingLot: string;
  highlightedParkingLot: string;
  selectedBay: string | null;
  highlightedBay: string | null;
  selectedBayAttributes: BayFeatureAttributes | null;
  
  // Data State
  carparkStatus: { [key: string]: boolean };
  closedBayCounts: { [key: string]: number };
  individualBayClosedCounts: { [key: string]: number };
  selectedClosedBayCounts: { [key: string]: number };
  totalBayCounts: { [key: string]: number };
  monitoredBayCounts: { [key: string]: number };
  bayTypeCounts: BayTypeCount[];
  selectedBayCounts: BayTypeCount[];
  bayColors: { [key: string]: string };
  parkingLots: string[];
  monitoredCarparks: string[];
  
  // UI State
  isLoading: boolean;
  error: Error | null;
}
```

#### Methods

```typescript
interface ParkingContextProps {
  state: ParkingState;
  
  // Selection Methods
  setSelectedParkingLot: (lot: string) => void;
  setHighlightedParkingLot: (lot: string) => void;
  setSelectedBay: (bay: string | null) => void;
  setHighlightedBay: (bay: string | null) => void;
  setSelectedBayAttributes: (attributes: BayFeatureAttributes | null) => void;
  
  // Data Methods
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
  
  // UI Methods
  setIsLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}
```

#### Usage Example

```typescript
import { useParking } from '../context/ParkingContext';

function MyComponent() {
  const { 
    state: { selectedParkingLot, isLoading },
    setSelectedParkingLot,
    setError 
  } = useParking();
  
  const handleParkingLotSelect = (lot: string) => {
    try {
      setSelectedParkingLot(lot);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  };
  
  return (
    <div>
      {isLoading ? 'Loading...' : `Selected: ${selectedParkingLot}`}
    </div>
  );
}
```

### ToolContext

UI tool selection state management.

#### State Interface

```typescript
type ToolType = 'none' | 'close' | 'open' | 'editBays';

interface ToolContextProps {
  selectedTool: ToolType;
  setSelectedTool: (tool: ToolType) => void;
}
```

#### Usage Example

```typescript
import { useTool } from '../context/ToolContext';

function ToolPanel() {
  const { selectedTool, setSelectedTool } = useTool();
  
  return (
    <div>
      <button 
        onClick={() => setSelectedTool('close')}
        className={selectedTool === 'close' ? 'active' : ''}
      >
        Close Parking Lot
      </button>
    </div>
  );
}
```

## Service APIs

### MapService

Core service for ArcGIS integration and map management.

#### Constructor

```typescript
constructor()
```

**Throws**: `MapServiceError` if `ARCGIS_PORTAL_URL` environment variable is not set.

#### Methods

##### initializeMap

```typescript
async initializeMap(container: HTMLDivElement): Promise<MapView>
```

Initializes the ArcGIS map view in the specified container.

**Parameters**:
- `container`: HTML div element to render the map

**Returns**: Promise resolving to the initialized MapView

**Throws**: `MapServiceError` if initialization fails

##### loadAndProcessFeatures

```typescript
async loadAndProcessFeatures(): Promise<void>
```

Loads and processes all parking-related features from ArcGIS services.

**Throws**: `MapServiceError` if feature loading fails

##### getParkingLotsWithBayType

```typescript
async getParkingLotsWithBayType(bayType: string): Promise<string[]>
```

Retrieves parking lots that contain the specified bay type.

**Parameters**:
- `bayType`: The bay type to search for

**Returns**: Promise resolving to array of parking lot names

##### getSelectedParkingLotBays

```typescript
async getSelectedParkingLotBays(parkingLot: string): Promise<BayTypeCount[]>
```

Gets bay counts for a specific parking lot.

**Parameters**:
- `parkingLot`: Name of the parking lot

**Returns**: Promise resolving to array of bay type counts

##### setupZoomOptimization

```typescript
setupZoomOptimization(view: MapView): void
```

Sets up zoom-based optimization for map performance.

**Parameters**:
- `view`: The MapView instance to optimize

##### preloadAllFeatures

```typescript
async preloadAllFeatures(): Promise<void>
```

Preloads all features to prevent unloading issues.

**Throws**: `MapServiceError` if preloading fails

#### Usage Example

```typescript
import { MapService } from '../services/MapService';

const mapService = new MapService();

// Initialize map
const view = await mapService.initializeMap(mapContainer);

// Load features
await mapService.loadAndProcessFeatures();

// Get parking lots with specific bay type
const lotsWithGreenBays = await mapService.getParkingLotsWithBayType('Green');
```

### CacheService

Performance optimization through caching.

#### Methods

##### getInstance

```typescript
static getInstance(): CacheService
```

Returns the singleton instance of CacheService.

##### get

```typescript
get<T>(key: string): T | undefined
```

Retrieves a value from cache.

**Parameters**:
- `key`: Cache key

**Returns**: Cached value or undefined

##### set

```typescript
set<T>(key: string, value: T, ttl?: number): void
```

Stores a value in cache.

**Parameters**:
- `key`: Cache key
- `value`: Value to cache
- `ttl`: Time to live in milliseconds (optional)

##### clear

```typescript
clear(): void
```

Clears all cached data.

#### Usage Example

```typescript
import { CacheService } from '../services/CacheService';

const cache = CacheService.getInstance();

// Cache data
cache.set('parkingLots', lotsData, 5 * 60 * 1000); // 5 minutes

// Retrieve data
const cachedLots = cache.get('parkingLots');
```

## Hook APIs

### useMap

Custom hook for map interaction and state management.

#### Return Value

```typescript
interface UseMapReturn {
  // Refs
  mapDivRef: React.RefObject<HTMLDivElement>;
  
  // UI State
  isMenuOpen: boolean;
  isZoneInfoMinimized: boolean;
  isFilterOpen: boolean;
  selectedBayTypeFilter: string | null;
  parkingLotsWithSelectedBayType: string[];
  isBayTypeFilterLoading: boolean;
  
  // Filter State
  filters: {
    monitoredCarparks: boolean;
    paygZones: boolean;
    baysInCap: boolean;
  };
  
  // Methods
  toggleMenu: () => void;
  toggleZoneInfo: () => void;
  toggleFilter: () => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  handleBayTypeSelect: (bayType: string) => Promise<void>;
  handleSelectParkingLot: (parkingLot: string, shouldZoom?: boolean) => void;
}
```

#### Usage Example

```typescript
import { useMap } from '../hooks/useMap';

function MapComponent() {
  const {
    mapDivRef,
    isMenuOpen,
    toggleMenu,
    handleSelectParkingLot,
    filters,
    setFilters
  } = useMap();
  
  return (
    <div>
      <div ref={mapDivRef} className="map-container" />
      <button onClick={toggleMenu}>
        {isMenuOpen ? 'Close Menu' : 'Open Menu'}
      </button>
    </div>
  );
}
```

### useMapState

Custom hook for map state management.

#### Return Value

```typescript
interface UseMapStateReturn {
  // State
  mapService: MapService | null;
  isInitialized: boolean;
  error: Error | null;
  
  // Methods
  initializeMap: () => Promise<void>;
  handleMapError: (error: Error) => void;
}
```

## Component APIs

### MapView

Main map integration component.

#### Props

```typescript
// No props - uses context and hooks internally
```

#### Usage

```typescript
import MapView from '../components/MapView';

function App() {
  return (
    <ToolProvider>
      <ParkingProvider>
        <MapView />
      </ParkingProvider>
    </ToolProvider>
  );
}
```

### SideMenu

Parking planning controls component.

#### Props

```typescript
interface SideMenuProps {
  isOpen: boolean;
  onToggleMenu: () => void;
  isZoneInfoMinimized: boolean;
  setIsZoneInfoMinimized: (minimized: boolean) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  selectedBayTypeFilter: string | null;
  handleBayTypeSelect: (bayType: string) => void;
  parkingLotsWithSelectedBayType: string[];
  isBayTypeFilterLoading: boolean;
}
```

### ParkingInfoTable

Parking lot information display component.

#### Props

```typescript
interface ParkingInfoTableProps {
  filters: {
    monitoredCarparks: boolean;
    paygZones: boolean;
    baysInCap: boolean;
  };
}
```

## Utility APIs

### Logger

Structured logging utility.

#### Methods

##### debug

```typescript
debug(message: string, context?: string, data?: unknown): void
```

Logs a debug message.

##### info

```typescript
info(message: string, context?: string, data?: unknown): void
```

Logs an info message.

##### warn

```typescript
warn(message: string, context?: string, error?: Error, data?: unknown): void
```

Logs a warning message.

##### error

```typescript
error(message: string, context?: string, error?: Error, data?: unknown): void
```

Logs an error message.

##### getLogs

```typescript
getLogs(level?: LogLevel): LogEntry[]
```

Retrieves logged entries.

##### clearLogs

```typescript
clearLogs(): void
```

Clears all logged entries.

#### Usage Example

```typescript
import { logger } from '../utils/logger';

logger.info('Application started', 'App');
logger.error('Failed to load features', 'MapService', error);
```

### Error Classes

Custom error classes for different error types.

#### AppError

Base error class for application errors.

```typescript
class AppError extends Error {
  constructor(message: string);
}
```

#### MapServiceError

Error class for map service errors.

```typescript
class MapServiceError extends AppError {
  constructor(message: string, cause?: Error);
}
```

#### ContextError

Error class for context-related errors.

```typescript
class ContextError extends AppError {
  constructor(message: string, originalError?: Error);
}
```

### Debounce Utility

```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void
```

Creates a debounced version of a function.

**Parameters**:
- `func`: Function to debounce
- `wait`: Debounce delay in milliseconds

**Returns**: Debounced function

#### Usage Example

```typescript
import { debounce } from '../utils/debounce';

const debouncedSearch = debounce((query: string) => {
  // Perform search
}, 300);

// Use in event handler
<input onChange={(e) => debouncedSearch(e.target.value)} />
```

## Type Definitions

### Core Types

```typescript
// Feature attributes
interface BayFeatureAttributes {
  OBJECTID: number;
  parkinglot: string;
  baytype: string;
  [key: string]: string | number;
}

interface ParkingFeatureAttributes {
  Zone: string;
  status: string;
  isMonitored: string;
  [key: string]: string | number;
}

// Count types
interface BayTypeCount {
  type: string;
  count: number;
}

interface ParkingLotCount {
  parkingLot: string;
  total: number;
  bayCounts: {
    [bayType: string]: number;
  };
}

// Filter types
interface FilterState {
  monitoredCarparks: boolean;
  paygZones: boolean;
  baysInCap: boolean;
}

// Tool types
type ToolType = 'none' | 'close' | 'open' | 'editBays';
```

### Component Props

```typescript
// Search menu props
interface SearchMenuProps {
  onSelectParkingLot: (parkingLot: string) => void;
  parkingLots: string[];
  isZoneInfoMinimized: boolean;
  isFilterOpen: boolean;
  isMenuOpen: boolean;
}

// Popup modal props
interface PopupModalProps {
  initialBayCount: number;
  onSubmit: (newBayCount: number) => void;
  onClose: () => void;
}
```

## Constants

### ArcGIS Configuration

```typescript
export const ARCGIS_CONFIG = {
  PARKING_LAYER_URL: "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/4",
  DEFAULT_CENTER: [115.894, -32.005] as [number, number],
  DEFAULT_ZOOM: 14,
  PAGE_SIZE: 1000,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
} as const;
```

### Bay Types

```typescript
export const BAY_TYPES = {
  GREEN: 'Green',
  YELLOW: 'Yellow',
  BLUE: 'Blue',
  WHITE: 'White',
  RESERVED: 'Reserved',
  ACROD: 'ACROD',
  COURTESY: 'Courtesy',
  EV: 'EV',
  VISITOR: 'Visitor',
  CAR_SHARE: 'CarShare',
  POLICE: 'Police',
  LOADING: 'Loading',
  TAXI: 'Taxi',
  FACULTY: 'Faculty',
  MAINTENANCE: 'Maintenance',
  DROP_OFF: 'DropOff',
  FIVE_MINUTE: '5Minute',
  FIFTEEN_MINUTE: '15Minute',
  THIRTY_MINUTE: '30Minute',
  NINETY_MINUTE: '90Minute',
  UNKNOWN: 'Unknown',
} as const;
```

### UI Constants

```typescript
export const UI_CONSTANTS = {
  HIGHLIGHT_COLOR: [0, 255, 255, 0.3] as [number, number, number, number],
  HIGHLIGHT_OUTLINE_COLOR: [0, 255, 255, 1] as [number, number, number, number],
  HIGHLIGHT_OUTLINE_WIDTH: 3,
  ZOOM_PADDING: {
    top: 150,
    bottom: 150,
    left: 150,
    right: 150,
  },
  MENU_WIDTH: 320,
  MIN_MENU_HEIGHT: 0,
  MAX_MENU_HEIGHT: 'calc(100vh-2rem)',
} as const;
```

### Error Messages

```typescript
export const ERROR_MESSAGES = {
  MAP_INITIALIZATION: 'Failed to initialize map',
  LAYER_LOADING: 'Failed to load map layers',
  FEATURE_QUERY: 'Failed to query features',
  AUTHENTICATION: 'Authentication failed',
  NETWORK: 'Network error occurred',
  UNKNOWN: 'An unknown error occurred',
} as const;
```

## Performance Considerations

### Memory Management

- Use `useCallback` and `useMemo` for expensive operations
- Implement proper cleanup in useEffect hooks
- Clear caches when appropriate
- Monitor memory usage in development

### Bundle Optimization

- Lazy load heavy components
- Use dynamic imports for ArcGIS modules
- Implement code splitting strategies
- Monitor bundle size with `npm run analyze`

### Caching Strategies

- Cache feature queries with TTL
- Implement request deduplication
- Use browser caching for static assets
- Optimize cache invalidation

## Error Handling

### Error Boundaries

Wrap components with ErrorBoundary for graceful error handling:

```typescript
import { ErrorBoundary } from '../components/ErrorBoundary';

<ErrorBoundary>
  <ComponentThatMightError />
</ErrorBoundary>
```

### Error Recovery

- Implement retry mechanisms for network requests
- Provide fallback UI states
- Log errors for debugging
- Show user-friendly error messages

## Testing

### Unit Testing

```typescript
import { render, screen } from '@testing-library/react';
import { ParkingProvider } from '../context/ParkingContext';

test('component renders correctly', () => {
  render(
    <ParkingProvider>
      <MyComponent />
    </ParkingProvider>
  );
  
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Integration Testing

```typescript
import { MapService } from '../services/MapService';

test('MapService initializes correctly', async () => {
  const mapService = new MapService();
  const mockContainer = document.createElement('div');
  
  const view = await mapService.initializeMap(mockContainer);
  expect(view).toBeDefined();
});
```

## Migration Guide

### Updating Dependencies

1. Check compatibility with ArcGIS Maps SDK
2. Update TypeScript types
3. Test all functionality
4. Update documentation

### Breaking Changes

- Monitor ArcGIS SDK updates
- Test authentication flows
- Verify feature query compatibility
- Check bundle size impact 