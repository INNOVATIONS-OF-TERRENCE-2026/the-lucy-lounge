/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — iOS INSTALL PROMPT                                       │
 * │                                                                             │
 * │ iOS Safari-specific "Add to Home Screen" prompt.                           │
 * │ iOS does not support beforeinstallprompt, so we show manual instructions.  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Share, Plus, Smartphone } from 'lucide-react';
import { isIOSSafari, isBrowser, getStorageItem, setStorageItem } from '@/lib/safeBrowser';

const STORAGE_KEY = 'lucy-ios-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Check if running as standalone PWA
 */
function isStandalone(): boolean {
  if (!isBrowser()) return false;
  
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    );
  } catch {
    return false;
  }
}

/**
 * Check if should show iOS install prompt
 */
function shouldShowPrompt(): boolean {
  if (!isBrowser()) return false;
  
  // Only show on iOS Safari
  if (!isIOSSafari()) return false;
  
  // Don't show if already standalone
  if (isStandalone()) return false;
  
  // Check if dismissed recently
  const dismissed = getStorageItem(STORAGE_KEY);
  if (dismissed) {
    const dismissedTime = parseInt(dismissed, 10);
    if (Date.now() - dismissedTime < DISMISS_DURATION) {
      return false;
    }
  }
  
  return true;
}

export const IOSInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Delay check to avoid hydration issues
    const timer = setTimeout(() => {
      setShowPrompt(shouldShowPrompt());
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    setStorageItem(STORAGE_KEY, String(Date.now()));
  };

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Main prompt card */}
      {!showInstructions && (
        <Card className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 shadow-2xl border-2 border-primary/20 animate-fade-in overflow-hidden">
          <div className="p-5 bg-gradient-glow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-gradient-button p-3 rounded-[12px]">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1.5 bg-gradient-button bg-clip-text text-transparent">
                  Add Lucy to Home Screen
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Install Lucy AI for the best experience - quick access, full screen, and works offline.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleShowInstructions} 
                    variant="gradient" 
                    className="flex-1" 
                    size="sm"
                  >
                    Show Me How
                  </Button>
                  <Button variant="ghost" onClick={handleDismiss} size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <Card className="max-w-sm w-full p-6 bg-card border-2 border-primary/20">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl bg-gradient-button bg-clip-text text-transparent">
                  Add to Home Screen
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowInstructions(false);
                    handleDismiss();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium mb-1">Tap the Share button</p>
                    <p className="text-sm text-muted-foreground">
                      Look for the{' '}
                      <Share className="inline w-4 h-4 mx-1" />
                      {' '}icon at the bottom of your screen
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium mb-1">Scroll down and tap</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      "Add to Home Screen"
                      <Plus className="inline w-4 h-4" />
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium mb-1">Tap "Add"</p>
                    <p className="text-sm text-muted-foreground">
                      Lucy will appear on your home screen like a native app
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <Button 
                  variant="gradient" 
                  className="w-full" 
                  onClick={() => {
                    setShowInstructions(false);
                    handleDismiss();
                  }}
                >
                  Got It!
                </Button>
              </div>
            </Card>

            {/* Arrow pointing to Safari share button location */}
            <div className="mt-8 animate-bounce">
              <div className="text-center text-white/80">
                <Share className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Tap Share below</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IOSInstallPrompt;
