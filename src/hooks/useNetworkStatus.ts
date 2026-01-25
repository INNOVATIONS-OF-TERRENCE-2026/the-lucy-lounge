/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — NETWORK STATUS HOOK                                      │
 * │                                                                             │
 * │ Comprehensive network status tracking for offline-first behavior.          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * PURPOSE:
 * - Track online/offline state
 * - Monitor connection quality
 * - Provide network info for adaptive behavior
 * - Enable offline-first patterns
 */

import { useState, useEffect, useCallback } from 'react';
import { isBrowser } from '@/lib/safeBrowser';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ConnectionType = '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';

export interface NetworkStatus {
  /** Whether browser reports online */
  isOnline: boolean;
  /** Whether connection is effectively offline (very slow) */
  isEffectivelyOffline: boolean;
  /** Whether connection is slow (2g/slow-2g/3g) */
  isSlowConnection: boolean;
  /** Connection type if available */
  connectionType: ConnectionType;
  /** Downlink speed in Mbps (if available) */
  downlink: number | null;
  /** Round-trip time in ms (if available) */
  rtt: number | null;
  /** Save-Data preference */
  saveData: boolean;
  /** Time of last status change */
  lastChange: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getConnectionInfo(): { type: ConnectionType; downlink: number | null; rtt: number | null; saveData: boolean } {
  if (!isBrowser()) {
    return { type: 'unknown', downlink: null, rtt: null, saveData: false };
  }

  try {
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;
    
    if (!connection) {
      return { type: 'unknown', downlink: null, rtt: null, saveData: false };
    }

    const type = (connection.effectiveType as ConnectionType) || 'unknown';
    const downlink = connection.downlink ?? null;
    const rtt = connection.rtt ?? null;
    const saveData = connection.saveData === true;

    return { type, downlink, rtt, saveData };
  } catch {
    return { type: 'unknown', downlink: null, rtt: null, saveData: false };
  }
}

function getInitialStatus(): NetworkStatus {
  const isOnline = isBrowser() ? navigator.onLine : true;
  const { type, downlink, rtt, saveData } = getConnectionInfo();
  const isSlowConnection = ['2g', 'slow-2g', '3g'].includes(type) || (downlink !== null && downlink < 1);
  const isEffectivelyOffline = !isOnline || type === 'slow-2g' || (downlink !== null && downlink < 0.1);

  return {
    isOnline,
    isEffectivelyOffline,
    isSlowConnection,
    connectionType: type,
    downlink,
    rtt,
    saveData,
    lastChange: Date.now(),
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Network Status Hook
 * 
 * Tracks network state for offline-first behavior.
 * 
 * @example
 * const { isOnline, isSlowConnection, connectionType } = useNetworkStatus();
 * 
 * if (!isOnline) {
 *   return <OfflineBanner />;
 * }
 */
export function useNetworkStatus(): NetworkStatus & { 
  /** Force refresh status */
  refresh: () => void;
  /** Check if online with ping (async) */
  checkConnectivity: () => Promise<boolean>;
} {
  const [status, setStatus] = useState<NetworkStatus>(getInitialStatus);

  // Update status
  const updateStatus = useCallback(() => {
    setStatus(prev => {
      const isOnline = isBrowser() ? navigator.onLine : true;
      const { type, downlink, rtt, saveData } = getConnectionInfo();
      const isSlowConnection = ['2g', 'slow-2g', '3g'].includes(type) || (downlink !== null && downlink < 1);
      const isEffectivelyOffline = !isOnline || type === 'slow-2g' || (downlink !== null && downlink < 0.1);

      // Only update if something changed
      if (
        prev.isOnline === isOnline &&
        prev.connectionType === type &&
        prev.downlink === downlink
      ) {
        return prev;
      }

      console.log('[NetworkStatus] Updated:', { isOnline, type, downlink });

      return {
        isOnline,
        isEffectivelyOffline,
        isSlowConnection,
        connectionType: type,
        downlink,
        rtt,
        saveData,
        lastChange: Date.now(),
      };
    });
  }, []);

  // Check actual connectivity with fetch
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    if (!isBrowser()) return true;

    try {
      // Try to fetch a small resource
      const response = await fetch('/favicon.png', {
        method: 'HEAD',
        cache: 'no-store',
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    if (!isBrowser()) return;

    const handleOnline = () => {
      console.log('[NetworkStatus] Online');
      updateStatus();
    };

    const handleOffline = () => {
      console.log('[NetworkStatus] Offline');
      updateStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes (Network Information API)
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateStatus);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateStatus);
      }
    };
  }, [updateStatus]);

  return {
    ...status,
    refresh: updateStatus,
    checkConnectivity,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Check if online (synchronous, no hook) */
export function isOnline(): boolean {
  if (!isBrowser()) return true;
  return navigator.onLine;
}

/** Get connection type (synchronous, no hook) */
export function getConnectionType(): ConnectionType {
  return getConnectionInfo().type;
}

export default useNetworkStatus;
