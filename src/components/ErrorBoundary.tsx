'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (or external service)
    console.error('🚨 Dashboard Error Boundary caught:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Optional: Send to error tracking service
    // errorTrackingService.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-red-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard Error
                </h1>
                <p className="text-gray-600">
                  The security dashboard encountered an unexpected error
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-mono text-red-800">
                {this.state.error?.toString()}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md"
              >
                🔄 Reload Dashboard
              </button>

              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Try Again
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-6">
                <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-gray-900">
                  📋 Component Stack (Dev Only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-x-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
