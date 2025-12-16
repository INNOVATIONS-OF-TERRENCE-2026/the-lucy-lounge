import { useGlobalSpotify } from '@/contexts/GlobalSpotifyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music2, ExternalLink } from 'lucide-react';

export const GlobalSpotifyAudioHost = () => {
  const { state, closeDrawer, getIframeSrc } = useGlobalSpotify();

  return (
    <>
      {/* THE SINGLE GLOBAL SPOTIFY IFRAME - Always mounted, position changes based on drawer state */}
      <div
        className="fixed transition-all duration-300 ease-out"
        style={{
          bottom: state.isDrawerOpen ? 0 : '-200px',
          left: 0,
          right: state.isDrawerOpen ? 0 : 'auto',
          width: state.isDrawerOpen ? '100%' : '300px',
          zIndex: state.isDrawerOpen ? 50 : -1,
          pointerEvents: state.isDrawerOpen ? 'auto' : 'none',
        }}
      >
        {/* Header - only visible when drawer is open */}
        <AnimatePresence>
          {state.isDrawerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Now Playing • {state.currentGenre.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://open.spotify.com/${state.contentType || 'playlist'}/${state.currentPlaylistId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                  <button
                    onClick={closeDrawer}
                    className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* THE SINGLE Spotify Embed - Always mounted */}
        <div 
          className={`${state.isDrawerOpen ? 'bg-background/95 backdrop-blur-xl' : ''}`}
          style={{ height: state.isDrawerOpen ? '152px' : '80px' }}
        >
          <iframe
            src={getIframeSrc()}
            width="100%"
            height={state.isDrawerOpen ? 152 : 80}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="eager"
            title="Global Spotify Player"
            style={{ borderRadius: 0 }}
          />
        </div>
      </div>
    </>
  );
};
