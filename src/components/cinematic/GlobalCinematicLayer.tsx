/**
 * THE LUCY LOUNGE - Global Cinematic Layer
 * 
 * Global provider that integrates all cinematic systems:
 * - CinematicProvider (settings context)
 * - CognitiveModeProvider (dream/presence states)
 * - CinematicWrapper (visual effects)
 * - PageTransition (route animations)
 * 
 * Performance-first: Only loads effects after TTI
 */

import React, { ReactNode, Suspense, lazy, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CinematicProvider } from '@/contexts/CinematicContext';
import { CognitiveModeProvider, DreamModeLayer } from './DreamModeLayer';
import { PageTransition } from './PageTransition';
import { CinematicWrapper } from './CinematicWrapper';
import { safeRequestIdleCallback } from '@/polyfills';

// Lazy load audio cinema layer (only needed in listening mode)
const AudioCinemaLayer = lazy(() => 
  import('./AudioCinemaLayer').then(m => ({ default: m.AudioCinemaLayer }))
);

interface GlobalCinematicLayerProps {
  children: ReactNode;
}

// Map routes to lounge types
function getRouteLounge(pathname: string): string | undefined {
  const loungeMap: Record<string, string> = {
    '/neural': 'neural',
    '/dream': 'dream',
    '/vision': 'vision',
    '/silent-room': 'silent',
    '/timeline': 'timeline',
    '/command': 'command',
    '/quantum': 'quantum',
    '/presence': 'presence',
    '/events': 'events',
    '/listening-mode': 'listening',
    '/listening/explore': 'listening',
  };

  return loungeMap[pathname];
}

export function GlobalCinematicLayer({ children }: GlobalCinematicLayerProps) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // DO NOT CALL requestIdleCallback DIRECTLY. Use safeRequestIdleCallback.
    // Delay cinematic effects until after initial render for performance
    const timer = safeRequestIdleCallback(() => setMounted(true)) ??
                  setTimeout(() => setMounted(true), 100);
    return () => {
      if (typeof timer === 'number') clearTimeout(timer);
    };
  }, []);
  const loungeType = getRouteLounge(location.pathname);
  const isListeningMode = location.pathname.includes('listening');

  return (
    <CinematicProvider>
      <CognitiveModeProvider>
        <DreamModeLayer>
          <CinematicWrapper 
            loungeType={loungeType as any || 'default'}
            disableEffects={!mounted}
          >
            <PageTransition>
              {children}
            </PageTransition>

            {/* Audio-reactive layer only for listening mode */}
            {isListeningMode && mounted && (
              <Suspense fallback={null}>
                <AudioCinemaLayer isPlaying={false} />
              </Suspense>
            )}
          </CinematicWrapper>
        </DreamModeLayer>
      </CognitiveModeProvider>
    </CinematicProvider>
  );
}

/**
 * Lighter version without page transitions (for nested use)
 */
interface CinematicContainerProps {
  children: ReactNode;
  loungeType?: string;
  className?: string;
}

export function CinematicContainer({ 
  children, 
  loungeType,
  className = '',
}: CinematicContainerProps) {
  return (
    <CinematicWrapper 
      loungeType={loungeType as any || 'default'}
      className={className}
    >
      {children}
    </CinematicWrapper>
  );
}

export default GlobalCinematicLayer;
