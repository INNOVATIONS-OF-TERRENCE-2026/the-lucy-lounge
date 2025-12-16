import { useGlobalSpotify } from '@/contexts/GlobalSpotifyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music2, ExternalLink } from 'lucide-react';

/**
 * HC-01: SINGLE AUDIO SOURCE - This is the ONLY Spotify iframe in the app
 * HC-02: IMMORTAL IFRAME - This component is mounted ONCE at App root and never unmounts
 */
export const GlobalSpotifyAudioHost = () => {
  const { state, iframeSrc, closeDrawer } = useGlobalSpotify();

  // HC-04: No iframe rendered until user explicitly plays something
  if (!iframeSrc) {
    return null;
  }

  return (
    <div
      className="fixed transition-all duration-300 ease-out"
      style={{
        bottom: state.isDrawerOpen ? 0 : '-200px',
        left: 0,
        right: 0,
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
                  Now Playing {state.currentGenre ? `• ${state.currentGenre.toUpperCase()}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://open.spotify.com/${state.contentType}/${state.currentContentId}`}
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

      {/* HC-01 & HC-02: THE SINGLE IMMORTAL Spotify iframe */}
      <div 
        className={`${state.isDrawerOpen ? 'bg-background/95 backdrop-blur-xl' : ''}`}
        style={{ height: '152px' }}
      >
        <iframe
          src={iframeSrc}
          width="100%"
          height={152}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="eager"
          title="Global Spotify Player"
          style={{ borderRadius: 0 }}
        />
      </div>
    </div>
  );
};
