/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — ROUTE ERROR BOUNDARY                                     │
 * │                                                                             │
 * │ Granular error boundary for individual routes.                             │
 * │ Provides route-specific recovery without full page reload.                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */
import { Component, ErrorInfo, ReactNode } from 'react';
import { getSafeDiagnostics, copyToClipboard } from '@/lib/safeBrowser';

interface RouteErrorBoundaryProps {
  children: ReactNode;
  /** Route identifier for logging */
  route: string;
  /** Optional custom fallback message */
  fallbackMessage?: string;
  /** Optional callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<RouteErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ROUTE_ERROR:${this.props.route}]`, {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
    });

    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleCopyDiagnostics = async () => {
    const diagnostics = {
      route: this.props.route,
      error: {
        message: this.state.error?.message,
        stack: this.state.error?.stack?.split('\n').slice(0, 8).join('\n'),
      },
      componentStack: this.state.errorInfo?.componentStack?.split('\n').slice(0, 10).join('\n'),
      ...getSafeDiagnostics(),
    };

    const success = await copyToClipboard(JSON.stringify(diagnostics, null, 2));
    if (success) {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }
  };

  render() {
    if (this.state.hasError) {
      const message = this.props.fallbackMessage || `Something went wrong on this page.`;

      return (
        <div
          style={{
            minHeight: '50vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '2rem',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              ⚠️
            </div>

            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#f87171',
                marginBottom: '8px',
              }}
            >
              {message}
            </h3>

            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '1.5rem',
              }}
            >
              Route: <code style={{ color: '#a78bfa' }}>/{this.props.route}</code>
            </p>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                  color: 'white',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                🔄 Try Again
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={this.handleGoHome}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'transparent',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  🏠 Home
                </button>

                <button
                  onClick={this.handleCopyDiagnostics}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'transparent',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {this.state.copied ? '✓ Copied' : '📋 Copy Info'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
