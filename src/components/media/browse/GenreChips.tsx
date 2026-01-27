/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — GENRE CHIPS                                              │
 * │                                                                             │
 * │ Netflix/Tubi-style horizontal scrolling genre/mood filter chips            │
 * │ PREMIUM BROWSE EXPERIENCE                                                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface GenreChip {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  count?: number;
}

export interface GenreChipsProps {
  genres: GenreChip[];
  selectedGenres: string[];
  onGenreToggle: (genreId: string) => void;
  onClearAll?: () => void;
  multiSelect?: boolean;
  className?: string;
}

// =============================================================================
// DEFAULT GENRES
// =============================================================================

export const DEFAULT_GENRES: GenreChip[] = [
  { id: 'all', name: 'All', icon: '🎬' },
  { id: 'action', name: 'Action', icon: '💥', color: 'from-red-500/20 to-orange-500/20' },
  { id: 'comedy', name: 'Comedy', icon: '😂', color: 'from-yellow-500/20 to-amber-500/20' },
  { id: 'drama', name: 'Drama', icon: '🎭', color: 'from-purple-500/20 to-pink-500/20' },
  { id: 'horror', name: 'Horror', icon: '👻', color: 'from-gray-500/20 to-slate-500/20' },
  { id: 'sci-fi', name: 'Sci-Fi', icon: '🚀', color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'romance', name: 'Romance', icon: '💕', color: 'from-pink-500/20 to-rose-500/20' },
  { id: 'thriller', name: 'Thriller', icon: '🔪', color: 'from-slate-500/20 to-zinc-500/20' },
  { id: 'documentary', name: 'Documentary', icon: '📹', color: 'from-green-500/20 to-emerald-500/20' },
  { id: 'animation', name: 'Animation', icon: '🎨', color: 'from-violet-500/20 to-purple-500/20' },
  { id: 'kids', name: 'Kids', icon: '🧸', color: 'from-sky-500/20 to-blue-500/20' },
  { id: 'music', name: 'Music', icon: '🎵', color: 'from-fuchsia-500/20 to-pink-500/20' },
  { id: 'classic', name: 'Classic', icon: '🎞️', color: 'from-amber-500/20 to-yellow-500/20' },
  { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦', color: 'from-teal-500/20 to-cyan-500/20' },
  { id: 'mystery', name: 'Mystery', icon: '🔍', color: 'from-indigo-500/20 to-violet-500/20' },
  { id: 'western', name: 'Western', icon: '🤠', color: 'from-orange-500/20 to-amber-500/20' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function GenreChips({
  genres = DEFAULT_GENRES,
  selectedGenres,
  onGenreToggle,
  onClearAll,
  multiSelect = false,
  className,
}: GenreChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scrollLeft = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: -200, behavior: 'smooth' });
  }, []);

  const scrollRight = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: 200, behavior: 'smooth' });
  }, []);

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

  const handleGenreClick = useCallback((genreId: string) => {
    if (genreId === 'all') {
      onClearAll?.();
      return;
    }
    onGenreToggle(genreId);
  }, [onGenreToggle, onClearAll]);

  const isSelected = (genreId: string) => {
    if (genreId === 'all') {
      return selectedGenres.length === 0;
    }
    return selectedGenres.includes(genreId);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center z-10">
          <div className="bg-gradient-to-r from-background via-background/80 to-transparent pr-4 h-full flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollLeft}
              className="h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-lg"
              aria-label="Scroll genres left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-2 overflow-x-auto scrollbar-hide',
          'px-4 py-2',
          'snap-x snap-mandatory md:snap-none',
          '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
        )}
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
        role="listbox"
        aria-label="Genre filter"
        aria-multiselectable={multiSelect}
      >
        {genres.map((genre, index) => {
          const selected = isSelected(genre.id);
          return (
            <motion.button
              key={genre.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => handleGenreClick(genre.id)}
              className={cn(
                'snap-start shrink-0',
                'flex items-center gap-2 px-4 py-2 rounded-full',
                'text-sm font-medium whitespace-nowrap',
                'border transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                selected
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                  : cn(
                      'bg-muted/50 text-foreground border-border/50',
                      'hover:bg-muted hover:border-border',
                      genre.color && `bg-gradient-to-r ${genre.color}`
                    )
              )}
              role="option"
              aria-selected={selected}
            >
              {genre.icon && <span className="text-base">{genre.icon}</span>}
              <span>{genre.name}</span>
              {genre.count !== undefined && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  selected ? 'bg-primary-foreground/20' : 'bg-foreground/10'
                )}>
                  {genre.count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Right Scroll Button */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center z-10">
          <div className="bg-gradient-to-l from-background via-background/80 to-transparent pl-4 h-full flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollRight}
              className="h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-lg"
              aria-label="Scroll genres right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Clear All Button (if multiSelect and has selections) */}
      {multiSelect && selectedGenres.length > 0 && onClearAll && (
        <div className="flex justify-center mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all filters ({selectedGenres.length})
          </Button>
        </div>
      )}
    </div>
  );
}

export default GenreChips;
