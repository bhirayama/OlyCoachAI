// src/components/ErrorBoundary.tsx - React Error Boundary for Auth Components
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate a unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary: Caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId
    });

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In a real app, you would send this to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    console.log('🔄 ErrorBoundary: Retrying...');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  handleReload = () => {
    console.log('🔄 ErrorBoundary: Reloading page...');
    window.location.reload();
  };

  handleGoHome = () => {
    console.log('🏠 ErrorBoundary: Going home...');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-navy-primary flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-navy-secondary/50 backdrop-blur-sm rounded-xl p-8 text-center space-y-6">

            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-text-primary">
                Something went wrong
              </h2>
              <p className="text-text-secondary">
                We're sorry, but something unexpected happened. This error has been logged.
              </p>
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-navy-primary/30 rounded-lg p-4 text-left space-y-2">
                <h4 className="text-text-primary font-semibold text-sm flex items-center gap-2">
                  <Bug className="w-4 h-4 text-red-400" />
                  Error Details (Development):
                </h4>
                <div className="text-xs text-red-400 font-mono break-all">
                  <p><strong>Error:</strong> {this.state.error.message}</p>
                  <p><strong>ID:</strong> {this.state.errorId}</p>
                </div>
                {this.state.error.stack && (
                  <details className="text-xs text-red-300">
                    <summary className="cursor-pointer text-red-400 hover:text-red-300">
                      View Stack Trace
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap text-xs overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* User-friendly Error ID for support */}
            <div className="bg-navy-primary/20 rounded-lg p-3">
              <p className="text-xs text-text-disabled">
                Error ID: <span className="font-mono text-text-secondary">{this.state.errorId}</span>
              </p>
              <p className="text-xs text-text-disabled mt-1">
                Please include this ID if you contact support
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <div className="flex gap-3">
                <button
                  onClick={this.handleReload}
                  className="flex-1 bg-navy-primary hover:bg-navy-primary/80 text-text-secondary hover:text-text-primary border border-navy-primary hover:border-text-disabled font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex-1 bg-navy-primary hover:bg-navy-primary/80 text-text-secondary hover:text-text-primary border border-navy-primary hover:border-text-disabled font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>
            </div>

            {/* Help Section */}
            <div className="text-xs text-text-disabled space-y-1">
              <p><strong>If this problem persists:</strong></p>
              <ul className="list-disc list-inside space-y-0.5 text-left">
                <li>Try refreshing the page</li>
                <li>Clear your browser cache</li>
                <li>Check your internet connection</li>
                <li>Contact support with the error ID above</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Specialized error boundary for auth components
export const AuthErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handleAuthError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('🔐 Auth Error Boundary:', {
      error: error.message,
      componentStack: errorInfo.componentStack
    });

    // You could send auth-specific errors to your analytics service here
  };

  return (
    <ErrorBoundary
      onError={handleAuthError}
      fallback={
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h3 className="text-red-400 font-semibold mb-2">Authentication Error</h3>
          <p className="text-red-300 text-sm mb-4">
            There was a problem with the authentication system. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors text-sm"
          >
            Refresh Page
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};