/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — MEDIA CARD COMPONENT                                     │
 * │                                                                             │
 * │ Universal card component for MediaNode display with mobile-first           │
 * │ design, progress tracking, and gesture-safe interactions                   │
 * │ PHASE 2 IMPLEMENTATION                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Heart, Check, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { MediaNode, MediaCategory } from '@/media/types';

// =============================================================================
// TYPES
// =============================================================================

export interface MediaCardProps {
  node: MediaNode;
  size?: 'small' | 'medium' | 'large' | 'hero';
  showProgress?: boolean;
  progress?: number; // 0-100
  showReason?: boolean;
  reason?: string;
  isFavorite?: boolean;
  isInWatchlist?: boolean;
  onPlay?: () => void;
  onToggleFavorite?: () => void;
  onToggleWatchlist?: () => void;
  onOpenExternal?: () => void;
  className?: string;
}

// Mobile-first: Check if we can embed inline (desktop only)
const canEmbedInline = typeof window !== 'undefined' && window.innerWidth >= 1024;

// =============================================================================
// SIZE CONFIGURATIONS
// =============================================================================

const SIZE_CONFIG = {
  small: {
    width: 'w-[140px] md:w-[160px]',
    height: 'aspect-[2/3]',
    imageHeight: 'h-[180px] md:h-[200px]',
    titleSize: 'text-xs md:text-sm',
    showSubtitle: false,
    showMeta: false,
  },
  medium: {
    width: 'w-[180px] md:w-[220px]',
    height: 'aspect-[2/3]',
    imageHeight: 'h-[220px] md:h-[280px]',
    titleSize: 'text-sm md:text-base',
    showSubtitle: true,
    showMeta: true,
  },
  large: {
    width: 'w-[240px] md:w-[300px]',
    height: 'aspect-video',
    imageHeight: 'h-[160px] md:h-[200px]',
    titleSize: 'text-base md:text-lg',
    showSubtitle: true,
    showMeta: true,
  },
  hero: {
    width: 'w-full max-w-[600px]',
    height: 'aspect-video',
    imageHeight: 'h-[280px] md:h-[400px]',
    titleSize: 'text-xl md:text-2xl',
    showSubtitle: true,
    showMeta: true,
  },
} as const;

// =============================================================================
// HELPERS
// =============================================================================

function formatDuration(seconds: number): string {
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getCategoryIcon(category: MediaCategory): string {
  switch (category) {
    case 'video': return '🎬';
    case 'audio': return '🎵';
    case 'live': return '📺';
    default: return '🎬';
  }
}

function getPlaceholderImage(category: MediaCategory): string {
  // Gradient placeholders based on category
  switch (category) {
    case 'video':
      return 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)';
    case 'audio':
      return 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)';
    case 'live':
      return 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)';
    default:
      return 'linear-gradient(135deg, #374151 0%, #111827 100%)';
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MediaCard({
  node,
  size = 'medium',
  showProgress = false,
  progress = 0,
  showReason = false,
  reason,
  isFavorite = false,
  isInWatchlist = false,
  onPlay,
  onToggleFavorite,
  onToggleWatchlist,
  onOpenExternal,
  className,
}: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const config = SIZE_CONFIG[size];
  
  // Build external URL based on node type
  const getExternalUrl = useCallback(() => {
    if (node.youtube_id) {
      return `https://www.youtube.com/watch?v=${node.youtube_id}`;
    }
    if (node.spotify_id) {
      return `https://open.spotify.com/track/${node.spotify_id}`;
    }
    return null;
  }, [node.youtube_id, node.spotify_id]);
  
  // Handle play - opens external on mobile, triggers onPlay on desktop
  const handlePlay = useCallback(() => {
    if (canEmbedInline && onPlay) {
      onPlay();
    } else {
      const url = getExternalUrl();
      if (url) {
        window.open(url, '_blank');
      }
      onOpenExternal?.();
    }
  }, [canEmbedInline, onPlay, getExternalUrl, onOpenExternal]);
  
  // Image source
  const imageSrc = imageError || !node.poster_url
    ? null
    : node.poster_url;
  
  return (
    <motion.div
      className={cn('flex-shrink-0', config.width, className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-0 bg-transparent">
        <CardContent className="p-0">
          {/* Image Container */}
          <div className={cn('relative rounded-lg overflow-hidden', config.imageHeight)}>
            {/* Image or Placeholder */}
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={node.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-4xl"
                style={{ background: getPlaceholderImage(node.category) }}
              >
                {getCategoryIcon(node.category)}
              </div>
            )}
            
            {/* Progress Bar (if showing) */}
            {showProgress && progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0">
                <Progress 
                  value={progress} 
                  className="h-1 rounded-none bg-black/50"
                />
              </div>
            )}
            
            {/* Hover Overlay */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2"
              >
                {/* Play Button */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full h-12 w-12"
                  onClick={handlePlay}
                >
                  <Play className="h-6 w-6" fill="currentColor" />
                </Button>
                
                {/* Favorite Button */}
                {onToggleFavorite && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      'rounded-full h-10 w-10',
                      isFavorite && 'text-red-500'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite();
                    }}
                  >
                    <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
                  </Button>
                )}
                
                {/* Watchlist Button */}
                {onToggleWatchlist && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      'rounded-full h-10 w-10',
                      isInWatchlist && 'text-green-500'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist();
                    }}
                  >
                    {isInWatchlist ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </Button>
                )}
              </motion.div>
            )}
            
            {/* Mobile Play Indicator (no hover on mobile) */}
            {!canEmbedInline && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open
                </Badge>
              </div>
            )}
            
            {/* Content Rating Badge */}
            {node.content_rating && (
              <Badge 
                variant="outline" 
                className="absolute top-2 left-2 text-xs bg-black/60 border-white/20"
              >
                {node.content_rating}
              </Badge>
            )}
          </div>
          
          {/* Text Content */}
          <div className="pt-2 px-1">
            {/* Title */}
            <h3 className={cn(
              'font-semibold line-clamp-2 leading-tight',
              config.titleSize
            )}>
              {node.title}
            </h3>
            
            {/* Subtitle / Original Title */}
            {config.showSubtitle && node.original_title && node.original_title !== node.title && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {node.original_title}
              </p>
            )}
            
            {/* Metadata Row */}
            {config.showMeta && (
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {/* Year */}
                {node.release_year && (
                  <span>{node.release_year}</span>
                )}
                
                {/* Duration */}
                {node.duration_seconds && (
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {formatDuration(node.duration_seconds)}
                  </span>
                )}
                
                {/* Rating */}
                {node.average_rating && (
                  <span>⭐ {node.average_rating.toFixed(1)}</span>
                )}
              </div>
            )}
            
            {/* Reason (if showing) */}
            {showReason && reason && (
              <p className="text-xs text-primary/80 mt-1 line-clamp-1">
                {reason}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default MediaCard;
