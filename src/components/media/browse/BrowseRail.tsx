/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — BROWSE RAIL (Enhanced MediaRow)                          │
 * │                                                                             │
 * │ Netflix/Tubi-style horizontal rail with premium interactions               │
 * │ Enhanced version with See All, keyboard nav, and loading states            │
 * │ PREMIUM BROWSE EXPERIENCE                                                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaCard } from '../MediaCard';
import { cn } from '@/lib/utils';
import type { MediaNode } from '@/media/types';

// =============================================================================
// TYPES
// =============================================================================

export interface BrowseRailProps {
  id: string;
  title: string;
  subtitle?: string;
  items: MediaNode[];
  itemSize?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  showReason?: boolean;
  reason?: string;
  maxItems?: number;
  totalItems?: number;
  isLoading?: boolean;
  onItemPlay?: (node: MediaNode) => void;
  onItemFavorite?: (node: MediaNode) => void;
  onItemWatchlist?: (node: MediaNode) => void;
  onSeeAll?: () => void;
  favoriteIds?: Set<string>;
  watchlistIds?: Set<string>;
  progressMap?: Map<string, number>;
  className?: string;
  priority?: 'high' | 'normal' | 'low';
}

// Check if we're on a touch device
const isTouchDevice = typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// =============================================================================
// SKELETON LOADER
// =============================================================================

function RailSkeleton({ itemSize = 'medium' }: { itemSize?: string }) {
  const widths = {
    small: 'w-[140px] md:w-[160px]',
    medium: 'w-[180px] md:w-[220px]',
    large: 'w-[240px] md:w-[300px]',
  };
  const heights = {
    small: 'h-[180px] md:h-[200px]',
    medium: 'h-[220px] md:h-[280px]',
    large: 'h-[160px] md:h-[200px]',
  };

  return (
    <div className="flex gap-3 px-4 md:px-0">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'shrink-0 rounded-lg bg-muted animate-pulse',
            widths[itemSize as keyof typeof widths] || widths.medium,
            heights[itemSize as keyof typeof heights] || heights.medium
          )}
        />
      ))}
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BrowseRail({
  id,
  title,
  subtitle,
  items,
  itemSize = 'medium',
  showProgress = false,
  showReason = false,
  reason,
  maxItems = 20,
  totalItems,
  isLoading = false,
  onItemPlay,
  onItemFavorite,
  onItemWatchlist,
  onSeeAll,
  favoriteIds = new Set(),
  watchlistIds = new Set(),
  progressMap = new Map(),
  className,
  priority = 'normal',
}: BrowseRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const displayItems = items.slice(0, maxItems);
  const hasMoreItems = totalItems ? totalItems > displayItems.length : items.length > maxItems;

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

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (displayItems.length === 0) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(0, prev - 1));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(displayItems.length - 1, prev + 1));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(displayItems.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < displayItems.length) {
          onItemPlay?.(displayItems[focusedIndex]);
        }
        break;
    }
  }, [displayItems, focusedIndex, onItemPlay]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex < 0) return;
    const el = scrollRef.current;
    const items = el?.querySelectorAll('[data-rail-item]');
    const focusedEl = items?.[focusedIndex] as HTMLElement;

    if (focusedEl && el) {
      const elRect = el.getBoundingClientRect();
      const itemRect = focusedEl.getBoundingClientRect();

      if (itemRect.left < elRect.left) {
        el.scrollBy({ left: itemRect.left - elRect.left - 20, behavior: 'smooth' });
      } else if (itemRect.right > elRect.right) {
        el.scrollBy({ left: itemRect.right - elRect.right + 20, behavior: 'smooth' });
      }
    }
  }, [focusedIndex]);

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

  // Don't render empty non-loading rails
  if (!isLoading && displayItems.length === 0) {
    return null;
  }

  return (
    <section
      className={cn('space-y-3', className)}
      aria-labelledby={`rail-title-${id}`}
      role="region"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-0">
        <div className="min-w-0">
          <h2
            id={`rail-title-${id}`}
            className="text-lg md:text-xl font-semibold truncate"
          >
            {title}
            {isLoading && (
              <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>

        {/* Desktop scroll buttons + See All */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop scroll buttons */}
          {!isTouchDevice && displayItems.length > 4 && (
            <div className="hidden md:flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={scrollRight}
                disabled={!canScrollRight}
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* See All button */}
          {onSeeAll && hasMoreItems && (
            <Button
              variant="link"
              size="sm"
              onClick={onSeeAll}
              className="text-primary hover:text-primary/80 font-medium"
            >
              See all →
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable Row */}
      <div className="relative group">
        {/* Left fade gradient (desktop) */}
        {!isTouchDevice && canScrollLeft && (
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        )}

        {/* Loading skeleton */}
        {isLoading && displayItems.length === 0 ? (
          <RailSkeleton itemSize={itemSize} />
        ) : (
          /* Scroll container */
          <div
            ref={scrollRef}
            className={cn(
              'flex gap-3 overflow-x-auto scrollbar-hide',
              'px-4 md:px-0',
              'snap-x snap-mandatory md:snap-none',
              '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
            )}
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
            }}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="listbox"
            aria-label={`${title} content rail`}
          >
            {displayItems.map((item, index) => (
              <motion.div
                key={item.id}
                data-rail-item
                initial={priority === 'high' ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: priority === 'high' ? 0 : index * 0.03, duration: 0.3 }}
                className={cn(
                  'snap-start',
                  focusedIndex === index && 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg'
                )}
                role="option"
                aria-selected={focusedIndex === index}
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

            {/* "See More" card at end */}
            {onSeeAll && hasMoreItems && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={onSeeAll}
                className={cn(
                  'snap-start shrink-0 flex flex-col items-center justify-center',
                  'rounded-lg border border-dashed border-border/50',
                  'bg-muted/30 hover:bg-muted/50 hover:border-border',
                  'transition-colors cursor-pointer',
                  itemSize === 'small' && 'w-[140px] md:w-[160px] h-[180px] md:h-[200px]',
                  itemSize === 'medium' && 'w-[180px] md:w-[220px] h-[220px] md:h-[280px]',
                  itemSize === 'large' && 'w-[240px] md:w-[300px] h-[160px] md:h-[200px]'
                )}
                aria-label={`See all ${title}`}
              >
                <ChevronRight className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium text-muted-foreground">See all</span>
                {totalItems && (
                  <span className="text-xs text-muted-foreground/70">
                    {totalItems} items
                  </span>
                )}
              </motion.button>
            )}
          </div>
        )}

        {/* Right fade gradient (desktop) */}
        {!isTouchDevice && canScrollRight && (
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        )}
      </div>
    </section>
  );
}

export default BrowseRail;
