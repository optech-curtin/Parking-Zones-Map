'use client';

import React, { Component, ReactNode } from 'react';

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

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-[var(--accent-red)] bg-opacity-10 border border-[var(--accent-red)] border-opacity-30 rounded-lg">
          <h2 className="text-lg font-semibold text-[var(--accent-red)]">Something went wrong</h2>
          <p className="text-[var(--accent-red)]">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
} 