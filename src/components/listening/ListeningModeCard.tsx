import { LucideIcon, Star, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useGlobalSpotify } from "@/contexts/GlobalSpotifyContext";
import { useLucyDJ } from "@/contexts/LucyDJContext";

interface ListeningModeCardProps {
  title: string;
  subtitle: string;
  contentId: string;
  contentType?: 'playlist' | 'album';
  icon?: LucideIcon;
  accentColor?: string;
  index?: number;
  compact?: boolean;
  onInteraction?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  showFavoriteButton?: boolean;
  genre?: string;
}

export const ListeningModeCard = ({ 
  title, 
  subtitle, 
  contentId,
  contentType = 'playlist',
  icon: Icon,
  accentColor = "from-primary/20 to-primary/5",
  index = 0,
  compact = false,
  onInteraction,
  isFavorite = false,
  onToggleFavorite,
  showFavoriteButton = true,
  genre = 'lofi'
}: ListeningModeCardProps) => {
  const { state, setPlayback, openDrawer } = useGlobalSpotify();
  const { isLucyPick, recordSelection } = useLucyDJ();
  
  // HC-05: Compare against currentContentId
  const isCurrentlyPlaying = state.currentContentId === contentId;
  const isLucyRecommended = isLucyPick(genre);

  // HC-03 & HC-09: User-initiated only, one-way data flow
  const handlePlay = () => {
    setPlayback(contentId, genre, contentType);
    openDrawer();
    recordSelection(genre); // Record for Lucy DJ learning
    
    if (onInteraction) {
      onInteraction();
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`relative rounded-xl bg-gradient-to-br ${accentColor} backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-shadow ${
        compact ? 'p-4 min-w-[280px] max-w-[320px]' : 'p-6'
      } ${isCurrentlyPlaying ? 'ring-2 ring-primary/50' : ''}`}
    >
      {/* Lucy Pick Badge */}
      {isLucyRecommended && !isCurrentlyPlaying && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -left-2 z-10"
        >
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-primary text-white text-[10px] font-medium shadow-lg">
            <Sparkles className="w-2.5 h-2.5" />
            Lucy Pick
          </div>
        </motion.div>
      )}

      {/* Favorite Button */}
      {showFavoriteButton && onToggleFavorite && (
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-1.5 rounded-full transition-all duration-200 z-10 ${
            isFavorite 
              ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' 
              : 'bg-background/50 text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      )}
      
      <div className={`flex items-center gap-3 ${compact ? 'mb-3' : 'mb-4'} ${showFavoriteButton ? 'pr-8' : ''}`}>
        {Icon && <Icon className={`text-primary shrink-0 ${compact ? 'w-5 h-5' : 'w-6 h-6'}`} />}
        <div className="min-w-0 flex-1">
          <h3 className={`font-semibold text-foreground truncate ${compact ? 'text-base' : 'text-xl'}`}>{title}</h3>
          <p className={`text-muted-foreground truncate ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>{subtitle}</p>
        </div>
      </div>

      {/* Play Button - Controls Global Spotify */}
      <button
        onClick={handlePlay}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
          isCurrentlyPlaying
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary/10 text-primary hover:bg-primary/20'
        }`}
      >
        <Play className={`w-5 h-5 ${isCurrentlyPlaying ? 'fill-current' : ''}`} />
        <span>{isCurrentlyPlaying ? 'Now Playing' : 'Play'}</span>
      </button>

      {/* Currently Playing Indicator */}
      {isCurrentlyPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"
        />
      )}
    </motion.div>
  );
};
