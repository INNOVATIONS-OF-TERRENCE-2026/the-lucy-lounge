import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export type ListeningModeCardProps = {
  title: string;
  subtitle?: string;
  contentId: string;
  contentType: "album" | "playlist";
  icon?: React.ElementType;
  accentColor?: string;
  index?: number;
  compact?: boolean;
  genre: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onInteraction?: () => void;
};

export function ListeningModeCard({
  title,
  subtitle,
  contentId,
  contentType,
  icon: Icon,
  accentColor = "from-primary/20 to-primary/5",
  index = 0,
  compact = false,
  genre,
  isFavorite = false,
  onToggleFavorite,
  onInteraction,
}: ListeningModeCardProps) {
  const embedSrc =
    contentType === "album"
      ? `https://open.spotify.com/embed/album/${contentId}`
      : `https://open.spotify.com/embed/playlist/${contentId}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "relative rounded-xl overflow-hidden border border-border/50 bg-background shadow-sm hover:shadow-md transition-all",
        compact && "min-w-[240px] max-w-[240px]",
      )}
      onClick={onInteraction}
    >
      {/* Header */}
      <div className={cn("p-4 bg-gradient-to-br", accentColor)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-background/60">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
            )}
            <div>
              <h3 className="font-semibold leading-tight text-foreground">{title}</h3>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{subtitle}</p>}
            </div>
          </div>

          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="text-muted-foreground hover:text-red-500 transition-colors"
              aria-label="Toggle favorite"
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-red-500 text-red-500")} />
            </button>
          )}
        </div>
      </div>

      {/* Spotify Embed */}
      <div className="bg-black">
        <iframe
          src={embedSrc}
          width="100%"
          height={compact ? 80 : 152}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    </motion.div>
  );
}
