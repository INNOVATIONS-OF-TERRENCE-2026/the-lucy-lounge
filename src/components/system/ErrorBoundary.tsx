import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  routeTag?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary catches render/runtime errors and displays a fallback UI
 * instead of crashing the entire page. Production-grade crash guard.
 */
export class ErrorBoundary extends Component<Props, State> {
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const tag = this.props.routeTag || 'UNKNOWN';
    // eslint-disable-next-line no-console
    console.error(`[${tag}_CRASH_GUARD]`, error, errorInfo);

    // Extra explicit tag for chat triage (requested)
    if (tag === 'CHAT') {
      // eslint-disable-next-line no-console
      console.error('[CHAT_ERROR_BOUNDARY]', {
        message: error?.message,
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
      });
    }

    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetUI = () => {
    // Clear chat-related localStorage keys only
    const keysToRemove = [
      'lucy-current-conversation',
      'lucy-chat-draft',
      'lucy-chat-scroll-position',
      'lucy-selected-model',
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove ${key}`, e);
      }
    });

    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const debugEnabled =
        import.meta.env.DEV ||
        (typeof window !== "undefined" &&
          (window.localStorage?.getItem("DEBUG_CHAT") === "1" ||
            new URLSearchParams(window.location.search).get("debug_chat") === "1"));
      const message = this.props.fallbackMessage || "Something went wrong loading this page.";

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {message}
              </h2>
              <p className="text-muted-foreground text-sm">
                Don't worry, your data is safe. Try reloading or resetting the UI.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReload} variant="default" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
              <Button onClick={this.handleResetUI} variant="outline" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Reset Chat UI
              </Button>
            </div>

            {debugEnabled && this.state.error && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg text-left overflow-auto max-h-72">
                <p className="text-xs font-mono text-destructive font-semibold mb-2">
                  DEV ERROR DETAILS:
                </p>

                <div className="space-y-2">
                  {/* Top stack line for quick pinpointing */}
                  <div className="text-xs font-mono text-muted-foreground">
                    <span className="font-semibold">Top stack:</span>{" "}
                    {(() => {
                      const stack = this.state.error?.stack;
                      const top = stack ? stack.split('\n').slice(1).find(Boolean) : null;
                      return top || '(no stack)';
                    })()}
                  </div>

                  <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </pre>

                  {this.state.errorInfo && (
                    <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
