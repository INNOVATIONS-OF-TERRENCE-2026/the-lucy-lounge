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
import { useGlobalSpotify } from "@/contexts/GlobalSpotifyContext";

// Shared playlist IDs matching Listening Mode
const genres = [
  { id: 'lofi', label: 'Lo-Fi', spotifyId: '37i9dQZF1DWWQRwui0ExPn' },
  { id: 'jazz', label: 'Jazz', spotifyId: '37i9dQZF1DX0SM0LYsmbMT' },
  { id: 'rnb', label: 'R&B', spotifyId: '37i9dQZF1DX4SBhb3fqCJd' },
  { id: 'ambient', label: 'Ambient', spotifyId: '37i9dQZF1DX3Ogo9pFvBkY' },
  { id: 'rap', label: 'Rap', spotifyId: '37i9dQZF1DX0XUsuxWHRQd' },
  { id: 'smooth-rap', label: 'Smooth', spotifyId: '37i9dQZF1DWUzFXarNiofw' },
] as const;

type GenreId = typeof genres[number]['id'];

const genreLabels: Record<GenreId, string> = {
  lofi: 'Lo-Fi Beats',
  jazz: 'Jazz Vibes',
  rnb: 'R&B Mix',
  ambient: 'Ambient Chill',
  rap: 'Rap Hits',
  'smooth-rap': 'Smooth Vibes',
};

// Genre accent classes for theme-aware styling
const genreAccentClasses: Record<GenreId, { bg: string; text: string; glow: string; border: string }> = {
  lofi: {
    bg: 'bg-genre-lofi/20',
    text: 'text-genre-lofi',
    glow: 'shadow-[0_0_20px_hsl(var(--genre-lofi)/0.4)]',
    border: 'border-genre-lofi/40',
  },
  jazz: {
    bg: 'bg-genre-jazz/20',
    text: 'text-genre-jazz',
    glow: 'shadow-[0_0_20px_hsl(var(--genre-jazz)/0.4)]',
    border: 'border-genre-jazz/40',
  },
  rnb: {
    bg: 'bg-genre-rnb/20',
    text: 'text-genre-rnb',
    glow: 'shadow-[0_0_20px_hsl(var(--genre-rnb)/0.4)]',
    border: 'border-genre-rnb/40',
  },
  ambient: {
    bg: 'bg-genre-ambient/20',
    text: 'text-genre-ambient',
    glow: 'shadow-[0_0_20px_hsl(var(--genre-ambient)/0.4)]',
    border: 'border-genre-ambient/40',
  },
  rap: {
    bg: 'bg-genre-rap/20',
    text: 'text-genre-rap',
    glow: 'shadow-[0_0_20px_hsl(var(--genre-rap)/0.4)]',
    border: 'border-genre-rap/40',
  },
  'smooth-rap': {
    bg: 'bg-genre-smooth-rap/20',
    text: 'text-genre-smooth-rap',
    glow: 'shadow-[0_0_20px_hsl(var(--genre-smooth-rap)/0.4)]',
    border: 'border-genre-smooth-rap/40',
  },
};

// Animated waveform bars component
const NowPlayingWaveform = ({ className }: { className?: string }) => (
  <div className={cn("flex items-end gap-0.5 h-3", className)}>
    {[0, 1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className="w-0.5 bg-current rounded-full"
        animate={{
          height: ['40%', '100%', '60%', '80%', '40%'],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.15,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

export const ChatAmbientPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { state, setPlayback, toggleDrawer } = useGlobalSpotify();
  
  // HC-04: No default - activeGenre can be null
  const activeGenre = state.currentGenre ? (state.currentGenre.toLowerCase() as GenreId) : null;
  const showSpotifyDrawer = state.isDrawerOpen;
  const accentClasses = activeGenre ? genreAccentClasses[activeGenre] : genreAccentClasses.lofi;

  // HC-03 & HC-09: User-initiated only, one-way data flow
  const handleGenreChange = (genre: typeof genres[number]) => {
    setPlayback(genre.spotifyId, genre.id, 'playlist');
    if (!showSpotifyDrawer) {
      toggleDrawer();
    }
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
      {/* Main Player UI */}
      <motion.div
        className={cn(
          "backdrop-blur-xl bg-background/20 border border-border/30",
          "rounded-2xl shadow-lg",
          "transition-all duration-300",
          showSpotifyDrawer && accentClasses.glow
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
              {/* Now Playing Indicator + Track Title */}
              <div className="overflow-hidden max-w-[200px] sm:max-w-[240px] relative">
                <div className="flex items-center gap-2">
                  {/* Now Playing Indicator */}
                  <AnimatePresence>
                    {showSpotifyDrawer && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={cn("flex items-center gap-1.5 shrink-0", accentClasses.text)}
                      >
                        <NowPlayingWaveform />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {!showSpotifyDrawer && (
                    <Music className={cn("w-4 h-4 shrink-0", accentClasses.text)} />
                  )}
                  
                  {/* Scrolling Title */}
                  <motion.span
                    className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      showSpotifyDrawer ? accentClasses.text : "text-foreground"
                    )}
                    animate={{
                      x: (genreLabels[activeGenre]?.length || 0) > 12 ? [0, -40, 0] : 0,
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    {showSpotifyDrawer ? "Now Playing" : genreLabels[activeGenre] || 'Select Genre'}
                  </motion.span>
                </div>
                
                {/* Glow effect */}
                {showSpotifyDrawer && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "absolute inset-0 pointer-events-none rounded-2xl",
                      "bg-gradient-to-r from-transparent via-current/10 to-transparent",
                      accentClasses.text
                    )}
                  />
                )}
              </div>

              {/* Genre Pills */}
              <div className="flex gap-1.5 flex-wrap justify-center">
                {genres.map((genre) => {
                  const isActive = activeGenre === genre.id;
                  const pillAccent = genreAccentClasses[genre.id];
                  
                  return (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreChange(genre)}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-full transition-all duration-200",
                        "border",
                        isActive
                          ? cn(pillAccent.bg, pillAccent.text, pillAccent.border, "shadow-sm")
                          : "bg-background/30 text-muted-foreground border-border/30 hover:bg-background/50 hover:text-foreground"
                      )}
                    >
                      {genre.label}
                    </button>
                  );
                })}
              </div>

              {/* Single Control - Open Spotify Drawer */}
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 px-4 rounded-full gap-2",
                    "border transition-all duration-200",
                    showSpotifyDrawer
                      ? cn(accentClasses.bg, accentClasses.text, accentClasses.border, accentClasses.glow)
                      : "bg-primary/20 hover:bg-primary/30 border-primary/30 text-primary"
                  )}
                  onClick={toggleDrawer}
                >
                  {showSpotifyDrawer ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span className="text-xs">Hide Controls</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span className="text-xs">Play Music</span>
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
              {showSpotifyDrawer ? (
                <NowPlayingWaveform className={accentClasses.text} />
              ) : (
                <Music className={cn("w-4 h-4", accentClasses.text)} />
              )}
              <span className={cn("text-xs", showSpotifyDrawer ? accentClasses.text : "text-muted-foreground")}>
                {showSpotifyDrawer ? "Now Playing" : genreLabels[activeGenre] || 'Music'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={toggleDrawer}
              >
                {showSpotifyDrawer ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3 ml-0.5" />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
