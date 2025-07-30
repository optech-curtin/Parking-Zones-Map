# Architecture Overview

This document provides a comprehensive overview of the Parking Zones Map application architecture, including system design, component relationships, and data flow patterns.

## System Architecture

The application follows a modern React-based architecture with clear separation of concerns and optimized performance patterns.

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Components (MapView, SideMenu, ParkingInfoTable, etc.)     │
├─────────────────────────────────────────────────────────────┤
│                    State Management Layer                   │
├─────────────────────────────────────────────────────────────┤
│  React Context (ParkingContext, ToolContext)               │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Custom Hooks (useMap, useMapState)                        │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                            │
├─────────────────────────────────────────────────────────────┤
│  MapService, CacheService, MapInitializationService        │
├─────────────────────────────────────────────────────────────┤
│                    External Services                        │
├─────────────────────────────────────────────────────────────┤
│  ArcGIS Enterprise (OAuth, Feature Services, WebMap)       │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Core Components

#### 1. MapView Component
**Purpose**: Main map integration and coordination hub

**Responsibilities**:
- ArcGIS map initialization and management
- Component coordination and layout
- Error boundary implementation

**Key Features**:
- Lazy loading of heavy components
- Responsive layout management
- Error handling and recovery

```typescript
// Component Structure
MapView
├── LazySearchMenu
├── LazySideMenu
├── Map Container (ArcGIS)
└── LazyParkingInfoTable
```

#### 2. SideMenu Component
**Purpose**: Parking planning controls and filtering

**Responsibilities**:
- Filter management (PAYG, monitored carparks, bays in cap)
- Bay type selection and filtering
- Parking lot status controls

**State Management**:
- Local UI state (open/close, minimize)
- Filter state synchronization
- Real-time data updates

#### 3. ParkingInfoTable Component
**Purpose**: Display selected parking lot information

**Responsibilities**:
- Bay count display and calculations
- Real-time data updates
- Responsive information presentation

**Data Flow**:
- Receives data from ParkingContext
- Performs calculations for totals
- Updates UI based on selection state

#### 4. SearchMenu Component
**Purpose**: Parking lot search and selection

**Responsibilities**:
- Search functionality
- Parking lot selection
- Navigation coordination

## State Management Architecture

### Context Providers

#### ParkingContext
**Purpose**: Global parking state management

**State Structure**:
```typescript
interface ParkingState {
  // Selection State
  selectedParkingLot: string;
  highlightedParkingLot: string;
  selectedBay: string | null;
  highlightedBay: string | null;
  
  // Data State
  parkingLots: string[];
  bayTypeCounts: BayTypeCount[];
  carparkStatus: { [key: string]: boolean };
  
  // UI State
  isLoading: boolean;
  error: Error | null;
}
```

**Key Features**:
- Optimized state setters with useCallback
- Comprehensive error handling
- Type-safe state updates
- Performance optimizations

#### ToolContext
**Purpose**: UI tool selection state

**State Structure**:
```typescript
interface ToolContextProps {
  selectedTool: ToolType; // 'none' | 'close' | 'open' | 'editBays'
  setSelectedTool: (tool: ToolType) => void;
}
```

### State Flow Patterns

```
User Action → Component → Hook → Context → Service → ArcGIS
     ↓
UI Update ← Component ← Hook ← Context ← Service ← ArcGIS
```

## Service Layer Architecture

### MapService
**Purpose**: ArcGIS integration and feature management

**Core Responsibilities**:
- Map initialization and configuration
- Feature layer management
- Query optimization and caching
- Renderer management

**Key Methods**:
```typescript
class MapService {
  async initializeMap(container: HTMLDivElement): Promise<MapView>
  async loadAndProcessFeatures(): Promise<void>
  async getParkingLotsWithBayType(bayType: string): Promise<string[]>
  setupZoomOptimization(view: MapView): void
}
```

**Performance Features**:
- Pagination for large datasets
- Caching strategies
- Feature preloading
- Memory management

### CacheService
**Purpose**: Performance optimization through caching

**Features**:
- TTL-based caching
- Memory management
- Cache invalidation strategies
- Singleton pattern implementation

### MapInitializationService
**Purpose**: Map setup and configuration management

**Responsibilities**:
- ArcGIS configuration
- Layer setup
- Authentication management
- Error handling

## Data Flow Architecture

### 1. Application Initialization

```
App Start → OAuth Authentication → Map Initialization → Feature Loading → UI Ready
```

### 2. User Interaction Flow

```
User Click → Event Handler → Hook Processing → Context Update → Service Call → UI Update
```

### 3. Real-time Data Updates

```
ArcGIS Update → Service Polling → Context Update → Component Re-render → UI Update
```

## Performance Architecture

### Optimization Strategies

#### 1. Lazy Loading
- Heavy components loaded dynamically
- Code splitting for ArcGIS modules
- Progressive enhancement

#### 2. Caching
- Feature data caching
- Query result caching
- UI state caching

#### 3. Debouncing
- User input debouncing
- Map interaction debouncing
- Search query debouncing

#### 4. Memoization
- Component memoization
- Hook result memoization
- Expensive calculation memoization

### Bundle Optimization

```
Bundle Structure:
├── Main Bundle (React, Next.js)
├── ArcGIS Bundle (Map SDK)
├── Vendor Bundle (Third-party libraries)
└── Component Bundles (Lazy-loaded components)
```

## Security Architecture

### Authentication Flow

```
User Access → OAuth Redirect → ArcGIS Portal → Token Exchange → App Access
```

### Security Measures

1. **OAuth 2.0 Implementation**
   - Secure token management
   - Automatic token refresh
   - Proper scope management

2. **Input Validation**
   - Type-safe data handling
   - Sanitization of user inputs
   - Error boundary protection

3. **Environment Security**
   - Environment variable management
   - Secure configuration handling
   - Production security headers

## Error Handling Architecture

### Error Boundaries

```
App Level → Component Level → Service Level → External Service Level
```

### Error Types

1. **ContextError**: State management errors
2. **MapServiceError**: ArcGIS integration errors
3. **FeatureQueryError**: Data query errors
4. **ComponentError**: UI component errors

### Error Recovery

- Graceful degradation
- Automatic retry mechanisms
- User-friendly error messages
- Fallback UI states

## Testing Architecture

### Testing Strategy

```
Unit Tests → Integration Tests → E2E Tests → Performance Tests
```

### Test Coverage

- **Components**: 70% minimum
- **Services**: 80% minimum
- **Hooks**: 90% minimum
- **Utilities**: 95% minimum

## Scalability Considerations

### Horizontal Scaling

- Static export capability
- CDN-friendly architecture
- Stateless design patterns

### Vertical Scaling

- Memory optimization
- CPU optimization
- Network optimization

### Future Enhancements

- Micro-frontend architecture
- Service worker integration
- Progressive web app features
- Offline capability

## Monitoring and Observability

### Performance Monitoring

- Bundle size tracking
- Load time monitoring
- User interaction metrics
- Error rate tracking

### Logging Strategy

- Structured logging
- Error tracking
- Performance metrics
- User analytics

## Deployment Architecture

### Build Process

```
Source Code → TypeScript Compilation → Next.js Build → Static Export → Deployment
```

### Deployment Options

1. **Static Hosting** (GitHub Pages, Netlify)
2. **CDN Distribution**
3. **Container Deployment**
4. **Server-side Rendering**

## Integration Points

### ArcGIS Enterprise Integration

- **Feature Services**: Parking lot and bay data
- **WebMap**: Base map and layer configuration
- **OAuth**: Authentication and authorization
- **Portal**: User management and app configuration

### External Dependencies

- **Next.js**: Framework and build system
- **React**: UI library and state management
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Styling and design system

## Architecture Decisions

### Why React Context?

- **Simplicity**: Easy to understand and implement
- **Performance**: Optimized re-renders with proper patterns
- **Type Safety**: Full TypeScript support
- **Testing**: Easy to test and mock

### Why ArcGIS Maps SDK?

- **Enterprise Integration**: Seamless ArcGIS Enterprise integration
- **Performance**: Optimized for large datasets
- **Features**: Rich mapping capabilities
- **Support**: Comprehensive documentation and support

### Why Next.js?

- **Static Export**: Perfect for map applications
- **Performance**: Optimized build and runtime
- **Developer Experience**: Excellent tooling and debugging
- **Deployment**: Flexible deployment options

## Future Architecture Considerations

### Potential Improvements

1. **State Management**: Consider Redux Toolkit for complex state
2. **Data Fetching**: Implement React Query for better caching
3. **Micro-frontends**: Split into smaller, focused applications
4. **Real-time Updates**: WebSocket integration for live data
5. **Offline Support**: Service worker and offline-first design

### Migration Paths

- **Gradual Migration**: Incremental improvements
- **Feature Flags**: Safe deployment of new features
- **Backward Compatibility**: Maintain existing functionality
- **Performance Monitoring**: Track improvement metrics 