import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Music,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioManager } from "@/hooks/useAudioManager";
import { cn } from "@/lib/utils";

const genres = [
  { id: 'lofi', label: 'Lo-Fi' },
  { id: 'jazz', label: 'Jazz' },
  { id: 'rnb', label: 'R&B' },
  { id: 'ambient', label: 'Ambient' },
] as const;

type GenreId = typeof genres[number]['id'];

export const ChatAmbientPlayer = () => {
  const {
    isPlaying,
    currentTrackName,
    volume,
    setVolume,
    musicEnabled,
    setMusicEnabled,
    togglePlayPause,
    skipTrack,
    playMusic,
  } = useAudioManager();

  const [isExpanded, setIsExpanded] = useState(true);
  const [activeGenre, setActiveGenre] = useState<GenreId>('lofi');
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  const handleGenreChange = (genre: GenreId) => {
    setActiveGenre(genre);
    if (!musicEnabled) {
      setMusicEnabled(true);
    }
    playMusic(genre);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume || 0.5);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "absolute bottom-20 left-1/2 -translate-x-1/2 z-30",
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
            <div className="overflow-hidden max-w-[280px] sm:max-w-[320px]">
              <motion.div
                className="flex items-center gap-2"
                animate={{
                  x: currentTrackName && currentTrackName.length > 25 ? [0, -100, 0] : 0,
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Music className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {currentTrackName || "Select a vibe"}
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
                    "px-3 py-1 text-xs rounded-full transition-all duration-200",
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
            <div className="flex items-center justify-center gap-2">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full",
                  "bg-primary/20 hover:bg-primary/30",
                  "border border-primary/30",
                  isPlaying && "shadow-md shadow-primary/30"
                )}
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-primary" />
                ) : (
                  <Play className="w-5 h-5 text-primary ml-0.5" />
                )}
              </Button>

              {/* Next */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-background/40"
                onClick={skipTrack}
              >
                <SkipForward className="w-4 h-4 text-foreground" />
              </Button>

              {/* Mute */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full hover:bg-background/40",
                  isMuted && "text-muted-foreground"
                )}
                onClick={handleToggleMute}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4 text-foreground" />
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
              {isPlaying ? "Playing" : "Paused"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={togglePlayPause}
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
  );
};
