/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — ERROR BOUNDARY                                           │
 * │                                                                             │
 * │ Catches React errors and provides graceful fallback UI                     │
 * │ Logs errors to platform telemetry for observability                        │
 * │                                                                             │
 * │ Lucy fails gracefully, never silently.                                     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

// =============================================================================
// TYPES
// =============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

// =============================================================================
// ERROR BOUNDARY CLASS
// =============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log to console
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to platform telemetry
    this.logErrorToTelemetry(error, errorInfo);
  }

  private async logErrorToTelemetry(error: Error, errorInfo: ErrorInfo) {
    try {
      await supabase.rpc('log_platform_event', {
        p_category: 'error',
        p_event_name: 'react_error_boundary',
        p_severity: 'error',
        p_function_name: this.props.componentName || 'unknown',
        p_message: error.message,
        p_details: {
          errorId: this.state.errorId,
          name: error.name,
          componentStack: errorInfo.componentStack?.slice(0, 2000), // Truncate for storage
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        },
        p_stack_trace: error.stack?.slice(0, 4000), // Truncate for storage
      });
    } catch (telemetryError) {
      console.error('[ErrorBoundary] Failed to log to telemetry:', telemetryError);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          showDetails={this.props.showDetails}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// ERROR FALLBACK UI
// =============================================================================

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  showDetails?: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
  onReload?: () => void;
}

export function ErrorFallback({
  error,
  errorInfo,
  errorId,
  showDetails = false,
  onRetry,
  onGoHome,
  onReload,
}: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-destructive/30">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            Lucy encountered an unexpected error. Don't worry, this has been logged.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorId && (
            <p className="text-xs text-center text-muted-foreground font-mono">
              Error ID: {errorId}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {onRetry && (
              <Button onClick={onRetry} variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            {onGoHome && (
              <Button onClick={onGoHome} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            )}
            {onReload && (
              <Button onClick={onReload} variant="ghost">
                Reload Page
              </Button>
            )}
          </div>

          {showDetails && error && (
            <details className="mt-4">
              <summary className="text-sm text-muted-foreground cursor-pointer flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-muted rounded-md overflow-auto max-h-48">
                <p className="text-sm font-mono text-destructive">{error.message}</p>
                {error.stack && (
                  <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// ASYNC ERROR BOUNDARY (for Suspense)
// =============================================================================

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

export function AsyncErrorBoundary({ children, fallback, onError }: AsyncErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={fallback}
      onError={(error) => onError?.(error)}
    >
      {children}
    </ErrorBoundary>
  );
}

// =============================================================================
// TOOL ERROR BOUNDARY (specialized for tools)
// =============================================================================

interface ToolErrorBoundaryProps {
  children: ReactNode;
  toolName: string;
  onRetry?: () => void;
}

export function ToolErrorBoundary({ children, toolName, onRetry }: ToolErrorBoundaryProps) {
  return (
    <ErrorBoundary
      componentName={`tool:${toolName}`}
      fallback={
        <Card className="border-destructive/30">
          <CardContent className="py-8 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
            <div>
              <p className="font-medium">{toolName} encountered an error</p>
              <p className="text-sm text-muted-foreground">
                This has been logged. Please try again.
              </p>
            </div>
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
