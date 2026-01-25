/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — MEDIA ROW COMPONENT                                      │
 * │                                                                             │
 * │ Horizontal scrolling row for displaying MediaNode collections              │
 * │ with mobile-first touch scrolling and lazy loading                         │
 * │ PHASE 2 IMPLEMENTATION                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaCard } from './MediaCard';
import { cn } from '@/lib/utils';
import type { MediaNode } from '@/media/types';

// =============================================================================
// TYPES
// =============================================================================

export interface MediaRowProps {
  id: string;
  title: string;
  subtitle?: string;
  items: MediaNode[];
  itemSize?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  showReason?: boolean;
  reason?: string;
  maxItems?: number;
  onItemPlay?: (node: MediaNode) => void;
  onItemFavorite?: (node: MediaNode) => void;
  onItemWatchlist?: (node: MediaNode) => void;
  onSeeAll?: () => void;
  favoriteIds?: Set<string>;
  watchlistIds?: Set<string>;
  progressMap?: Map<string, number>;
  className?: string;
}

// Check if we're on a touch device
const isTouchDevice = typeof window !== 'undefined' && 
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// =============================================================================
// COMPONENT
// =============================================================================

export function MediaRow({
  id,
  title,
  subtitle,
  items,
  itemSize = 'medium',
  showProgress = false,
  showReason = false,
  reason,
  maxItems = 20,
  onItemPlay,
  onItemFavorite,
  onItemWatchlist,
  onSeeAll,
  favoriteIds = new Set(),
  watchlistIds = new Set(),
  progressMap = new Map(),
  className,
}: MediaRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Limit items
  const displayItems = items.slice(0, maxItems);
  
  // Update scroll state
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);
  
  // Scroll handlers
  const scrollLeft = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: -el.clientWidth * 0.8, behavior: 'smooth' });
  }, []);
  
  const scrollRight = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' });
  }, []);
  
  // Watch scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);
  
  // Don't render empty rows
  if (displayItems.length === 0) {
    return null;
  }
  
  return (
    <section className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-0">
        <div>
          <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        {/* Desktop scroll buttons + See All */}
        <div className="flex items-center gap-2">
          {/* Desktop scroll buttons */}
          {!isTouchDevice && displayItems.length > 4 && (
            <div className="hidden md:flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={scrollRight}
                disabled={!canScrollRight}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* See All button */}
          {onSeeAll && items.length > maxItems && (
            <Button variant="link" size="sm" onClick={onSeeAll}>
              See all →
            </Button>
          )}
        </div>
      </div>
      
      {/* Scrollable Row */}
      <div className="relative">
        {/* Left fade gradient (desktop) */}
        {!isTouchDevice && canScrollLeft && (
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        )}
        
        {/* Scroll container */}
        <div
          ref={scrollRef}
          className={cn(
            'flex gap-3 overflow-x-auto scrollbar-hide',
            'px-4 md:px-0',
            // Touch-friendly scroll snapping on mobile
            'snap-x snap-mandatory md:snap-none',
            // Hide scrollbar
            '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
          )}
          style={{
            // Smooth scrolling
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {displayItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="snap-start"
            >
              <MediaCard
                node={item}
                size={itemSize}
                showProgress={showProgress}
                progress={progressMap.get(item.id) || 0}
                showReason={showReason}
                reason={reason}
                isFavorite={favoriteIds.has(item.id)}
                isInWatchlist={watchlistIds.has(item.id)}
                onPlay={onItemPlay ? () => onItemPlay(item) : undefined}
                onToggleFavorite={onItemFavorite ? () => onItemFavorite(item) : undefined}
                onToggleWatchlist={onItemWatchlist ? () => onItemWatchlist(item) : undefined}
              />
            </motion.div>
          ))}
        </div>
        
        {/* Right fade gradient (desktop) */}
        {!isTouchDevice && canScrollRight && (
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        )}
      </div>
    </section>
  );
}

export default MediaRow;
