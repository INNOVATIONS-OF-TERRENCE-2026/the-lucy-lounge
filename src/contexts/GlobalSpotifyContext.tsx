import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';

// AUDIT FIX: localStorage keys for persistence
const STORAGE_KEY = 'lucy-spotify-state';

/**
 * iOS-SAFE storage helper - never throws
 */
function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable - silent fail
  }
}

interface SpotifyState {
  currentContentId: string | null;
  currentGenre: string | null;
  contentType: 'playlist' | 'album';
  isDrawerOpen: boolean;
}

interface GlobalSpotifyContextType {
  state: SpotifyState;
  iframeSrc: string | null;
  setPlayback: (contentId: string, genre: string, contentType?: 'playlist' | 'album') => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

// Exported for direct useContext access with null-safety in crash-proof components
export const GlobalSpotifyContext = createContext<GlobalSpotifyContextType | null>(null);

// DEFAULT STATE - no side effects
const DEFAULT_STATE: SpotifyState = {
  currentContentId: null,
  currentGenre: null,
  contentType: 'playlist',
  isDrawerOpen: false,
};

export const GlobalSpotifyProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with default, then hydrate from storage in effect
  const [state, setState] = useState<SpotifyState>(DEFAULT_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  // HYDRATION: Load from localStorage AFTER mount (iOS-safe)
  useEffect(() => {
    const stored = safeGetItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState({
          currentContentId: parsed.currentContentId || null,
          currentGenre: parsed.currentGenre || null,
          contentType: parsed.contentType || 'playlist',
          isDrawerOpen: false, // NEVER auto-open drawer
        });
      } catch {
        // Corrupt data - use defaults
      }
    }
    setIsHydrated(true);
  }, []);

  // PERSISTENCE: Save to localStorage when selection changes (after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    if (state.currentContentId) {
      safeSetItem(STORAGE_KEY, JSON.stringify({
        currentContentId: state.currentContentId,
        currentGenre: state.currentGenre,
        contentType: state.contentType,
        // DO NOT persist: isDrawerOpen, play/pause, volume
      }));
    }
  }, [state.currentContentId, state.currentGenre, state.contentType, isHydrated]);

  // HC-09: ONE WAY DATA FLOW - Only way to change playback
  const setPlayback = useCallback((contentId: string, genre: string, contentType: 'playlist' | 'album' = 'playlist') => {
    setState(prev => ({
      ...prev,
      currentContentId: contentId,
      currentGenre: genre,
      contentType,
    }));
  }, []);

  const openDrawer = useCallback(() => {
    setState(prev => ({ ...prev, isDrawerOpen: true }));
  }, []);

  const closeDrawer = useCallback(() => {
    setState(prev => ({ ...prev, isDrawerOpen: false }));
  }, []);

  const toggleDrawer = useCallback(() => {
    setState(prev => ({ ...prev, isDrawerOpen: !prev.isDrawerOpen }));
  }, []);

  // HC-05: SRC IMMUTABILITY - useMemo, depends ONLY on contentId and contentType
  const iframeSrc = useMemo(() => {
    if (!state.currentContentId) return null;
    return `https://open.spotify.com/embed/${state.contentType}/${state.currentContentId}?utm_source=generator&theme=0`;
  }, [state.currentContentId, state.contentType]);

  return (
    <GlobalSpotifyContext.Provider
      value={{
        state,
        iframeSrc,
        setPlayback,
        openDrawer,
        closeDrawer,
        toggleDrawer,
      }}
    >
      {children}
    </GlobalSpotifyContext.Provider>
  );
};

export const useGlobalSpotify = () => {
  const context = useContext(GlobalSpotifyContext);
  if (!context) {
    throw new Error('useGlobalSpotify must be used within GlobalSpotifyProvider');
  }
  return context;
};
