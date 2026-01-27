/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE LUCY LOUNGE - Genius Mode Toggle Component
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Beautiful toggle for Lucy's Genius Mode.
 * Shows "Lucy Genius Mode" - NEVER shows model names.
 * 
 * UI RULES:
 * - Toggle labeled "Lucy Genius Mode"
 * - Tooltip: "Enable deeper thinking for complex tasks"
 * - NEVER mention: GPT, Claude, Qwen, or any provider
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { memo } from 'react';
import { Sparkles, Brain, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useGeniusModeSafe } from '@/contexts/GeniusModeContext';
import { useGeniusMode } from '@/hooks/useGeniusMode';

interface GeniusModeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'prominent';
}

/**
 * Genius Mode Toggle Component
 * 
 * Can be used either with GeniusModeContext or standalone.
 * Falls back to local hook if context not available.
 */
export const GeniusModeToggle = memo(function GeniusModeToggle({
  className,
  showLabel = true,
  size = 'md',
  variant = 'default',
}: GeniusModeToggleProps) {
  // Try context first, fall back to local hook
  const contextState = useGeniusModeSafe();
  const localState = useGeniusMode();
  const { enabled, toggle } = contextState || localState;

  const sizeClasses = {
    sm: 'text-xs gap-1.5',
    md: 'text-sm gap-2',
    lg: 'text-base gap-3',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Minimal variant - just the toggle
  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center', className)}>
              <Switch
                checked={enabled}
                onCheckedChange={toggle}
                className={cn(
                  enabled && 'data-[state=checked]:bg-purple-600'
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Lucy Genius Mode - Enable deeper thinking</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Prominent variant - eye-catching design
  if (variant === 'prominent') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggle}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300',
                enabled
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white',
                className
              )}
            >
              {enabled ? (
                <Sparkles className={cn(iconSizes[size], 'animate-pulse')} />
              ) : (
                <Brain className={iconSizes[size]} />
              )}
              {showLabel && (
                <span className={cn('font-medium', sizeClasses[size])}>
                  {enabled ? 'Genius Mode' : 'Standard'}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="text-sm">
              <p className="font-medium">
                {enabled ? 'Lucy Genius Mode Active' : 'Enable Genius Mode'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {enabled
                  ? "Lucy is using enhanced reasoning for deeper, more thoughtful responses."
                  : "Enable for complex analysis, planning, and architecture discussions."}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default variant - clean toggle with label
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center',
              sizeClasses[size],
              className
            )}
          >
            {enabled ? (
              <Sparkles className={cn(iconSizes[size], 'text-purple-400 mr-1')} />
            ) : (
              <Zap className={cn(iconSizes[size], 'text-white/50 mr-1')} />
            )}
            
            {showLabel && (
              <Label
                htmlFor="genius-mode-toggle"
                className={cn(
                  'cursor-pointer select-none transition-colors',
                  enabled ? 'text-purple-300' : 'text-white/60'
                )}
              >
                Genius Mode
              </Label>
            )}
            
            <Switch
              id="genius-mode-toggle"
              checked={enabled}
              onCheckedChange={toggle}
              className={cn(
                'ml-2',
                enabled && 'data-[state=checked]:bg-purple-600'
              )}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="text-sm">
            <p className="font-medium">Lucy Genius Mode</p>
            <p className="text-xs text-muted-foreground mt-1">
              Enable deeper thinking for complex tasks, planning, and analysis.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

/**
 * Genius Mode Indicator - Shows status without toggle
 */
export const GeniusModeIndicator = memo(function GeniusModeIndicator({
  className,
}: {
  className?: string;
}) {
  const contextState = useGeniusModeSafe();
  const localState = useGeniusMode();
  const { enabled, thinkingText } = contextState || localState;

  if (!enabled) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1 rounded-full',
        'bg-purple-500/20 text-purple-300 text-xs',
        'animate-pulse',
        className
      )}
    >
      <Sparkles className="w-3 h-3" />
      <span>{thinkingText}</span>
    </div>
  );
});

export default GeniusModeToggle;
