import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Unknown error',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled React render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-text-main flex items-center justify-center p-6">
          <div className="max-w-xl w-full rounded-3xl border border-danger/30 bg-surface p-8 shadow-2xl">
            <h1 className="text-2xl font-display font-bold">App crashed during render</h1>
            <p className="mt-3 text-text-muted">
              The blank screen was caused by a runtime error. The message below should identify the failing code path.
            </p>
            <pre className="mt-6 overflow-x-auto rounded-2xl bg-background p-4 text-sm text-danger whitespace-pre-wrap">
              {this.state.errorMessage}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
