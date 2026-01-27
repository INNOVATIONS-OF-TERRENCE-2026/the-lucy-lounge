/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SEE ALL MODAL                                            │
 * │                                                                             │
 * │ Netflix/Tubi-style full-screen modal for browsing all items in a category  │
 * │ PREMIUM BROWSE EXPERIENCE                                                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, SlidersHorizontal, Grid3X3, LayoutList, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaCard } from '../MediaCard';
import { cn } from '@/lib/utils';
import type { MediaNode } from '@/media/types';

// =============================================================================
// TYPES
// =============================================================================

export interface SeeAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  items: MediaNode[];
  totalCount?: number;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onItemPlay?: (node: MediaNode) => void;
  onItemFavorite?: (node: MediaNode) => void;
  onItemWatchlist?: (node: MediaNode) => void;
  favoriteIds?: Set<string>;
  watchlistIds?: Set<string>;
  progressMap?: Map<string, number>;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'default' | 'title' | 'year' | 'rating';

// =============================================================================
// COMPONENT
// =============================================================================

export function SeeAllModal({
  isOpen,
  onClose,
  title,
  subtitle,
  items,
  totalCount,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onItemPlay,
  onItemFavorite,
  onItemWatchlist,
  favoriteIds = new Set(),
  watchlistIds = new Set(),
  progressMap = new Map(),
}: SeeAllModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSortBy('default');
    }
  }, [isOpen]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.original_title?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'year':
        result.sort((a, b) => (b.release_year || 0) - (a.release_year || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      default:
        // Keep original order
        break;
    }

    return result;
  }, [items, searchQuery, sortBy]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold truncate">
                {title}
              </DialogTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
              {totalCount !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredItems.length} of {totalCount} items
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search in this category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[140px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="year">Newest First</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
                aria-label="List view"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && filteredItems.length === 0 ? (
            /* Loading State */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No results found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? `No items match "${searchQuery}"`
                  : 'No items in this category'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-4"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            /* Items Grid/List */
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                    : 'space-y-3'
                )}
              >
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.5) }}
                  >
                    {viewMode === 'grid' ? (
                      <MediaCard
                        node={item}
                        size="medium"
                        showProgress={progressMap.has(item.id)}
                        progress={progressMap.get(item.id) || 0}
                        isFavorite={favoriteIds.has(item.id)}
                        isInWatchlist={watchlistIds.has(item.id)}
                        onPlay={onItemPlay ? () => onItemPlay(item) : undefined}
                        onToggleFavorite={onItemFavorite ? () => onItemFavorite(item) : undefined}
                        onToggleWatchlist={onItemWatchlist ? () => onItemWatchlist(item) : undefined}
                      />
                    ) : (
                      /* List View Item */
                      <div
                        className="flex gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => onItemPlay?.(item)}
                      >
                        <div className="w-[100px] aspect-[2/3] rounded-md overflow-hidden bg-muted shrink-0">
                          {item.poster_url ? (
                            <img
                              src={item.poster_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background flex items-center justify-center text-2xl">
                              🎬
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <h4 className="font-semibold truncate">{item.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            {item.release_year && <span>{item.release_year}</span>}
                            {item.duration_seconds && (
                              <span>
                                {Math.floor(item.duration_seconds / 60)}m
                              </span>
                            )}
                            {item.average_rating && (
                              <span>⭐ {item.average_rating.toFixed(1)}</span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Load More */}
          {hasMore && onLoadMore && !isLoading && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}

          {/* Loading indicator for pagination */}
          {isLoading && filteredItems.length > 0 && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SeeAllModal;
