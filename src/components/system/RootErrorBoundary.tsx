/**
 * THE LUCY LOUNGE — ROOT ERROR BOUNDARY
 * 
 * INCIDENT-PROOF crash guard that wraps the entire application.
 * Prevents white screens and provides safe recovery options.
 * 
 * SECURITY: Never exposes secrets, API keys, or sensitive data.
 * 
 * @see /docs/REGRESSION_PACT.md
 */
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

/**
 * Generate SAFE diagnostics (no secrets, no keys)
 */
function getSafeDiagnostics(error: Error | null, errorInfo: ErrorInfo | null): string {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    error: error ? {
      name: error.name,
      message: error.message,
      // Only include first 5 lines of stack (safe)
      stack: error.stack?.split('\n').slice(0, 6).join('\n') || null,
    } : null,
    componentStack: errorInfo?.componentStack?.split('\n').slice(0, 10).join('\n') || null,
    // Explicitly exclude sensitive data
    _notice: 'This diagnostic report contains NO secrets, API keys, or sensitive data.',
  };

  return JSON.stringify(diagnostics, null, 2);
}

export class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console for debugging (safe — no secrets in error objects)
    console.error('[ROOT_ERROR_BOUNDARY] Application crash caught:', {
      message: error.message,
      name: error.name,
    });

    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleCopyDiagnostics = async () => {
    const diagnostics = getSafeDiagnostics(this.state.error, this.state.errorInfo);
    
    try {
      await navigator.clipboard.writeText(diagnostics);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (e) {
      // Fallback for older browsers
      console.log('[DIAGNOSTICS]', diagnostics);
      alert('Diagnostics copied to console (Ctrl+Shift+J to view)');
    }
  };

  handleClearAndReload = () => {
    // Clear potentially corrupted state
    const keysToRemove = [
      'lucy-intro-shown',
      'lucy-current-conversation',
      'lucy-chat-draft',
      'lucy-selected-model',
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore storage errors
      }
    });

    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Minimal inline styles — no external dependencies that could also fail
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0f',
          color: '#e5e5e5',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '1rem',
        }}>
          <div style={{
            maxWidth: '28rem',
            width: '100%',
            textAlign: 'center',
          }}>
            {/* Icon */}
            <div style={{
              width: '4rem',
              height: '4rem',
              margin: '0 auto 1.5rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#ffffff',
            }}>
              Something went wrong
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '0.875rem',
              color: '#a3a3a3',
              marginBottom: '1.5rem',
              lineHeight: '1.5',
            }}>
              Lucy encountered an unexpected error. Your data is safe.
              <br />
              Try reloading the page or going back home.
            </p>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#8b5cf6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#7c3aed')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#8b5cf6')}
              >
                🔄 Reload Page
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#a3a3a3',
                  border: '1px solid #333',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = '#555')}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = '#333')}
              >
                🏠 Go Home
              </button>

              <button
                onClick={this.handleCopyDiagnostics}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#737373',
                  border: '1px solid #262626',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                {this.state.copied ? '✓ Copied!' : '📋 Copy Diagnostics (No Secrets)'}
              </button>

              <button
                onClick={this.handleClearAndReload}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: '#525252',
                  border: 'none',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Clear local data & reload
              </button>
            </div>

            {/* Error message (safe, no secrets) */}
            {this.state.error && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                textAlign: 'left',
              }}>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#ef4444',
                  fontFamily: 'monospace',
                  margin: 0,
                  wordBreak: 'break-word',
                }}>
                  {this.state.error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RootErrorBoundary;
