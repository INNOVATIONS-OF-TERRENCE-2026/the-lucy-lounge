import { LucideIcon, Star } from "lucide-react";
import { motion } from "framer-motion";
import { SpotifyEmbed } from "./SpotifyEmbed";

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
  showFavoriteButton = true
}: ListeningModeCardProps) => {
  const handleClick = () => {
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
      onClick={handleClick}
      className={`relative rounded-xl bg-gradient-to-br ${accentColor} backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-shadow ${
        compact ? 'p-4 min-w-[280px] max-w-[320px]' : 'p-6'
      }`}
    >
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
        <div className="min-w-0">
          <h3 className={`font-semibold text-foreground truncate ${compact ? 'text-base' : 'text-xl'}`}>{title}</h3>
          <p className={`text-muted-foreground truncate ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>{subtitle}</p>
        </div>
      </div>
      <SpotifyEmbed contentId={contentId} type={contentType} title={title} />
    </motion.div>
  );
};
