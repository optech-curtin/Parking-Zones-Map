# Getting Started

This guide will help you set up the Parking Zones Map application for development and production use.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.14.0 or higher, v20.0.0+ recommended)
- **npm** (v8.0.0 or higher)
- **Git** (for version control)
- **ArcGIS Enterprise** access (for map services)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Parking-Zones-Map
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# ArcGIS Enterprise Configuration
NEXT_PUBLIC_ARCGIS_PORTAL_URL=https://your-arcgis-portal.com/arcgis
NEXT_PUBLIC_ARCGIS_APP_ID=your-app-id-here

# Optional: Development Configuration
NODE_ENV=development
```

### 4. ArcGIS App Registration

1. **Create ArcGIS App**: 
   - Log into your ArcGIS Enterprise portal
   - Go to Organization → Apps → Add Item → Application
   - Choose "Application" type
   - Set redirect URI to: `http://localhost:3000/oauth-callback.html`

2. **Configure OAuth**:
   - Enable OAuth 2.0 authentication
   - Set appropriate scopes (typically `user:read` and `user:write`)
   - Copy the App ID to your `.env.local` file

3. **Verify Portal URL**:
   - Ensure the portal URL is accessible from your development environment
   - Test authentication flow

## Development Setup

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Run TypeScript type checking

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Building
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

## First Steps

### 1. Verify Installation

1. Start the development server: `npm run dev`
2. Open `http://localhost:3000` in your browser
3. You should be redirected to ArcGIS authentication
4. After authentication, you should see the map interface

### 2. Explore the Application

- **Map View**: The main ArcGIS map with parking lots
- **Side Menu**: Parking planning controls and filters
- **Search Menu**: Find specific parking lots
- **Info Table**: Details about selected parking lots

### 3. Test Core Features

- Click on parking lots to select them
- Use the side menu to toggle filters
- Zoom in/out to see different interaction modes
- Test the responsive design on different screen sizes

## Development Workflow

### 1. Code Structure

Follow the established project structure:

```
src/
├── components/     # React components
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── services/       # Business logic
├── types/          # TypeScript definitions
├── utils/          # Utility functions
└── constants/      # Application constants
```

### 2. Component Development

- Use TypeScript for all new components
- Follow the existing naming conventions
- Implement error boundaries for new features
- Add appropriate accessibility attributes

### 3. State Management

- Use React Context for global state
- Implement proper error handling
- Optimize re-renders with useCallback/useMemo
- Follow the established patterns in ParkingContext

### 4. Testing

- Write unit tests for new components
- Test error scenarios
- Maintain 70% code coverage minimum
- Use React Testing Library for component tests

## Common Development Tasks

### Adding New Bay Types

1. Update `src/constants/index.ts` with new bay type
2. Add color mapping in `ParkingContext`
3. Update type definitions if needed
4. Test filtering and counting functionality

### Modifying Map Layers

1. Update `MapService.ts` for new layer configurations
2. Modify query logic as needed
3. Update renderer configurations
4. Test with actual ArcGIS data

### Adding New Filters

1. Update filter types in constants
2. Modify SideMenu component
3. Update filtering logic in hooks
4. Test filter combinations

## Troubleshooting

### Common Issues

**Authentication Errors**
- Verify ArcGIS portal URL and app ID
- Check OAuth redirect URI configuration
- Ensure portal is accessible from your network

**Map Loading Issues**
- Check network connectivity to ArcGIS services
- Verify feature layer URLs are correct
- Check browser console for CORS errors

**Build Errors**
- Ensure Node.js version compatibility
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check TypeScript configuration

**Performance Issues**
- Monitor bundle size with `npm run analyze`
- Check for memory leaks in development
- Optimize component re-renders

### Getting Help

1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Review existing issues in the repository
3. Check ArcGIS documentation for service-specific issues
4. Contact the development team for complex issues

## Next Steps

- Read the [Architecture Overview](./architecture.md) to understand the system design
- Review the [Development Guide](./development.md) for best practices
- Check the [API Reference](./api-reference.md) for detailed service documentation
- Explore the [Deployment Guide](./deployment.md) for production setup

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_ARCGIS_PORTAL_URL` | ArcGIS Enterprise portal URL | Yes | - |
| `NEXT_PUBLIC_ARCGIS_APP_ID` | ArcGIS application ID | Yes | - |
| `NODE_ENV` | Environment mode | No | `development` |
| `CUSTOM_KEY` | Custom configuration key | No | - |

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Performance Requirements

- **Minimum RAM**: 4GB
- **Recommended RAM**: 8GB+
- **Network**: Stable internet connection for ArcGIS services
- **Storage**: 1GB free space for development 