/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — QUICK CATEGORIES GRID                                    │
 * │                                                                             │
 * │ Netflix/Tubi-style quick access category tiles                             │
 * │ PREMIUM BROWSE EXPERIENCE                                                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { motion } from 'framer-motion';
import {
  Flame,
  Sparkles,
  Clock,
  Heart,
  Tv,
  Film,
  Music,
  Gamepad2,
  Globe,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface QuickCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  gradient: string;
  count?: number;
}

export interface QuickCategoriesGridProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategory?: string;
  className?: string;
}

// =============================================================================
// DEFAULT CATEGORIES
// =============================================================================

export const DEFAULT_QUICK_CATEGORIES: QuickCategory[] = [
  {
    id: 'trending',
    title: 'Trending Now',
    icon: Flame,
    gradient: 'from-orange-500 to-red-600',
  },
  {
    id: 'for-you',
    title: 'For You',
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'new-releases',
    title: 'New Releases',
    icon: Star,
    gradient: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'continue-watching',
    title: 'Continue Watching',
    icon: Clock,
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'my-list',
    title: 'My List',
    icon: Heart,
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'tv-shows',
    title: 'TV Shows',
    icon: Tv,
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    id: 'movies',
    title: 'Movies',
    icon: Film,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'free-content',
    title: 'Free Content',
    icon: Globe,
    gradient: 'from-teal-500 to-cyan-600',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function QuickCategoriesGrid({
  onCategorySelect,
  selectedCategory,
  className,
}: QuickCategoriesGridProps) {
  return (
    <div className={cn('px-4 md:px-0', className)}>
      <h2 className="text-lg md:text-xl font-semibold mb-4">Quick Browse</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {DEFAULT_QUICK_CATEGORIES.map((category, index) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;

          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCategorySelect(category.id)}
              className={cn(
                'relative overflow-hidden rounded-xl p-4',
                'flex flex-col items-start justify-between',
                'min-h-[100px] md:min-h-[120px]',
                'bg-gradient-to-br',
                category.gradient,
                'text-white shadow-lg',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-background',
                isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-background'
              )}
              aria-pressed={isSelected}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/20" />
                <div className="absolute -right-8 -top-8 w-16 h-16 rounded-full bg-white/10" />
              </div>

              {/* Icon */}
              <div className="relative z-10 p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <Icon className="h-5 w-5" />
              </div>

              {/* Title & Count */}
              <div className="relative z-10 mt-auto">
                <h3 className="font-semibold text-sm md:text-base leading-tight">
                  {category.title}
                </h3>
                {category.count !== undefined && (
                  <p className="text-xs opacity-80 mt-0.5">
                    {category.count} items
                  </p>
                )}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  layoutId="category-indicator"
                  className="absolute inset-0 border-2 border-white rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default QuickCategoriesGrid;
