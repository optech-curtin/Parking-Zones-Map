// Base error class for all application errors
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

// Error class for map-related errors
export class MapError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'MapError';
  }
}

// Error class for map service errors
export class MapServiceError extends MapError {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'MapServiceError';
  }
}

// Error class for feature query errors
export class FeatureQueryError extends MapError {
  constructor(message: string) {
    super(message);
    this.name = 'FeatureQueryError';
  }
}

// Error class for layer initialization errors
export class LayerInitializationError extends MapError {
  constructor(message: string, public readonly layerId: string, public readonly cause?: Error) {
    super(message);
    this.name = 'LayerInitializationError';
  }
}

// Error class for context-related errors
export class ContextError extends AppError {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'ContextError';
  }
}

// Error class for component-related errors
export class ComponentError extends AppError {
  constructor(
    message: string,
    public componentName: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ComponentError';
  }
} 