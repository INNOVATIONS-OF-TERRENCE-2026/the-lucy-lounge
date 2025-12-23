import { memo } from 'react';
import { cn } from '@/lib/utils';

interface PageSkeletonProps {
  variant?: 'default' | 'chat' | 'media' | 'lounge';
  className?: string;
}

const SkeletonPulse = memo(function SkeletonPulse({ 
  className 
}: { 
  className?: string 
}) {
  return (
    <div 
      className={cn(
        "animate-pulse rounded-lg bg-muted/50",
        className
      )} 
    />
  );
});

const DefaultSkeleton = memo(function DefaultSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-10 w-32" />
        <div className="flex gap-4">
          <SkeletonPulse className="h-10 w-24" />
          <SkeletonPulse className="h-10 w-24" />
        </div>
      </div>
      
      {/* Hero */}
      <div className="space-y-4 py-12">
        <SkeletonPulse className="h-12 w-3/4 mx-auto" />
        <SkeletonPulse className="h-6 w-1/2 mx-auto" />
        <SkeletonPulse className="h-12 w-40 mx-auto mt-6" />
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonPulse key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
});

const ChatSkeleton = memo(function ChatSkeleton() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-border p-4 space-y-4 hidden md:block">
        <SkeletonPulse className="h-10 w-full" />
        <SkeletonPulse className="h-10 w-full" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonPulse key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col p-4">
        {/* Messages */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-end">
            <SkeletonPulse className="h-16 w-2/3 rounded-2xl" />
          </div>
          <div className="flex justify-start">
            <SkeletonPulse className="h-24 w-3/4 rounded-2xl" />
          </div>
          <div className="flex justify-end">
            <SkeletonPulse className="h-12 w-1/2 rounded-2xl" />
          </div>
        </div>
        
        {/* Input */}
        <div className="mt-4">
          <SkeletonPulse className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
});

const MediaSkeleton = memo(function MediaSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SkeletonPulse className="h-10 w-32" />
        <SkeletonPulse className="h-10 flex-1 max-w-md" />
      </div>
      
      {/* Featured */}
      <SkeletonPulse className="h-64 w-full rounded-2xl" />
      
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonPulse className="aspect-video rounded-lg" />
            <SkeletonPulse className="h-4 w-3/4" />
            <SkeletonPulse className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
});

const LoungeSkeleton = memo(function LoungeSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        {/* Avatar */}
        <SkeletonPulse className="h-32 w-32 rounded-full mx-auto" />
        
        {/* Title */}
        <SkeletonPulse className="h-10 w-48 mx-auto" />
        <SkeletonPulse className="h-5 w-64 mx-auto" />
        
        {/* Controls */}
        <div className="flex justify-center gap-4 mt-8">
          <SkeletonPulse className="h-12 w-12 rounded-full" />
          <SkeletonPulse className="h-12 w-12 rounded-full" />
          <SkeletonPulse className="h-12 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
});

export const PageSkeleton = memo(function PageSkeleton({ 
  variant = 'default',
  className 
}: PageSkeletonProps) {
  const skeletons = {
    default: DefaultSkeleton,
    chat: ChatSkeleton,
    media: MediaSkeleton,
    lounge: LoungeSkeleton,
  };

  const SkeletonComponent = skeletons[variant];

  return (
    <div className={cn("min-h-screen", className)}>
      <SkeletonComponent />
    </div>
  );
});
