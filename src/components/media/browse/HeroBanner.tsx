/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — HERO BANNER                                              │
 * │                                                                             │
 * │ Netflix/Tubi-style featured hero with auto-rotation and cinematic design   │
 * │ PREMIUM BROWSE EXPERIENCE                                                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Info, Check, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MediaNode } from '@/media/types';

// =============================================================================
// TYPES
// =============================================================================

export interface HeroBannerProps {
  items: MediaNode[];
  onPlay: (node: MediaNode) => void;
  onAddToList: (node: MediaNode) => void;
  onInfo: (node: MediaNode) => void;
  watchlistIds?: Set<string>;
  autoRotate?: boolean;
  rotationInterval?: number;
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDuration(seconds: number): string {
  if (!seconds) return '';
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getYearFromDate(dateStr?: string): number | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.getFullYear();
}

// =============================================================================
// COMPONENT
// =============================================================================

export function HeroBanner({
  items,
  onPlay,
  onAddToList,
  onInfo,
  watchlistIds = new Set(),
  autoRotate = true,
  rotationInterval = 8000,
  className,
}: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const displayItems = useMemo(() => items.slice(0, 5), [items]);
  const currentItem = displayItems[currentIndex];

  // Auto-rotation
  useEffect(() => {
    if (!autoRotate || isHovered || displayItems.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    }, rotationInterval);

    return () => clearInterval(timer);
  }, [autoRotate, isHovered, displayItems.length, rotationInterval]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
  }, [displayItems.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayItems.length);
  }, [displayItems.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNext();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (currentItem) onPlay(currentItem);
    }
  }, [goToPrevious, goToNext, currentItem, onPlay]);

  if (!currentItem || displayItems.length === 0) {
    return null;
  }

  const year = currentItem.release_year || getYearFromDate(currentItem.release_date);
  const isInWatchlist = watchlistIds.has(currentItem.id);
  const backdropUrl = currentItem.backdrop_url || currentItem.poster_url;

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden',
        'aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.5/1]',
        'bg-gradient-to-b from-background/0 via-background/50 to-background',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Featured content"
      aria-roledescription="carousel"
    >
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt=""
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-background" />
          )}
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-end pb-8 md:pb-12 lg:pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-2xl space-y-4"
          >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {currentItem.content_rating && (
                <Badge variant="outline" className="border-white/30 text-white/90">
                  {currentItem.content_rating}
                </Badge>
              )}
              {year && (
                <Badge variant="secondary" className="bg-white/10 text-white/90">
                  {year}
                </Badge>
              )}
              {currentItem.duration_seconds && (
                <Badge variant="secondary" className="bg-white/10 text-white/90">
                  {formatDuration(currentItem.duration_seconds)}
                </Badge>
              )}
              {currentItem.average_rating && (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                  ⭐ {currentItem.average_rating.toFixed(1)}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight line-clamp-2">
              {currentItem.title}
            </h2>

            {/* Description */}
            {currentItem.description && (
              <p className="text-sm sm:text-base text-white/80 line-clamp-2 md:line-clamp-3 max-w-lg">
                {currentItem.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => onPlay(currentItem)}
                className="bg-white text-black hover:bg-white/90 font-semibold gap-2"
              >
                <Play className="h-5 w-5" fill="currentColor" />
                Play
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => onAddToList(currentItem)}
                className="border-white/30 text-white hover:bg-white/10 gap-2"
              >
                {isInWatchlist ? (
                  <>
                    <Check className="h-5 w-5" />
                    In My List
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    My List
                  </>
                )}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => onInfo(currentItem)}
                className="text-white hover:bg-white/10 rounded-full"
                aria-label="More info"
              >
                <Info className="h-5 w-5" />
              </Button>

              {/* Mute Toggle (for future video preview) */}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:bg-white/10 rounded-full ml-auto hidden md:flex"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {displayItems.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className={cn(
              'absolute left-2 md:left-4 top-1/2 -translate-y-1/2',
              'text-white hover:bg-white/10 rounded-full',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              isHovered && 'opacity-100'
            )}
            aria-label="Previous item"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className={cn(
              'absolute right-2 md:right-4 top-1/2 -translate-y-1/2',
              'text-white hover:bg-white/10 rounded-full',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              isHovered && 'opacity-100'
            )}
            aria-label="Next item"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Pagination Dots */}
      {displayItems.length > 1 && (
        <div className="absolute bottom-4 md:bottom-6 right-4 md:right-8 flex items-center gap-2">
          {displayItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'bg-white/40 hover:bg-white/60'
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default HeroBanner;
