import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

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
const INITIAL_STATE: SpotifyState = {
  currentContentId: null,
  currentGenre: null,
  contentType: 'playlist',
  isDrawerOpen: false,
};

export const GlobalSpotifyProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SpotifyState>(INITIAL_STATE);

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
