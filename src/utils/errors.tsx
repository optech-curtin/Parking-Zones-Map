'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

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

// Error class for feature query errors
export class FeatureQueryError extends MapError {
  constructor(message: string) {
    super(message);
    this.name = 'FeatureQueryError';
  }
}

// Error class for layer initialization errors
export class LayerInitializationError extends MapError {
  constructor(message: string) {
    super(message);
    this.name = 'LayerInitializationError';
  }
}

// Error class for context-related errors
export class ContextError extends AppError {
  constructor(message: string) {
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

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error boundary component to catch and handle React component errors
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
          <p className="text-red-600">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
} 