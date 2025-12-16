import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  SkipForward,
  SkipBack,
  Volume2, 
  VolumeX,
  Music,
  ChevronUp,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SpotifyAudioHost, SpotifyAudioHostRef, getSpotifyEmbedUrl } from "./SpotifyAudioHost";

const genres = [
  { id: 'lofi', label: 'Lo-Fi', spotifyId: '0vvXsWCC9xrXsKd4FyS8kM' },
  { id: 'jazz', label: 'Jazz', spotifyId: '37i9dQZF1DWV7EzJMK2FUI' },
  { id: 'rnb', label: 'R&B', spotifyId: '37i9dQZF1DWXnexX7CktaI' },
  { id: 'ambient', label: 'Ambient', spotifyId: '37i9dQZF1DWYoYGBbGKurt' },
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSpotifyPlayer, setShowSpotifyPlayer] = useState(false);
  
  const spotifyHostRef = useRef<SpotifyAudioHostRef>(null);
  const visibleIframeRef = useRef<HTMLIFrameElement>(null);

  const handleGenreChange = (genre: GenreId) => {
    setActiveGenre(genre);
    const genreData = genres.find(g => g.id === genre);
    if (genreData && spotifyHostRef.current) {
      spotifyHostRef.current.setPlaylist(genreData.spotifyId, 'playlist');
    }
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    // Show Spotify player briefly to allow user interaction
    setShowSpotifyPlayer(true);
    setTimeout(() => setShowSpotifyPlayer(false), 3000);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    setShowSpotifyPlayer(true);
    setTimeout(() => setShowSpotifyPlayer(false), 3000);
  };

  const handleVolumeClick = () => {
    setShowSpotifyPlayer(true);
    setTimeout(() => setShowSpotifyPlayer(false), 5000);
  };

  const handleOpenSpotify = () => {
    const genreData = genres.find(g => g.id === activeGenre);
    if (genreData) {
      window.open(`https://open.spotify.com/playlist/${genreData.spotifyId}`, '_blank');
    }
  };

  return (
    <>
      {/* Hidden Spotify Audio Host - Always Mounted */}
      <SpotifyAudioHost ref={spotifyHostRef} />
      
      {/* Visible Spotify Player (shown on interaction) */}
      <AnimatePresence>
        {showSpotifyPlayer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-4 z-50 rounded-xl overflow-hidden shadow-lg"
          >
            <iframe
              ref={visibleIframeRef}
              src={getSpotifyEmbedUrl(activeGenre)}
              width="300"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify Player"
              className="rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Ambient Player UI - Bottom Right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "fixed bottom-20 right-4 z-30",
          "backdrop-blur-xl bg-background/20 border border-border/30",
          "rounded-2xl shadow-lg shadow-primary/10",
          "transition-all duration-300",
          "sm:bottom-24 sm:right-6"
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
              <div className="overflow-hidden max-w-[200px] sm:max-w-[240px]">
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

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-1.5">
                {/* Previous */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-background/40"
                  onClick={handleOpenSpotify}
                  title="Open in Spotify"
                >
                  <SkipBack className="w-3.5 h-3.5 text-foreground" />
                </Button>

                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-full",
                    "bg-primary/20 hover:bg-primary/30",
                    "border border-primary/30",
                    isPlaying && "shadow-md shadow-primary/30"
                  )}
                  onClick={handleTogglePlay}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-primary" />
                  ) : (
                    <Play className="w-4 h-4 text-primary ml-0.5" />
                  )}
                </Button>

                {/* Next */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-background/40"
                  onClick={handleOpenSpotify}
                  title="Open in Spotify"
                >
                  <SkipForward className="w-3.5 h-3.5 text-foreground" />
                </Button>

                {/* Volume / Open Spotify */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 rounded-full hover:bg-background/40",
                    isMuted && "text-muted-foreground"
                  )}
                  onClick={handleVolumeClick}
                  title="Show Spotify controls"
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-foreground" />
                  )}
                </Button>

                {/* External Link */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-background/40"
                  onClick={handleOpenSpotify}
                  title="Open in Spotify"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-foreground" />
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
                {isPlaying ? "Playing" : "Paused"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={handleTogglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3 ml-0.5" />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
