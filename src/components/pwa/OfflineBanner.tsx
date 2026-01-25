/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — OFFLINE BANNER                                           │
 * │                                                                             │
 * │ iOS-safe offline status banner with safe state initialization.             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, RefreshCw } from 'lucide-react';
import { isBrowser } from '@/lib/safeBrowser';

export const OfflineBanner = () => {
  // Safe initial state - assume online, hydrate in useEffect
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isBrowser()) return;

    // Hydrate actual state after mount
    setIsOnline(navigator.onLine);
    setShowBanner(!navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Delay hiding to show "back online" briefly
      setTimeout(() => setShowBanner(false), 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (isBrowser()) {
      window.location.reload();
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-fade-in">
      <Alert 
        variant={isOnline ? "default" : "destructive"} 
        className={`${isOnline ? 'bg-green-500/90' : 'bg-destructive/90'} backdrop-blur-lg border-0`}
      >
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between w-full">
          <span className="font-medium">
            {isOnline ? "Back online!" : "You're offline. Messages will be queued."}
          </span>
          {!isOnline && (
            <button 
              onClick={handleRetry}
              className="ml-2 p-1 rounded hover:bg-white/10 transition-colors"
              aria-label="Retry"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};
