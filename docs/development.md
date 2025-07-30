# Development Guide

This guide provides comprehensive information for developers working on the Parking Zones Map application, including coding standards, best practices, and development workflows.

## Table of Contents

- [Development Environment](#development-environment)
- [Coding Standards](#coding-standards)
- [Component Development](#component-development)
- [State Management](#state-management)
- [Testing Guidelines](#testing-guidelines)
- [Performance Optimization](#performance-optimization)
- [Error Handling](#error-handling)
- [Git Workflow](#git-workflow)
- [Code Review Process](#code-review-process)
- [Debugging](#debugging)

## Development Environment

### Prerequisites

- **Node.js**: v18.14.0 or higher (v20.0.0+ recommended)
- **npm**: v8.0.0 or higher
- **Git**: Latest stable version
- **VS Code**: Recommended IDE with extensions

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### Environment Setup

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd Parking-Zones-Map
   npm install
   ```

2. **Environment Variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your ArcGIS credentials
   ```

3. **Start Development**:
   ```bash
   npm run dev
   ```

## Coding Standards

### TypeScript Standards

#### Type Definitions

- Use explicit types for all function parameters and return values
- Prefer interfaces over types for object shapes
- Use union types for finite sets of values
- Export types from dedicated type files

```typescript
// ✅ Good
interface ParkingLotData {
  id: string;
  name: string;
  status: 'open' | 'closed';
  bayCount: number;
}

// ❌ Avoid
type ParkingLotData = {
  id: string;
  name: string;
  status: string;
  bayCount: number;
};
```

#### Function Definitions

- Use arrow functions for components and callbacks
- Prefer async/await over Promises
- Use proper error handling with try/catch

```typescript
// ✅ Good
const handleParkingLotSelect = async (lotId: string): Promise<void> => {
  try {
    await mapService.selectParkingLot(lotId);
    setSelectedLot(lotId);
  } catch (error) {
    logger.error('Failed to select parking lot', 'ParkingComponent', error);
    setError(error instanceof Error ? error : new Error('Unknown error'));
  }
};

// ❌ Avoid
function handleParkingLotSelect(lotId) {
  mapService.selectParkingLot(lotId)
    .then(result => setSelectedLot(lotId))
    .catch(err => console.error(err));
}
```

### React Standards

#### Component Structure

```typescript
// ✅ Standard component structure
import React, { useCallback, useEffect, useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { logger } from '../utils/logger';

interface ComponentProps {
  title: string;
  onAction?: (data: string) => void;
}

export default function MyComponent({ title, onAction }: ComponentProps) {
  // 1. State declarations
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Context hooks
  const { state, setError } = useParking();
  
  // 3. Custom hooks
  const { data, error } = useCustomHook();
  
  // 4. Event handlers
  const handleClick = useCallback(() => {
    try {
      onAction?.(title);
    } catch (error) {
      logger.error('Action failed', 'MyComponent', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [title, onAction, setError]);
  
  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 6. Render
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Action</button>
    </div>
  );
}
```

#### Naming Conventions

- **Components**: PascalCase (e.g., `ParkingInfoTable`)
- **Files**: PascalCase for components, camelCase for utilities
- **Functions**: camelCase (e.g., `handleParkingLotSelect`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_ZOOM_LEVEL`)
- **Types/Interfaces**: PascalCase (e.g., `ParkingLotData`)

### CSS/Styling Standards

#### Tailwind CSS Usage

- Use Tailwind utility classes for styling
- Create custom CSS variables for theme values
- Use responsive design patterns

```typescript
// ✅ Good - Using Tailwind with CSS variables
<div className="bg-[var(--menu-body-bg)] border border-[var(--card-border)] shadow-[var(--shadow)] rounded-lg p-4">
  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
    {title}
  </h2>
</div>

// ❌ Avoid - Inline styles
<div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '16px' }}>
  <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
    {title}
  </h2>
</div>
```

## Component Development

### Component Guidelines

#### 1. Single Responsibility

Each component should have a single, well-defined purpose:

```typescript
// ✅ Good - Single responsibility
export default function ParkingLotCard({ lot }: ParkingLotCardProps) {
  return (
    <div className="parking-lot-card">
      <h3>{lot.name}</h3>
      <p>Status: {lot.status}</p>
      <p>Bays: {lot.bayCount}</p>
    </div>
  );
}

// ❌ Avoid - Multiple responsibilities
export default function ParkingLotCard({ lot }: ParkingLotCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bayCount, setBayCount] = useState(lot.bayCount);
  
  const handleSave = async () => {
    // Save logic
  };
  
  const handleDelete = async () => {
    // Delete logic
  };
  
  return (
    <div>
      {/* Too many responsibilities */}
    </div>
  );
}
```

#### 2. Props Interface

Define clear, typed props interfaces:

```typescript
interface ParkingLotCardProps {
  lot: ParkingLotData;
  onSelect?: (lotId: string) => void;
  onEdit?: (lotId: string) => void;
  isSelected?: boolean;
  className?: string;
}
```

#### 3. Error Boundaries

Wrap components that might fail:

```typescript
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function ParkingLotList() {
  return (
    <ErrorBoundary>
      <div className="parking-lot-list">
        {parkingLots.map(lot => (
          <ErrorBoundary key={lot.id}>
            <ParkingLotCard lot={lot} />
          </ErrorBoundary>
        ))}
      </div>
    </ErrorBoundary>
  );
}
```

### Custom Hooks

#### Hook Guidelines

```typescript
// ✅ Good custom hook
export function useParkingLotData(lotId: string) {
  const [data, setData] = useState<ParkingLotData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await mapService.getParkingLotData(lotId);
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [lotId]);
  
  return { data, isLoading, error };
}
```

## State Management

### Context Usage

#### Context Structure

```typescript
// ✅ Good context structure
interface ParkingState {
  // Selection state
  selectedParkingLot: string;
  selectedBay: string | null;
  
  // Data state
  parkingLots: ParkingLotData[];
  bayCounts: BayTypeCount[];
  
  // UI state
  isLoading: boolean;
  error: Error | null;
}

interface ParkingContextProps {
  state: ParkingState;
  setSelectedParkingLot: (lotId: string) => void;
  setSelectedBay: (bayId: string | null) => void;
  setError: (error: Error | null) => void;
  // ... other methods
}
```

#### Context Optimization

```typescript
// ✅ Optimized context provider
export const ParkingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ParkingState>(initialState);
  
  // Memoized setters to prevent unnecessary re-renders
  const setSelectedParkingLot = useCallback((lotId: string) => {
    setState(prev => ({ ...prev, selectedParkingLot: lotId }));
  }, []);
  
  const setError = useCallback((error: Error | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);
  
  // Memoized context value
  const contextValue = useMemo(() => ({
    state,
    setSelectedParkingLot,
    setError,
    // ... other methods
  }), [state, setSelectedParkingLot, setError]);
  
  return (
    <ParkingContext.Provider value={contextValue}>
      {children}
    </ParkingContext.Provider>
  );
};
```

## Testing Guidelines

### Testing Strategy

#### Unit Tests

```typescript
// ✅ Good unit test
import { render, screen, fireEvent } from '@testing-library/react';
import { ParkingProvider } from '../context/ParkingContext';
import ParkingLotCard from '../components/ParkingLotCard';

describe('ParkingLotCard', () => {
  const mockLot = {
    id: '1',
    name: 'Test Lot',
    status: 'open' as const,
    bayCount: 10
  };
  
  it('renders parking lot information correctly', () => {
    render(
      <ParkingProvider>
        <ParkingLotCard lot={mockLot} />
      </ParkingProvider>
    );
    
    expect(screen.getByText('Test Lot')).toBeInTheDocument();
    expect(screen.getByText('Status: open')).toBeInTheDocument();
    expect(screen.getByText('Bays: 10')).toBeInTheDocument();
  });
  
  it('calls onSelect when clicked', () => {
    const mockOnSelect = jest.fn();
    
    render(
      <ParkingProvider>
        <ParkingLotCard lot={mockLot} onSelect={mockOnSelect} />
      </ParkingProvider>
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSelect).toHaveBeenCalledWith('1');
  });
});
```

#### Integration Tests

```typescript
// ✅ Good integration test
import { render, screen, waitFor } from '@testing-library/react';
import { MapService } from '../services/MapService';

jest.mock('../services/MapService');

describe('Map Integration', () => {
  it('loads and displays parking lots', async () => {
    const mockMapService = {
      getParkingLots: jest.fn().mockResolvedValue([
        { id: '1', name: 'Lot A' },
        { id: '2', name: 'Lot B' }
      ])
    };
    
    (MapService as jest.MockedClass<typeof MapService>).mockImplementation(() => mockMapService);
    
    render(<MapView />);
    
    await waitFor(() => {
      expect(screen.getByText('Lot A')).toBeInTheDocument();
      expect(screen.getByText('Lot B')).toBeInTheDocument();
    });
  });
});
```

### Test Coverage Requirements

- **Components**: 70% minimum
- **Services**: 80% minimum
- **Hooks**: 90% minimum
- **Utilities**: 95% minimum

## Performance Optimization

### React Optimization

#### Memoization

```typescript
// ✅ Optimized component
import React, { memo, useCallback, useMemo } from 'react';

interface ExpensiveComponentProps {
  data: ParkingLotData[];
  onSelect: (id: string) => void;
}

const ExpensiveComponent = memo(({ data, onSelect }: ExpensiveComponentProps) => {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      displayName: item.name.toUpperCase(),
      statusColor: item.status === 'open' ? 'green' : 'red'
    }));
  }, [data]);
  
  // Memoize event handlers
  const handleSelect = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);
  
  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleSelect(item.id)}>
          {item.displayName}
        </div>
      ))}
    </div>
  );
});

ExpensiveComponent.displayName = 'ExpensiveComponent';
```

#### Bundle Optimization

```typescript
// ✅ Lazy loading
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});

// ✅ Code splitting
const MapComponent = dynamic(() => import('./MapComponent'), {
  loading: () => <div>Loading map...</div>
});
```

### ArcGIS Optimization

```typescript
// ✅ Optimized ArcGIS usage
export class OptimizedMapService {
  private cache = new Map<string, any>();
  
  async getParkingLots(): Promise<ParkingLotData[]> {
    const cacheKey = 'parkingLots';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const result = await this.queryFeatures();
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  private async queryFeatures(): Promise<ParkingLotData[]> {
    // Optimized query with pagination
    const query = this.layer.createQuery();
    query.where = '1=1';
    query.returnGeometry = false;
    query.outFields = ['*'];
    query.maxRecordCount = 1000;
    
    return this.layer.queryFeatures(query);
  }
}
```

## Error Handling

### Error Boundaries

```typescript
// ✅ Comprehensive error boundary
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error caught by boundary', 'ErrorBoundary', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### Service Error Handling

```typescript
// ✅ Service error handling
export class MapService {
  async initializeMap(container: HTMLDivElement): Promise<MapView> {
    try {
      const view = new MapView({
        container,
        map: new WebMap({
          portalItem: { id: this.webMapId }
        })
      });
      
      await view.when();
      return view;
    } catch (error) {
      logger.error('Failed to initialize map', 'MapService', error);
      throw new MapServiceError('Map initialization failed', error instanceof Error ? error : undefined);
    }
  }
}
```

## Git Workflow

### Branch Strategy

```
main
├── develop
│   ├── feature/parking-lot-selection
│   ├── feature/bay-type-filtering
│   └── bugfix/map-loading-issue
└── hotfix/critical-error
```

### Commit Standards

```bash
# ✅ Good commit messages
feat: add parking lot selection functionality
fix: resolve map loading issue on slow connections
docs: update API documentation
test: add unit tests for ParkingContext
refactor: optimize map rendering performance
style: update component styling to match design system

# ❌ Avoid
fixed stuff
updated code
bug fix
```

### Pull Request Process

1. **Create Feature Branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Development**:
   - Write code following standards
   - Add tests for new functionality
   - Update documentation
   - Run linting and tests

3. **Commit and Push**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**:
   - Target `develop` branch
   - Include description of changes
   - Link related issues
   - Request code review

## Code Review Process

### Review Checklist

- [ ] Code follows TypeScript standards
- [ ] Components follow React best practices
- [ ] Tests are included and pass
- [ ] Error handling is implemented
- [ ] Performance considerations addressed
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] No unused imports or variables
- [ ] Accessibility considerations
- [ ] Mobile responsiveness

### Review Comments

```typescript
// ✅ Good review comment
// Consider using useCallback here to prevent unnecessary re-renders
const handleClick = useCallback(() => {
  onSelect(id);
}, [onSelect, id]);

// ❌ Poor review comment
// This is wrong
```

## Debugging

### Development Tools

#### React DevTools
- Install React DevTools browser extension
- Use Profiler for performance analysis
- Check component hierarchy and props

#### ArcGIS DevTools
- Use ArcGIS Maps SDK for JavaScript DevTools
- Monitor network requests
- Check layer loading and rendering

#### Browser DevTools
- Use Network tab for API calls
- Use Console for logging
- Use Performance tab for profiling

### Debugging Techniques

```typescript
// ✅ Good debugging
import { logger } from '../utils/logger';

const handleDataLoad = async () => {
  try {
    logger.debug('Starting data load', 'MyComponent');
    const data = await service.getData();
    logger.debug('Data loaded successfully', 'MyComponent', { count: data.length });
    setData(data);
  } catch (error) {
    logger.error('Failed to load data', 'MyComponent', error);
    setError(error);
  }
};

// ❌ Avoid
console.log('data:', data);
console.error('error:', error);
```

### Common Issues

#### Map Loading Issues
- Check ArcGIS portal URL and credentials
- Verify network connectivity
- Check browser console for CORS errors

#### Performance Issues
- Use React DevTools Profiler
- Check for unnecessary re-renders
- Monitor bundle size

#### State Management Issues
- Use React DevTools to inspect state
- Check context provider setup
- Verify state update logic

## Performance Monitoring

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Check for large dependencies
npm ls --depth=0
```

### Performance Metrics

- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 4s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Monitoring Tools

- **Lighthouse**: Performance auditing
- **WebPageTest**: Detailed performance analysis
- **React DevTools Profiler**: Component performance
- **ArcGIS Performance**: Map rendering metrics 