/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — ROOT ERROR BOUNDARY                                      │
 * │                                                                             │
 * │ DO NOT REMOVE: This is the LAST LINE OF DEFENSE against white screens      │
 * │ DO NOT MODIFY: Governed by /docs/PRODUCTION_SPEC_v1.md                     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * PURPOSE:
 * - Catch any uncaught errors at the root level
 * - NEVER show a white screen - always show recovery UI
 * - Provide diagnostics for debugging
 * 
 * CRITICAL: This component uses NO external dependencies (no @/ imports)
 * to ensure it can always render even if the entire app crashes.
 */

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log to console for debugging
    console.error("[RootErrorBoundary] Application crash:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleClearAndReload = (): void => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore storage errors
    }
    window.location.reload();
  };

  copyDiagnostics = (): void => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
    };
    
    try {
      navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
    } catch {
      // Clipboard not supported
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // CRITICAL: Use inline styles only - no CSS imports
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            backgroundColor: "#0a0a0a",
            color: "#ffffff",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "500px",
              width: "100%",
              textAlign: "center",
            }}
          >
            {/* Lucy branding */}
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
              }}
            >
              🌙
            </div>
            
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "8px",
                background: "linear-gradient(to right, #a855f7, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Lucy needs a moment...
            </h1>
            
            <p
              style={{
                fontSize: "14px",
                color: "#9ca3af",
                marginBottom: "24px",
              }}
            >
              Something unexpected happened. Let's try again.
            </p>

            {/* Error details (collapsed by default in prod) */}
            <details
              style={{
                marginBottom: "24px",
                textAlign: "left",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: "12px",
                }}
              >
                Technical Details
              </summary>
              <pre
                style={{
                  marginTop: "8px",
                  fontSize: "11px",
                  color: "#ef4444",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "200px",
                  overflow: "auto",
                }}
              >
                {this.state.error?.message}
                {"\n\n"}
                {this.state.error?.stack?.slice(0, 500)}
              </pre>
            </details>

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button
                onClick={this.handleReload}
                style={{
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#ffffff",
                  background: "linear-gradient(to right, #a855f7, #ec4899)",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleClearAndReload}
                style={{
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#9ca3af",
                  backgroundColor: "transparent",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Clear Cache & Reload
              </button>
              
              <button
                onClick={this.copyDiagnostics}
                style={{
                  padding: "8px 16px",
                  fontSize: "12px",
                  color: "#6b7280",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Copy Diagnostics
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RootErrorBoundary;
