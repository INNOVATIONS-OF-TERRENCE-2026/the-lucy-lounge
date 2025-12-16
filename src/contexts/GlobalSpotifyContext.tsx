import { createContext, useContext, useRef, useState, useCallback, ReactNode } from 'react';

interface SpotifyState {
  currentPlaylistId: string;
  currentGenre: string;
  isDrawerOpen: boolean;
}

interface GlobalSpotifyContextType {
  state: SpotifyState;
  setPlaylist: (playlistId: string, genre: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  getIframeSrc: () => string;
}

const GlobalSpotifyContext = createContext<GlobalSpotifyContextType | null>(null);

const DEFAULT_PLAYLIST = '37i9dQZF1DWWQRwui0ExPn'; // lofi beats
const DEFAULT_GENRE = 'lofi';

export const GlobalSpotifyProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SpotifyState>({
    currentPlaylistId: DEFAULT_PLAYLIST,
    currentGenre: DEFAULT_GENRE,
    isDrawerOpen: false,
  });

  const setPlaylist = useCallback((playlistId: string, genre: string) => {
    setState(prev => ({
      ...prev,
      currentPlaylistId: playlistId,
      currentGenre: genre,
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

  const getIframeSrc = useCallback(() => {
    return `https://open.spotify.com/embed/playlist/${state.currentPlaylistId}?utm_source=generator&theme=0`;
  }, [state.currentPlaylistId]);

  return (
    <GlobalSpotifyContext.Provider
      value={{
        state,
        setPlaylist,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        getIframeSrc,
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
