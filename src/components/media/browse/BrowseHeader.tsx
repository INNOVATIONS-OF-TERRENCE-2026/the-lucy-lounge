/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — BROWSE HEADER                                            │
 * │                                                                             │
 * │ Netflix/Tubi-style sticky header with search, filters, and navigation      │
 * │ PREMIUM BROWSE EXPERIENCE                                                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  X,
  SlidersHorizontal,
  Film,
  Sparkles,
  Grid3X3,
  ListFilter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type SortOption = 'trending' | 'newest' | 'a-z' | 'recently-watched' | 'rating';
export type FilterType = 'all' | 'movie' | 'series' | 'clip';
export type ViewMode = 'rails' | 'grid';

export interface BrowseHeaderProps {
  onSearch: (query: string) => void;
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: FilterType) => void;
  onViewModeChange: (mode: ViewMode) => void;
  currentSort: SortOption;
  currentFilter: FilterType;
  currentView: ViewMode;
  isSearching?: boolean;
  searchQuery?: string;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest First' },
  { value: 'a-z', label: 'A-Z' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'recently-watched', label: 'Recently Watched' },
];

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All Content' },
  { value: 'movie', label: 'Movies' },
  { value: 'series', label: 'TV Series' },
  { value: 'clip', label: 'Clips & Shorts' },
];

const CATEGORIES = [
  { id: 'for-you', label: 'For You', icon: Sparkles },
  { id: 'trending', label: 'Trending', icon: null },
  { id: 'new', label: 'New', icon: null },
  { id: 'continue', label: 'Continue', icon: null },
  { id: 'genres', label: 'Genres', icon: null },
  { id: 'my-list', label: 'My List', icon: null },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function BrowseHeader({
  onSearch,
  onSortChange,
  onFilterChange,
  onViewModeChange,
  currentSort,
  currentFilter,
  currentView,
  isSearching = false,
  searchQuery = '',
  activeCategory = 'for-you',
  onCategoryChange,
  className,
}: BrowseHeaderProps) {
  const navigate = useNavigate();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localQuery);
  }, [localQuery, onSearch]);

  const handleClearSearch = useCallback(() => {
    setLocalQuery('');
    onSearch('');
    setIsSearchExpanded(false);
  }, [onSearch]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  }, [handleClearSearch]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50',
        'transition-all duration-300',
        className
      )}
    >
      {/* Main Header Row */}
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 h-16">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Logo/Title - Hidden when search is expanded on mobile */}
          <AnimatePresence mode="wait">
            {!isSearchExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 min-w-0"
              >
                <Film className="h-6 w-6 text-primary shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl font-bold truncate">Lucy Media</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Free movies & shows
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Field */}
          <div className={cn(
            'flex-1 flex justify-end',
            isSearchExpanded && 'justify-stretch'
          )}>
            <AnimatePresence mode="wait">
              {isSearchExpanded ? (
                <motion.form
                  key="search-expanded"
                  initial={{ opacity: 0, width: '40px' }}
                  animate={{ opacity: 1, width: '100%' }}
                  exit={{ opacity: 0, width: '40px' }}
                  className="flex items-center gap-2 w-full"
                  onSubmit={handleSearchSubmit}
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search movies, shows, genres..."
                      value={localQuery}
                      onChange={(e) => setLocalQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="pl-10 pr-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                      autoFocus
                      aria-label="Search media"
                    />
                    {localQuery && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={handleClearSearch}
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchExpanded(false)}
                  >
                    Cancel
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="search-collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  {/* Desktop Search */}
                  <form
                    onSubmit={handleSearchSubmit}
                    className="hidden md:flex items-center"
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search..."
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                        className="w-48 lg:w-64 pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                        aria-label="Search media"
                      />
                    </div>
                  </form>

                  {/* Mobile Search Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setIsSearchExpanded(true)}
                    aria-label="Open search"
                  >
                    <Search className="h-5 w-5" />
                  </Button>

                  {/* Sort Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hidden sm:flex" aria-label="Sort options">
                        <ListFilter className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {SORT_OPTIONS.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => onSortChange(option.value)}
                          className={cn(
                            currentSort === option.value && 'bg-primary/10 text-primary'
                          )}
                        >
                          {option.label}
                          {currentSort === option.value && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              Active
                            </Badge>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Filter Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Filter options">
                        <SlidersHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Filter By Type</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {FILTER_OPTIONS.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => onFilterChange(option.value)}
                          className={cn(
                            currentFilter === option.value && 'bg-primary/10 text-primary'
                          )}
                        >
                          {option.label}
                          {currentFilter === option.value && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              Active
                            </Badge>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* View Mode Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewModeChange(currentView === 'rails' ? 'grid' : 'rails')}
                    className="hidden lg:flex"
                    aria-label={`Switch to ${currentView === 'rails' ? 'grid' : 'rails'} view`}
                  >
                    <Grid3X3 className={cn(
                      'h-5 w-5 transition-colors',
                      currentView === 'grid' && 'text-primary'
                    )} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Category Navigation Row */}
      {onCategoryChange && (
        <nav className="border-t border-border/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2 -mx-4 px-4">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onCategoryChange(cat.id)}
                  className={cn(
                    'shrink-0 gap-1.5',
                    activeCategory === cat.id && 'bg-primary/15 text-primary hover:bg-primary/20'
                  )}
                >
                  {cat.icon && <cat.icon className="h-3.5 w-3.5" />}
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Search Loading Indicator */}
      {isSearching && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 animate-pulse" />
      )}
    </header>
  );
}

export default BrowseHeader;
