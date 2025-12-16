import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';

// AUDIT FIX: localStorage keys for persistence
const STORAGE_KEY = 'lucy-spotify-state';

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

const GlobalSpotifyContext = createContext<GlobalSpotifyContextType | null>(null);

// HC-04: NO DEFAULT PLAYLIST - Boot in silence
// PERSISTENCE: Restore selection only (not play state)
const getInitialState = (): SpotifyState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Restore selection state ONLY, drawer stays closed
      return {
        currentContentId: parsed.currentContentId || null,
        currentGenre: parsed.currentGenre || null,
        contentType: parsed.contentType || 'playlist',
        isDrawerOpen: false, // NEVER auto-open drawer
      };
    }
  } catch (e) {
    // localStorage unavailable or corrupt
  }
  return {
    currentContentId: null,
    currentGenre: null,
    contentType: 'playlist',
    isDrawerOpen: false,
  };
};

export const GlobalSpotifyProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SpotifyState>(getInitialState);

  // PERSISTENCE: Save to localStorage when selection changes
  useEffect(() => {
    if (state.currentContentId) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          currentContentId: state.currentContentId,
          currentGenre: state.currentGenre,
          contentType: state.contentType,
          // DO NOT persist: isDrawerOpen, play/pause, volume
        }));
      } catch (e) {
        // localStorage unavailable
      }
    }
  }, [state.currentContentId, state.currentGenre, state.contentType]);

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
