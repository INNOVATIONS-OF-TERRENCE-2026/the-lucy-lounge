import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalSpotify } from '@/contexts/GlobalSpotifyContext';

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
const genreAccentClasses: Record<string, { bg: string; text: string; glow: string }> = {
  lofi: { bg: 'bg-genre-lofi/20', text: 'text-genre-lofi', glow: 'shadow-[0_0_12px_hsl(var(--genre-lofi)/0.3)]' },
  jazz: { bg: 'bg-genre-jazz/20', text: 'text-genre-jazz', glow: 'shadow-[0_0_12px_hsl(var(--genre-jazz)/0.3)]' },
  rnb: { bg: 'bg-genre-rnb/20', text: 'text-genre-rnb', glow: 'shadow-[0_0_12px_hsl(var(--genre-rnb)/0.3)]' },
  ambient: { bg: 'bg-genre-ambient/20', text: 'text-genre-ambient', glow: 'shadow-[0_0_12px_hsl(var(--genre-ambient)/0.3)]' },
  rap: { bg: 'bg-genre-rap/20', text: 'text-genre-rap', glow: 'shadow-[0_0_12px_hsl(var(--genre-rap)/0.3)]' },
  smooth: { bg: 'bg-genre-smooth-rap/20', text: 'text-genre-smooth-rap', glow: 'shadow-[0_0_12px_hsl(var(--genre-smooth-rap)/0.3)]' },
  'smooth-rap': { bg: 'bg-genre-smooth-rap/20', text: 'text-genre-smooth-rap', glow: 'shadow-[0_0_12px_hsl(var(--genre-smooth-rap)/0.3)]' },
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

/**
 * GlobalMiniPlayer - READ-ONLY visual indicator
 * - Reads state from GlobalSpotifyContext only
 * - Does NOT control playback, volume, or create iframes
 * - Clicking ONLY toggles the existing Spotify drawer
 */
export const GlobalMiniPlayer = () => {
  // READ-ONLY: Only consume state, never mutate playback
  const { state, toggleDrawer } = useGlobalSpotify();
  
  // If nothing is playing, don't show mini-player
  if (!state.currentContentId) {
    return null;
  }

  const genre = state.currentGenre?.toLowerCase() || 'lofi';
  const accent = genreAccentClasses[genre] || genreAccentClasses.lofi;
  const label = genreLabels[genre] || 'Now Playing';

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={toggleDrawer} // ONLY action: toggle drawer visibility
        className={cn(
          // Position: fixed bottom-right, non-blocking
          "fixed bottom-6 right-6 z-40",
          // Glassmorphic background
          "backdrop-blur-xl bg-background/80 border border-border/40",
          // Shape & padding
          "rounded-2xl px-4 py-3",
          // Theme-aware glow
          accent.glow,
          // Hover effect
          "hover:scale-105 transition-transform duration-200",
          // Cursor
          "cursor-pointer",
          // Hide on mobile when drawer is open (avoid overlap)
          state.isDrawerOpen && "sm:flex hidden"
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
          
          {/* Spotify icon (visual only) */}
          <Music2 className={cn("w-4 h-4 ml-1", accent.text)} />
        </div>
        
        {/* Subtle pulse ring */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-2xl border-2",
            accent.text,
            "opacity-20"
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
    </AnimatePresence>
  );
};
