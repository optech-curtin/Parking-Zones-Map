# Parking Zones Map - Documentation

Welcome to the Parking Zones Map documentation. This application is a modern Next.js web application that integrates with ArcGIS Enterprise to provide interactive parking planning functionality.

## 📚 Documentation Structure

- [Getting Started](./getting-started.md) - Quick setup and installation guide
- [Architecture Overview](./architecture.md) - System design and component structure
- [Development Guide](./development.md) - Development workflow and best practices
- [API Reference](./api-reference.md) - Service layer and context APIs
- [Deployment Guide](./deployment.md) - Production deployment instructions
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
- [Contributing](./contributing.md) - Development guidelines and standards

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 🏗️ Project Overview

The Parking Zones Map is a React-based web application that provides:

- **Interactive Map Visualization**: Real-time parking lot display using ArcGIS Maps SDK
- **Parking Management**: Open/close parking lots with visual indicators
- **Bay Type Tracking**: Comprehensive bay type counting and filtering
- **Zoom-based Interaction**: Different behaviors at different zoom levels
- **Real-time Data**: Live updates from ArcGIS Enterprise services
- **Responsive UI**: Collapsible menus and dynamic layouts

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Mapping**: ArcGIS Maps SDK for JavaScript 4.33+
- **Styling**: Tailwind CSS 4 with CSS Variables
- **Testing**: Jest with React Testing Library
- **Build**: Next.js with static export capability
- **Deployment**: GitHub Pages compatible

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles and CSS variables
├── components/            # React components
│   ├── MapView.tsx        # Main map integration
│   ├── SideMenu.tsx       # Parking planning controls
│   ├── ParkingInfoTable.tsx # Selected parking lot details
│   ├── SearchMenu.tsx     # Parking lot search functionality
│   ├── LazyComponents.tsx # Dynamic imports for performance
│   └── ErrorBoundary.tsx  # Error handling components
├── context/               # React Context providers
│   ├── ParkingContext.tsx # Global parking state management
│   └── ToolContext.tsx    # UI tool selection state
├── hooks/                 # Custom React hooks
│   ├── useMap.ts          # Map interaction logic
│   └── useMapState.ts     # Map state management
├── services/              # Business logic and external integrations
│   ├── MapService.ts      # ArcGIS integration and feature queries
│   ├── CacheService.ts    # Performance optimization
│   └── MapInitializationService.ts # Map setup and configuration
├── types/                 # TypeScript type definitions
│   └── index.ts           # All application types
├── utils/                 # Utility functions
│   ├── logger.ts          # Logging system
│   ├── errors.ts          # Custom error classes
│   └── debounce.ts        # Performance utilities
└── constants/             # Application constants
    └── index.ts           # Configuration and constants
```

## 🔧 Key Features

### Map Integration
- ArcGIS Enterprise authentication via OAuth
- Real-time feature layer updates
- Zoom-based interaction patterns
- Performance-optimized rendering

### State Management
- React Context for global state
- Optimized re-renders with useCallback/useMemo
- Comprehensive error handling
- Type-safe state updates

### Performance Optimizations
- Lazy loading of heavy components
- Debounced user interactions
- Caching strategies for feature queries
- Bundle splitting for ArcGIS modules

### User Experience
- Responsive design with CSS variables
- Dark mode support
- Accessibility features
- Error boundaries for graceful failure handling

## 🎯 Development Goals

- **Performance**: Fast loading and smooth interactions
- **Reliability**: Robust error handling and fallbacks
- **Maintainability**: Clean code structure and comprehensive testing
- **Scalability**: Modular architecture for future enhancements
- **User Experience**: Intuitive interface with responsive design

## 📊 Testing Strategy

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Service layer and context testing
- **E2E Tests**: User workflow validation
- **Performance Tests**: Bundle size and loading time monitoring

## 🔒 Security Considerations

- OAuth 2.0 authentication with ArcGIS Enterprise
- Secure communication with ArcGIS services
- Environment variable management
- Input validation and sanitization

## 📈 Performance Metrics

- **Bundle Size**: ~420 kB (optimized)
- **Build Time**: ~67s (production)
- **Test Coverage**: 70% minimum threshold
- **Lighthouse Score**: Optimized for performance

## 🤝 Contributing

See [Contributing Guide](./contributing.md) for development guidelines, code standards, and contribution process.

## 📄 License

This project is proprietary software. All rights reserved.

---

For detailed information about specific aspects of the application, please refer to the individual documentation files in this directory. 