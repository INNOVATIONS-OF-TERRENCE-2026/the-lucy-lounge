/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Chat Message Skeleton - Optimistic UI for instant perceived performance
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Skeleton } from "@/components/ui/skeleton";
import { LucyLogo } from "@/components/branding/LucyLogo";

interface ChatMessageSkeletonProps {
  variant?: 'user' | 'assistant' | 'thinking';
  compact?: boolean;
}

export function ChatMessageSkeleton({ 
  variant = 'assistant',
  compact = false 
}: ChatMessageSkeletonProps) {
  if (variant === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] md:max-w-[70%]">
          <Skeleton className="h-10 w-48 rounded-2xl bg-primary/20" />
        </div>
      </div>
    );
  }

  if (variant === 'thinking') {
    return (
      <div className="flex gap-3 mb-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
            <LucyLogo size="xs" />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary">Lucy</span>
            <span className="text-xs text-muted-foreground animate-pulse">thinking...</span>
          </div>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // Assistant skeleton (response loading)
  return (
    <div className="flex gap-3 mb-4">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/80 to-purple-600/80 flex items-center justify-center">
          <LucyLogo size="xs" />
        </div>
      </div>
      <div className={`flex-1 space-y-2 ${compact ? 'max-w-sm' : 'max-w-2xl'}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">Lucy</span>
        </div>
        <div className="space-y-2 bg-card/60 rounded-xl p-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          {!compact && (
            <>
              <Skeleton className="h-4 w-[75%]" />
              <Skeleton className="h-4 w-[85%]" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for the entire chat area when loading history
 */
export function ChatHistorySkeleton() {
  return (
    <div className="space-y-4 px-4 py-2">
      <ChatMessageSkeleton variant="user" />
      <ChatMessageSkeleton variant="assistant" />
      <ChatMessageSkeleton variant="user" />
      <ChatMessageSkeleton variant="assistant" compact />
    </div>
  );
}

/**
 * Inline thinking indicator
 */
export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 text-muted-foreground bg-card/60 backdrop-blur-sm px-5 py-3 rounded-xl w-fit shadow-[0_0_10px_rgba(168,85,247,0.1)] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm">Lucy is thinking...</span>
    </div>
  );
}

export default ChatMessageSkeleton;
