import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  Music,
  ChevronUp,
  ChevronDown,
  Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Shared playlist IDs matching Listening Mode
const genres = [
  { id: 'lofi', label: 'Lo-Fi', spotifyId: '0vvXsWCC9xrXsKd4FyS8kM', type: 'playlist' },
  { id: 'jazz', label: 'Jazz', spotifyId: '37i9dQZF1DWV7EzJMK2FUI', type: 'playlist' },
  { id: 'rnb', label: 'R&B', spotifyId: '37i9dQZF1DWXnexX7CktaI', type: 'playlist' },
  { id: 'ambient', label: 'Ambient', spotifyId: '37i9dQZF1DWYoYGBbGKurt', type: 'playlist' },
] as const;

type GenreId = typeof genres[number]['id'];

const genreLabels: Record<GenreId, string> = {
  lofi: 'Lo-Fi Beats',
  jazz: 'Jazz Vibes',
  rnb: 'R&B Mix',
  ambient: 'Ambient Chill',
};

export const ChatAmbientPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeGenre, setActiveGenre] = useState<GenreId>('lofi');
  const [showSpotifyDrawer, setShowSpotifyDrawer] = useState(false);

  const currentGenre = genres.find(g => g.id === activeGenre) || genres[0];
  const spotifyEmbedUrl = `https://open.spotify.com/embed/${currentGenre.type}/${currentGenre.spotifyId}?utm_source=generator&theme=0`;

  const handleGenreChange = (genre: GenreId) => {
    setActiveGenre(genre);
    // Auto-open drawer when changing genre so user can control playback
    setShowSpotifyDrawer(true);
  };

  const toggleSpotifyDrawer = () => {
    setShowSpotifyDrawer(!showSpotifyDrawer);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "fixed bottom-20 right-4 z-30",
        "flex flex-col items-end gap-2",
        "sm:bottom-24 sm:right-6"
      )}
    >
      {/* Spotify Control Drawer */}
      <AnimatePresence>
        {showSpotifyDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "backdrop-blur-xl bg-background/30 border border-border/30",
              "rounded-2xl shadow-lg shadow-primary/10 overflow-hidden"
            )}
          >
            <div className="p-2">
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Headphones className="w-3 h-3" />
                  Control via Spotify
                </span>
                <button
                  onClick={() => setShowSpotifyDrawer(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <iframe
                src={spotifyEmbedUrl}
                width="300"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Player"
                className="rounded-xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Player UI */}
      <motion.div
        className={cn(
          "backdrop-blur-xl bg-background/20 border border-border/30",
          "rounded-2xl shadow-lg shadow-primary/10",
          "transition-all duration-300"
        )}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -top-3 left-1/2 -translate-x-1/2 p-1 rounded-full bg-background/40 backdrop-blur-md border border-border/20 hover:bg-background/60 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-3 h-3 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 space-y-3"
            >
              {/* Track Title with Marquee */}
              <div className="overflow-hidden max-w-[200px] sm:max-w-[240px] relative">
                <motion.div
                  className="flex items-center gap-2"
                  animate={{
                    x: genreLabels[activeGenre].length > 15 ? [0, -50, 0] : 0,
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Music className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    {genreLabels[activeGenre]}
                  </span>
                </motion.div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none rounded-2xl" />
              </div>

              {/* Genre Pills */}
              <div className="flex gap-1.5 flex-wrap justify-center">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreChange(genre.id)}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-full transition-all duration-200",
                      "border border-border/30",
                      activeGenre === genre.id
                        ? "bg-primary/20 text-primary border-primary/40 shadow-sm shadow-primary/20"
                        : "bg-background/30 text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>

              {/* Single Control - Open Spotify Drawer */}
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 px-4 rounded-full gap-2",
                    "bg-primary/20 hover:bg-primary/30",
                    "border border-primary/30",
                    showSpotifyDrawer && "shadow-md shadow-primary/30"
                  )}
                  onClick={toggleSpotifyDrawer}
                >
                  {showSpotifyDrawer ? (
                    <>
                      <Pause className="w-4 h-4 text-primary" />
                      <span className="text-xs text-primary">Hide Controls</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-primary" />
                      <span className="text-xs text-primary">Play Music</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-2 flex items-center gap-2"
            >
              <Music className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                {genreLabels[activeGenre]}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={toggleSpotifyDrawer}
              >
                <Play className="w-3 h-3 ml-0.5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
