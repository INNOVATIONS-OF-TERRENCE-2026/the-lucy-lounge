/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — UNIFIED LOADING STATES                                   │
 * │                                                                             │
 * │ Consistent loading UI across the platform                                  │
 * │ Beautiful, informative, and never jarring                                  │
 * │                                                                             │
 * │ Lucy waits with grace.                                                     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { ReactNode } from 'react';
import { Loader2, Sparkles, Wand2, Brain, Music, Image, Video, FileText, Code, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

type LoadingVariant = 
  | 'default' 
  | 'minimal' 
  | 'card' 
  | 'fullscreen' 
  | 'inline' 
  | 'skeleton';

type LoadingContext = 
  | 'general'
  | 'ai'
  | 'chat'
  | 'image'
  | 'video'
  | 'music'
  | 'voice'
  | 'pdf'
  | 'code'
  | 'web';

interface LoadingStateProps {
  variant?: LoadingVariant;
  context?: LoadingContext;
  message?: string;
  subMessage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  progress?: number;
}

// =============================================================================
// CONTEXT ICONS
// =============================================================================

const CONTEXT_ICONS: Record<LoadingContext, typeof Loader2> = {
  general: Loader2,
  ai: Brain,
  chat: Sparkles,
  image: Image,
  video: Video,
  music: Music,
  voice: Wand2,
  pdf: FileText,
  code: Code,
  web: Globe,
};

const CONTEXT_MESSAGES: Record<LoadingContext, string> = {
  general: 'Loading...',
  ai: 'Lucy is thinking...',
  chat: 'Generating response...',
  image: 'Creating your image...',
  video: 'Rendering video...',
  music: 'Composing music...',
  voice: 'Synthesizing voice...',
  pdf: 'Generating PDF...',
  code: 'Analyzing code...',
  web: 'Fetching content...',
};

const CONTEXT_COLORS: Record<LoadingContext, string> = {
  general: 'text-primary',
  ai: 'text-purple-500',
  chat: 'text-blue-500',
  image: 'text-pink-500',
  video: 'text-red-500',
  music: 'text-green-500',
  voice: 'text-amber-500',
  pdf: 'text-orange-500',
  code: 'text-cyan-500',
  web: 'text-indigo-500',
};

// =============================================================================
// SIZE CONFIGURATIONS
// =============================================================================

const ICON_SIZES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

const TEXT_SIZES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

// =============================================================================
// MAIN LOADING COMPONENT
// =============================================================================

export function LoadingState({
  variant = 'default',
  context = 'general',
  message,
  subMessage,
  className,
  size = 'md',
  showProgress = false,
  progress = 0,
}: LoadingStateProps) {
  const Icon = CONTEXT_ICONS[context];
  const defaultMessage = message || CONTEXT_MESSAGES[context];
  const iconColor = CONTEXT_COLORS[context];

  switch (variant) {
    case 'minimal':
      return (
        <div className={cn('flex items-center gap-2', className)}>
          <Icon className={cn(ICON_SIZES[size], iconColor, 'animate-spin')} />
          {message && <span className={cn(TEXT_SIZES[size], 'text-muted-foreground')}>{message}</span>}
        </div>
      );

    case 'inline':
      return (
        <span className={cn('inline-flex items-center gap-1.5', className)}>
          <Icon className={cn(ICON_SIZES.sm, iconColor, 'animate-spin')} />
          <span className="text-sm text-muted-foreground">{defaultMessage}</span>
        </span>
      );

    case 'card':
      return (
        <Card className={cn('border-border/50', className)}>
          <CardContent className="py-8 text-center">
            <div className={cn(
              'mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4',
              `bg-${iconColor.replace('text-', '')}/10`
            )}>
              <Icon className={cn('w-8 h-8', iconColor, 'animate-spin')} />
            </div>
            <p className={cn(TEXT_SIZES[size], 'font-medium')}>{defaultMessage}</p>
            {subMessage && (
              <p className="text-sm text-muted-foreground mt-1">{subMessage}</p>
            )}
            {showProgress && (
              <div className="mt-4 w-48 mx-auto">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn('h-full transition-all duration-300', iconColor.replace('text-', 'bg-'))}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
              </div>
            )}
          </CardContent>
        </Card>
      );

    case 'fullscreen':
      return (
        <div className={cn(
          'fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50',
          className
        )}>
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <Icon className={cn('w-16 h-16 mx-auto', iconColor, 'opacity-20')} />
              </div>
              <Icon className={cn('w-16 h-16 mx-auto relative', iconColor, 'animate-spin')} />
            </div>
            <p className="text-xl font-medium mt-6">{defaultMessage}</p>
            {subMessage && (
              <p className="text-muted-foreground mt-2">{subMessage}</p>
            )}
          </div>
        </div>
      );

    case 'skeleton':
      return (
        <div className={cn('space-y-3', className)}>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      );

    default:
      return (
        <div className={cn('flex flex-col items-center justify-center py-8', className)}>
          <Icon className={cn(ICON_SIZES[size], iconColor, 'animate-spin')} />
          <p className={cn(TEXT_SIZES[size], 'text-muted-foreground mt-3')}>{defaultMessage}</p>
          {subMessage && (
            <p className="text-sm text-muted-foreground mt-1">{subMessage}</p>
          )}
        </div>
      );
  }
}

// =============================================================================
// SPECIALIZED LOADING COMPONENTS
// =============================================================================

export function AIThinking({ message }: { message?: string }) {
  return (
    <LoadingState 
      context="ai" 
      message={message || "Lucy is thinking..."} 
      variant="inline"
    />
  );
}

export function ImageGenerating({ progress }: { progress?: number }) {
  return (
    <LoadingState 
      context="image" 
      variant="card"
      showProgress={progress !== undefined}
      progress={progress}
      subMessage="This may take a moment..."
    />
  );
}

export function VideoRendering({ progress }: { progress?: number }) {
  return (
    <LoadingState 
      context="video" 
      variant="card"
      showProgress={progress !== undefined}
      progress={progress}
      subMessage="Video generation takes longer..."
    />
  );
}

export function MusicComposing({ progress }: { progress?: number }) {
  return (
    <LoadingState 
      context="music" 
      variant="card"
      showProgress={progress !== undefined}
      progress={progress}
    />
  );
}

export function PageLoading() {
  return (
    <LoadingState 
      variant="fullscreen" 
      context="general"
      message="Loading Lucy..."
    />
  );
}

export function ContentSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="h-4" 
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// RETRY WRAPPER
// =============================================================================

interface RetryLoadingProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  children: ReactNode;
  context?: LoadingContext;
}

export function RetryLoading({ loading, error, onRetry, children, context = 'general' }: RetryLoadingProps) {
  if (loading) {
    return <LoadingState context={context} variant="card" />;
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-8 text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button 
            onClick={onRetry}
            className="text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

export default LoadingState;
