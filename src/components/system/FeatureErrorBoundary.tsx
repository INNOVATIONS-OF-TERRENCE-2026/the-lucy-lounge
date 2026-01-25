/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — FEATURE ERROR BOUNDARY                                   │
 * │                                                                             │
 * │ Lightweight error boundary for high-risk feature components.               │
 * │ Gracefully degrades individual features without affecting the page.        │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */
import { Component, ErrorInfo, ReactNode } from 'react';

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  /** Feature identifier for logging */
  feature: string;
  /** Show a simple placeholder when error occurs */
  fallback?: ReactNode;
  /** Silently fail without showing any UI (for background features) */
  silent?: boolean;
  /** Optional callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
}

export class FeatureErrorBoundary extends Component<FeatureErrorBoundaryProps, FeatureErrorBoundaryState> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): Partial<FeatureErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(`[FEATURE_ERROR:${this.props.feature}]`, error.message);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Silent mode - render nothing
      if (this.props.silent) {
        return null;
      }

      // Custom fallback provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default minimal fallback
      return (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.6)',
            textAlign: 'center',
          }}
        >
          <span style={{ marginRight: '6px' }}>⚠️</span>
          This feature couldn't load
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginLeft: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FeatureErrorBoundary;
