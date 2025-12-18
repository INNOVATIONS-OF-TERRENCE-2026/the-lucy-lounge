// SAFETY NOTE:
// This component MUST NEVER hard-throw.
// Any missing provider must degrade gracefully to avoid blank-screen crashes.

import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Music2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Headphones,
  Sparkles,
  Brain,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import contexts directly for safe access
import { GlobalSpotifyContext } from "@/contexts/GlobalSpotifyContext";
import { LucyDJContext } from "@/contexts/LucyDJContext";

// Shared playlist IDs
const genres = [
  { id: 'lofi', label: 'Lo-Fi', spotifyId: '37i9dQZF1DWWQRwui0ExPn' },
  { id: 'jazz', label: 'Jazz', spotifyId: '37i9dQZF1DX0SM0LYsmbMT' },
  { id: 'rnb', label: 'R&B', spotifyId: '37i9dQZF1DX4SBhb3fqCJd' },
  { id: 'ambient', label: 'Ambient', spotifyId: '37i9dQZF1DX3Ogo9pFvBkY' },
  { id: 'rap', label: 'Rap', spotifyId: '37i9dQZF1DX0XUsuxWHRQd' },
  { id: 'smooth', label: 'Smooth', spotifyId: '37i9dQZF1DWUzFXarNiofw' },
] as const;

type GenreId = typeof genres[number]['id'];

const genreLabels: Record<GenreId, string> = {
  lofi: 'Lo-Fi Beats',
  jazz: 'Jazz Vibes',
  rnb: 'R&B Soul',
  ambient: 'Ambient Chill',
  rap: 'Rap Hits',
  smooth: 'Smooth Vibes',
};

// Genre accent colors
const genreAccentClasses: Record<GenreId, { bg: string; text: string; glow: string; border: string }> = {
  lofi: {
    bg: 'bg-genre-lofi/20',
    text: 'text-genre-lofi',
    glow: 'shadow-[0_0_15px_hsl(var(--genre-lofi)/0.3)]',
    border: 'border-genre-lofi/40',
  },
  jazz: {
    bg: 'bg-genre-jazz/20',
    text: 'text-genre-jazz',
    glow: 'shadow-[0_0_15px_hsl(var(--genre-jazz)/0.3)]',
    border: 'border-genre-jazz/40',
  },
  rnb: {
    bg: 'bg-genre-rnb/20',
    text: 'text-genre-rnb',
    glow: 'shadow-[0_0_15px_hsl(var(--genre-rnb)/0.3)]',
    border: 'border-genre-rnb/40',
  },
  ambient: {
    bg: 'bg-genre-ambient/20',
    text: 'text-genre-ambient',
    glow: 'shadow-[0_0_15px_hsl(var(--genre-ambient)/0.3)]',
    border: 'border-genre-ambient/40',
  },
  rap: {
    bg: 'bg-genre-rap/20',
    text: 'text-genre-rap',
    glow: 'shadow-[0_0_15px_hsl(var(--genre-rap)/0.3)]',
    border: 'border-genre-rap/40',
  },
  smooth: {
    bg: 'bg-genre-smooth-rap/20',
    text: 'text-genre-smooth-rap',
    glow: 'shadow-[0_0_15px_hsl(var(--genre-smooth-rap)/0.3)]',
    border: 'border-genre-smooth-rap/40',
  },
};

// Animated waveform bars
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

// Safe fallback component when Spotify context unavailable
const FallbackMusicButton = () => (
  <Button
    variant="ghost"
    size="sm"
    disabled
    className="h-9 px-3 gap-2 rounded-xl bg-background/30 border border-border/30 opacity-60"
  >
    <AlertCircle className="w-4 h-4 text-muted-foreground" />
    <span className="text-xs text-muted-foreground hidden sm:inline">Music</span>
  </Button>
);

export const HeaderMusicPlayer = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // CRASH-PROOF: Use useContext directly with null checks instead of throwing hooks
  const spotifyContext = useContext(GlobalSpotifyContext);
  const lucyDJContext = useContext(LucyDJContext);
  
  // If Spotify context is unavailable, render safe fallback
  if (!spotifyContext) {
    console.warn('[CHAT_CRASH_GUARD] GlobalSpotifyContext unavailable - rendering fallback');
    return <FallbackMusicButton />;
  }
  
  const state = spotifyContext.state;
  const setPlayback = spotifyContext.setPlayback;
  const openDrawer = spotifyContext.openDrawer;
  const toggleDrawer = spotifyContext.toggleDrawer;
  
  // Lucy DJ is optional - degrade gracefully if unavailable
  const lucyState = lucyDJContext?.state ?? { isEnabled: false };
  const getVibeMessage = lucyDJContext?.getVibeMessage ?? (() => null);
  const isLucyPick = lucyDJContext?.isLucyPick ?? (() => false);
  const openSuggestionDrawerFn = lucyDJContext?.openSuggestionDrawer ?? (() => {});
  const recordSelectionFn = lucyDJContext?.recordSelection ?? (() => {});
  
  const isPlaying = !!state.currentContentId;
  const activeGenre = state.currentGenre ? (state.currentGenre.toLowerCase() as GenreId) : null;
  const accentClasses = activeGenre ? genreAccentClasses[activeGenre] : genreAccentClasses.lofi;
  const vibeMessage = getVibeMessage();

  // HC-03: Autoplay on selection - selecting genre immediately starts playback & opens drawer
  const handleGenreSelect = (genre: typeof genres[number]) => {
    try {
      setPlayback(genre.spotifyId, genre.id, 'playlist');
      openDrawer();
      recordSelectionFn(genre.id);
    } catch (error) {
      console.error('[CHAT_CRASH_GUARD] Genre selection failed:', error);
    }
  };

  return (
    <div className="relative">
      {/* Main Header Control */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={cn(
          "h-9 px-3 gap-2 rounded-xl transition-all duration-200",
          "backdrop-blur-md border",
          isPlaying
            ? cn(accentClasses.bg, accentClasses.border, accentClasses.glow)
            : "bg-background/30 border-border/30 hover:bg-background/50"
        )}
      >
        {isPlaying ? (
          <NowPlayingWaveform className={accentClasses.text} />
        ) : (
          <Music2 className="w-4 h-4 text-muted-foreground" />
        )}
        
        <span className={cn(
          "text-xs font-medium hidden sm:inline max-w-[80px] truncate",
          isPlaying ? accentClasses.text : "text-muted-foreground"
        )}>
          {isPlaying ? genreLabels[activeGenre] || 'Playing' : 'Music'}
        </span>
        
        {isDropdownOpen ? (
          <ChevronUp className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        )}
      </Button>

      {/* Dropdown Panel - Controls only, no iframe (HC-01: single iframe in GlobalSpotifyAudioHost) */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute top-full right-0 mt-2 z-50",
              "w-[300px] sm:w-[340px]",
              "backdrop-blur-xl bg-background/95 border border-border/50",
              "rounded-2xl shadow-2xl overflow-hidden",
              isPlaying && accentClasses.glow
            )}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className={cn("w-4 h-4", isPlaying ? accentClasses.text : "text-primary")} />
                <span className="text-sm font-semibold text-foreground">
                  {isPlaying ? 'Now Playing' : 'Select Music'}
                </span>
              </div>
              {isPlaying && (
                <div className="flex items-center gap-1">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", accentClasses.bg, accentClasses.text)}>
                    {genreLabels[activeGenre]}
                  </span>
                  <a
                    href={`https://open.spotify.com/${state.contentType}/${state.currentContentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                </div>
              )}
            </div>

            {/* Lucy DJ Vibe Message */}
            {lucyState.isEnabled && vibeMessage && (
              <div className="px-4 py-2 border-b border-border/30 bg-gradient-to-r from-violet-500/5 to-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs text-muted-foreground">{vibeMessage}</span>
                  </div>
                  <button
                    onClick={() => {
                      openSuggestionDrawerFn();
                      setIsDropdownOpen(false);
                    }}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Suggestions
                  </button>
                </div>
              </div>
            )}

            {/* Genre Selector - HC-03: Autoplay on click */}
            <div className="px-4 py-3">
              <p className="text-xs text-muted-foreground mb-2">Tap genre to play instantly</p>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => {
                  const isActive = activeGenre === genre.id;
                  const pillAccent = genreAccentClasses[genre.id];
                  const lucyPick = isLucyPick(genre.id);
                  
                  return (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreSelect(genre)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200",
                        "border relative",
                        isActive
                          ? cn(pillAccent.bg, pillAccent.text, pillAccent.border, pillAccent.glow)
                          : "bg-background/50 text-muted-foreground border-border/30 hover:bg-background/80 hover:text-foreground hover:border-border/50"
                      )}
                    >
                      {lucyPick && !isActive && (
                        <Sparkles className="w-2.5 h-2.5 absolute -top-1 -right-1 text-violet-400" />
                      )}
                      {genre.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Show/Hide Spotify Controls */}
            {isPlaying && (
              <div className="px-4 py-3 border-t border-border/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    toggleDrawer();
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full h-9 rounded-xl gap-2",
                    "border transition-all duration-200",
                    state.isDrawerOpen
                      ? cn(accentClasses.bg, accentClasses.text, accentClasses.border)
                      : "bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary"
                  )}
                >
                  <Music2 className="w-4 h-4" />
                  <span className="text-xs">
                    {state.isDrawerOpen ? 'Hide Spotify Player' : 'Show Spotify Player'}
                  </span>
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isPlaying && (
              <div className="px-4 py-4 text-center border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                  Select a genre above to start playing
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};
