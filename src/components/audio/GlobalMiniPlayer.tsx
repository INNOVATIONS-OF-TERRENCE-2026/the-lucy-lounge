import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Headphones, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalSpotify } from '@/contexts/GlobalSpotifyContext';

// Genre options for quick switcher
const QUICK_GENRES = [
  { id: 'lofi', label: 'Lo-Fi', spotifyId: '37i9dQZF1DWWQRwui0ExPn' },
  { id: 'jazz', label: 'Jazz', spotifyId: '37i9dQZF1DX0SM0LYsmbMT' },
  { id: 'rnb', label: 'R&B', spotifyId: '37i9dQZF1DX4SBhb3fqCJd' },
  { id: 'ambient', label: 'Ambient', spotifyId: '37i9dQZF1DX3Ogo9pFvBkY' },
  { id: 'rap', label: 'Rap', spotifyId: '37i9dQZF1DX0XUsuxWHRQd' },
  { id: 'smooth', label: 'Smooth', spotifyId: '37i9dQZF1DWUzFXarNiofw' },
] as const;

// Genre display labels
const genreLabels: Record<string, string> = {
  lofi: 'Lo-Fi Beats',
  jazz: 'Jazz Vibes',
  rnb: 'R&B Soul',
  ambient: 'Ambient Chill',
  rap: 'Rap Hits',
  smooth: 'Smooth Vibes',
  'smooth-rap': 'Smooth Vibes',
  vibes: 'Vibes',
};

// Genre accent colors (theme-aware)
const genreAccentClasses: Record<string, { bg: string; text: string; glow: string; border: string }> = {
  lofi: { bg: 'bg-genre-lofi/20', text: 'text-genre-lofi', glow: 'shadow-[0_0_12px_hsl(var(--genre-lofi)/0.3)]', border: 'border-genre-lofi/40' },
  jazz: { bg: 'bg-genre-jazz/20', text: 'text-genre-jazz', glow: 'shadow-[0_0_12px_hsl(var(--genre-jazz)/0.3)]', border: 'border-genre-jazz/40' },
  rnb: { bg: 'bg-genre-rnb/20', text: 'text-genre-rnb', glow: 'shadow-[0_0_12px_hsl(var(--genre-rnb)/0.3)]', border: 'border-genre-rnb/40' },
  ambient: { bg: 'bg-genre-ambient/20', text: 'text-genre-ambient', glow: 'shadow-[0_0_12px_hsl(var(--genre-ambient)/0.3)]', border: 'border-genre-ambient/40' },
  rap: { bg: 'bg-genre-rap/20', text: 'text-genre-rap', glow: 'shadow-[0_0_12px_hsl(var(--genre-rap)/0.3)]', border: 'border-genre-rap/40' },
  smooth: { bg: 'bg-genre-smooth-rap/20', text: 'text-genre-smooth-rap', glow: 'shadow-[0_0_12px_hsl(var(--genre-smooth-rap)/0.3)]', border: 'border-genre-smooth-rap/40' },
  'smooth-rap': { bg: 'bg-genre-smooth-rap/20', text: 'text-genre-smooth-rap', glow: 'shadow-[0_0_12px_hsl(var(--genre-smooth-rap)/0.3)]', border: 'border-genre-smooth-rap/40' },
};

// Animated waveform bars (visual only)
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

// Pop animation variants
const popVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.3, 
    y: 40,
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 15,
      mass: 0.8,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.5, 
    y: 20,
    transition: { duration: 0.2, ease: 'easeIn' as const }
  },
};

// Genre pill animation
const pillVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      type: 'spring' as const,
      stiffness: 500,
      damping: 20,
    }
  }),
};

/**
 * GlobalMiniPlayer - READ-ONLY visual indicator with quick genre switcher
 * - Reads state from GlobalSpotifyContext only
 * - Does NOT control playback directly, only triggers setPlayback
 * - Hover/long-press reveals genre switcher
 */
export const GlobalMiniPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // READ-ONLY: Only consume state
  const { state, toggleDrawer, setPlayback, openDrawer } = useGlobalSpotify();
  
  // If nothing is playing, don't show mini-player
  if (!state.currentContentId) {
    return null;
  }

  const genre = state.currentGenre?.toLowerCase() || 'lofi';
  const accent = genreAccentClasses[genre] || genreAccentClasses.lofi;
  const label = genreLabels[genre] || 'Now Playing';

  // Handle genre selection (user-initiated)
  const handleGenreSelect = (g: typeof QUICK_GENRES[number]) => {
    setPlayback(g.spotifyId, g.id, 'playlist');
    openDrawer();
    setIsExpanded(false);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="mini-player"
        variants={popVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={cn(
          // Position: fixed bottom-right, non-blocking
          "fixed bottom-6 right-6 z-40",
          // Hide on mobile when drawer is open
          state.isDrawerOpen && "sm:block hidden"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setIsExpanded(false);
        }}
      >
        {/* Quick Genre Switcher (appears on hover/expand) */}
        <AnimatePresence>
          {(isExpanded || isHovering) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute bottom-full right-0 mb-2",
                "backdrop-blur-xl bg-background/95 border border-border/50",
                "rounded-xl p-2 shadow-xl",
                accent.glow
              )}
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                Quick Switch
              </p>
              <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                {QUICK_GENRES.map((g, i) => {
                  const isActive = genre === g.id;
                  const pillAccent = genreAccentClasses[g.id];
                  
                  return (
                    <motion.button
                      key={g.id}
                      custom={i}
                      variants={pillVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => handleGenreSelect(g)}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-full transition-all duration-150",
                        "border",
                        isActive
                          ? cn(pillAccent.bg, pillAccent.text, pillAccent.border)
                          : "bg-background/50 text-muted-foreground border-border/30 hover:bg-background/80 hover:text-foreground"
                      )}
                    >
                      {g.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Mini-Player Button */}
        <motion.button
          onClick={toggleDrawer}
          onContextMenu={(e) => {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            // Glassmorphic background
            "backdrop-blur-xl bg-background/80 border border-border/40",
            // Shape & padding
            "rounded-2xl px-4 py-3",
            // Theme-aware glow
            accent.glow,
            // Cursor
            "cursor-pointer",
            // Focus outline
            "focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
          aria-label="Toggle Spotify player"
        >
          <div className="flex items-center gap-3">
            {/* Animated waveform indicator */}
            <div className={cn("p-2 rounded-xl", accent.bg)}>
              <NowPlayingWaveform className={accent.text} />
            </div>
            
            {/* Text content */}
            <div className="flex flex-col items-start">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Headphones className="w-3 h-3" />
                Now Playing
              </span>
              <span className={cn("text-sm font-medium", accent.text)}>
                {label}
              </span>
            </div>
            
            {/* Expand indicator */}
            <motion.div
              animate={{ rotate: isExpanded || isHovering ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronUp className={cn("w-4 h-4", accent.text)} />
            </motion.div>
          </div>
          
          {/* Subtle pulse ring */}
          <motion.div
            className={cn(
              "absolute inset-0 rounded-2xl border-2",
              accent.text,
              "opacity-20 pointer-events-none"
            )}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.1, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};
