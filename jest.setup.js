import '@testing-library/jest-dom';

// Mock ArcGIS modules
jest.mock('@arcgis/core/views/MapView', () => {
  return jest.fn().mockImplementation(() => ({
    when: jest.fn().mockResolvedValue(undefined),
    goTo: jest.fn(),
    graphics: {
      add: jest.fn(),
      remove: jest.fn(),
    },
  }));
});

jest.mock('@arcgis/core/WebMap', () => {
  return jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue(undefined),
  }));
});

jest.mock('@arcgis/core/layers/FeatureLayer', () => {
  return jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue(undefined),
    createQuery: jest.fn().mockReturnValue({
      where: '',
      returnGeometry: false,
      outFields: ['*'],
    }),
    queryFeatures: jest.fn().mockResolvedValue({
      features: [],
    }),
  }));
});

jest.mock('@arcgis/core/Graphic', () => {
  return jest.fn().mockImplementation(() => ({
    geometry: null,
    symbol: null,
  }));
});

// Mock environment variables
process.env.NEXT_PUBLIC_ARCGIS_PORTAL_URL = 'https://test-portal.com';
process.env.NEXT_PUBLIC_ARCGIS_WEBMAP_ID = 'test-webmap-id';
process.env.NEXT_PUBLIC_ARCGIS_APP_ID = 'test-app-id';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 