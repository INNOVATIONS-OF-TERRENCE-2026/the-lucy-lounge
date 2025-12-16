import { useGlobalSpotify } from '@/contexts/GlobalSpotifyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music2, ExternalLink } from 'lucide-react';

export const GlobalSpotifyAudioHost = () => {
  const { state, closeDrawer, getIframeSrc } = useGlobalSpotify();

  return (
    <>
      {/* Hidden persistent iframe - always mounted, always audible */}
      <div
        className="fixed bottom-0 left-0 pointer-events-none"
        style={{
          width: '300px',
          height: '80px',
          opacity: 0,
          zIndex: -1,
        }}
        aria-hidden="true"
      >
        <iframe
          src={getIframeSrc()}
          width="100%"
          height="80"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="eager"
          title="Global Spotify Audio"
        />
      </div>

      {/* Visible Spotify drawer - slides up when open */}
      <AnimatePresence>
        {state.isDrawerOpen && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Music2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Now Playing • {state.currentGenre.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://open.spotify.com/playlist/${state.currentPlaylistId}`}
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

            {/* Spotify Embed - Interactive */}
            <div className="h-[152px]">
              <iframe
                src={getIframeSrc()}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="eager"
                title="Spotify Player"
                style={{ borderRadius: 0 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
