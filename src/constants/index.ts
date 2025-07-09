// ArcGIS Configuration
export const ARCGIS_CONFIG = {
  PARKING_LAYER_URL: "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/4",
  DEFAULT_CENTER: [115.894, -32.005] as [number, number],
  DEFAULT_ZOOM: 14,
  PAGE_SIZE: 1000,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
} as const;

// Bay Types
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

// Filter Types
export const FILTER_TYPES = {
  MONITORED_CARPARKS: 'monitoredCarparks',
  PAYG_ZONES: 'paygZones',
  BAYS_IN_CAP: 'baysInCap',
} as const;

// Bay Type Groups
export const BAY_TYPE_GROUPS = {
  PAYG: [BAY_TYPES.GREEN, BAY_TYPES.YELLOW, BAY_TYPES.BLUE, BAY_TYPES.WHITE],
  BAYS_IN_CAP: [
    BAY_TYPES.GREEN,
    BAY_TYPES.WHITE,
    BAY_TYPES.YELLOW,
    BAY_TYPES.BLUE,
    BAY_TYPES.RESERVED,
    BAY_TYPES.ACROD,
    BAY_TYPES.COURTESY,
    BAY_TYPES.EV,
    BAY_TYPES.FIFTEEN_MINUTE,
    BAY_TYPES.THIRTY_MINUTE,
    BAY_TYPES.NINETY_MINUTE,
    BAY_TYPES.MAINTENANCE,
    BAY_TYPES.FACULTY,
  ],
} as const;

// UI Constants
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

// Error Messages
export const ERROR_MESSAGES = {
  MAP_INITIALIZATION: 'Failed to initialize map',
  LAYER_LOADING: 'Failed to load map layers',
  FEATURE_QUERY: 'Failed to query features',
  AUTHENTICATION: 'Authentication failed',
  NETWORK: 'Network error occurred',
  UNKNOWN: 'An unknown error occurred',
} as const;

// Temporary Parking Lot Pattern
export const TEMP_PARKING_LOT_PATTERN = /^TCP\d+$/i;

// Type Guards
export const isPaygBayType = (bayType: string): boolean => 
  BAY_TYPE_GROUPS.PAYG.includes(bayType as any);

export const isBaysInCapType = (bayType: string): boolean => 
  BAY_TYPE_GROUPS.BAYS_IN_CAP.includes(bayType as any);

export const isTemporaryParkingLot = (parkingLot: string): boolean => 
  TEMP_PARKING_LOT_PATTERN.test(parkingLot.trim()); 