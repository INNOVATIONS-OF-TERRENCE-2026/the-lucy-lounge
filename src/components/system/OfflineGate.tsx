/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — OFFLINE GATE                                             │
 * │                                                                             │
 * │ Wrapper component for offline-aware feature rendering.                     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * PURPOSE:
 * - Show offline fallback UI when network unavailable
 * - Queue actions for when network returns
 * - Provide retry mechanisms
 * - Never show blank screens for network issues
 */

import React, { ReactNode, createContext, useContext, useCallback, useState } from 'react';
import { useNetworkStatus, ConnectionType } from '@/hooks/useNetworkStatus';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface OfflineContextType {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: ConnectionType;
  retry: () => Promise<void>;
  queueAction: (action: () => Promise<void>) => void;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useOfflineGate(): OfflineContextType {
  const context = useContext(OfflineContext);
  if (!context) {
    // Fallback if used outside provider
    const { isOnline, isSlowConnection, connectionType, refresh } = useNetworkStatus();
    return {
      isOnline,
      isSlowConnection,
      connectionType,
      retry: async () => { refresh(); },
      queueAction: () => {},
    };
  }
  return context;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OFFLINE FALLBACK UI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface OfflineFallbackProps {
  onRetry?: () => void;
  message?: string;
  showRetry?: boolean;
}

export function OfflineFallback({ 
  onRetry, 
  message = "You're currently offline",
  showRetry = true 
}: OfflineFallbackProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      onRetry?.();
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
      <div className="rounded-full bg-muted p-4 mb-4">
        <WifiOff className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{message}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Some features require an internet connection. 
        You can still browse cached content.
      </p>
      {showRetry && (
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Checking...' : 'Retry'}
        </button>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLOW CONNECTION WARNING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function SlowConnectionWarning() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400">
      <AlertCircle className="w-4 h-4" />
      <span className="text-sm">Slow connection detected. Some features may be limited.</span>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OFFLINE GATE COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface OfflineGateProps {
  children: ReactNode;
  /** What to show when offline */
  fallback?: ReactNode;
  /** Whether feature requires network (true) or can work offline (false) */
  requiresNetwork?: boolean;
  /** Show slow connection warning */
  showSlowWarning?: boolean;
}

/**
 * Offline Gate Component
 * 
 * Wraps content that may need network access.
 * Shows fallback UI when offline.
 * 
 * @example
 * <OfflineGate requiresNetwork fallback={<OfflineFallback />}>
 *   <ChatInterface />
 * </OfflineGate>
 */
export function OfflineGate({ 
  children, 
  fallback,
  requiresNetwork = true,
  showSlowWarning = false,
}: OfflineGateProps) {
  const networkStatus = useNetworkStatus();
  const [actionQueue, setActionQueue] = useState<Array<() => Promise<void>>>([]);

  // Process queued actions when back online
  React.useEffect(() => {
    if (networkStatus.isOnline && actionQueue.length > 0) {
      console.log('[OfflineGate] Processing queued actions:', actionQueue.length);
      actionQueue.forEach(action => action().catch(console.error));
      setActionQueue([]);
    }
  }, [networkStatus.isOnline, actionQueue]);

  const queueAction = useCallback((action: () => Promise<void>) => {
    setActionQueue(prev => [...prev, action]);
  }, []);

  const retry = useCallback(async () => {
    networkStatus.refresh();
    await networkStatus.checkConnectivity();
  }, [networkStatus]);

  const contextValue: OfflineContextType = {
    isOnline: networkStatus.isOnline,
    isSlowConnection: networkStatus.isSlowConnection,
    connectionType: networkStatus.connectionType,
    retry,
    queueAction,
  };

  // If feature requires network and we're offline
  if (requiresNetwork && !networkStatus.isOnline) {
    return (
      <OfflineContext.Provider value={contextValue}>
        {fallback || <OfflineFallback onRetry={retry} />}
      </OfflineContext.Provider>
    );
  }

  return (
    <OfflineContext.Provider value={contextValue}>
      {showSlowWarning && networkStatus.isSlowConnection && <SlowConnectionWarning />}
      {children}
    </OfflineContext.Provider>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROVIDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface OfflineGateProviderProps {
  children: ReactNode;
}

/**
 * Offline Gate Provider
 * 
 * Provides offline context to the entire app.
 * Should wrap the main app component.
 */
export function OfflineGateProvider({ children }: OfflineGateProviderProps) {
  const networkStatus = useNetworkStatus();
  const [actionQueue, setActionQueue] = useState<Array<() => Promise<void>>>([]);

  // Process queued actions when back online
  React.useEffect(() => {
    if (networkStatus.isOnline && actionQueue.length > 0) {
      console.log('[OfflineGateProvider] Processing queued actions:', actionQueue.length);
      const queue = [...actionQueue];
      setActionQueue([]);
      queue.forEach(action => action().catch(console.error));
    }
  }, [networkStatus.isOnline, actionQueue]);

  const queueAction = useCallback((action: () => Promise<void>) => {
    if (networkStatus.isOnline) {
      // Execute immediately if online
      action().catch(console.error);
    } else {
      // Queue for later
      setActionQueue(prev => [...prev, action]);
    }
  }, [networkStatus.isOnline]);

  const retry = useCallback(async () => {
    networkStatus.refresh();
    await networkStatus.checkConnectivity();
  }, [networkStatus]);

  const contextValue: OfflineContextType = {
    isOnline: networkStatus.isOnline,
    isSlowConnection: networkStatus.isSlowConnection,
    connectionType: networkStatus.connectionType,
    retry,
    queueAction,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
}

export default OfflineGate;
