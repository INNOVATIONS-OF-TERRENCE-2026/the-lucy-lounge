// =============================================================================
// THE LUCY LOUNGE - Universal Embed Player
// =============================================================================
// Handles inline playback from multiple FAST providers:
// - YouTube (primary)
// - Internet Archive (public domain)
// - Vimeo (embeddable content)
// - Dailymotion (embeddable content)
// =============================================================================

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Play, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type FASTProviderType,
  getEmbedUrl,
  getDeepLinkUrl,
  supportsEmbed,
  FAST_PROVIDER_REGISTRY,
} from '../providers/FASTProviderAdapter';
import type { MediaNode, MediaType } from '../types';

// =============================================================================
// TYPES
// =============================================================================

export interface UniversalEmbedPlayerProps {
  /** Media node to play */
  mediaNode: MediaNode;
  /** Whether player is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Optional autoplay */
  autoplay?: boolean;
  /** Optional start time in seconds */
  startTime?: number;
  /** Show attribution badge */
  showAttribution?: boolean;
  /** Custom class name */
  className?: string;
}

interface EmbedSource {
  provider: FASTProviderType;
  contentId: string;
  embedUrl: string | null;
  deepLinkUrl: string;
  priority: number;
}

// =============================================================================
// EMBED URL EXTRACTION
// =============================================================================

/**
 * Extract embeddable sources from a MediaNode
 * Returns array of possible embed sources sorted by priority
 */
function extractEmbedSources(mediaNode: MediaNode): EmbedSource[] {
  const sources: EmbedSource[] = [];
  
  // Check YouTube ID
  if (mediaNode.youtube_id) {
    sources.push({
      provider: 'youtube',
      contentId: mediaNode.youtube_id,
      embedUrl: getEmbedUrl('youtube', mediaNode.youtube_id, { autoplay: true }),
      deepLinkUrl: getDeepLinkUrl('youtube', mediaNode.youtube_id),
      priority: 90,
    });
  }
  
  // Check canonical ID for provider info
  const canonicalParts = mediaNode.canonical_id?.split(':');
  if (canonicalParts?.length === 4 && canonicalParts[0] === 'lucy') {
    const provider = canonicalParts[2] as FASTProviderType;
    const contentId = canonicalParts[3];
    
    if (provider && contentId && supportsEmbed(provider)) {
      // Only add if not already in sources
      if (!sources.some(s => s.provider === provider && s.contentId === contentId)) {
        sources.push({
          provider,
          contentId,
          embedUrl: getEmbedUrl(provider, contentId, { autoplay: true }),
          deepLinkUrl: getDeepLinkUrl(provider, contentId, mediaNode.media_type),
          priority: FAST_PROVIDER_REGISTRY[provider]?.supportsEmbed ? 80 : 50,
        });
      }
    }
  }
  
  // Check for provider_content_id with provider_source
  if (mediaNode.provider_content_id && (mediaNode as ExtendedMediaNode).provider_source) {
    const provider = (mediaNode as ExtendedMediaNode).provider_source as FASTProviderType;
    if (supportsEmbed(provider)) {
      const contentId = mediaNode.provider_content_id;
      if (!sources.some(s => s.provider === provider && s.contentId === contentId)) {
        sources.push({
          provider,
          contentId,
          embedUrl: getEmbedUrl(provider, contentId, { autoplay: true }),
          deepLinkUrl: getDeepLinkUrl(provider, contentId, mediaNode.media_type),
          priority: 70,
        });
      }
    }
  }
  
  // Sort by priority (highest first)
  return sources.sort((a, b) => b.priority - a.priority);
}

// Extended type for provider_source
interface ExtendedMediaNode extends MediaNode {
  provider_source?: string;
  provider_content_id?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function UniversalEmbedPlayer({
  mediaNode,
  isOpen,
  onClose,
  autoplay = true,
  startTime,
  showAttribution = true,
  className,
}: UniversalEmbedPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  // Extract embed sources
  const sources = useMemo(() => extractEmbedSources(mediaNode), [mediaNode]);
  const currentSource = sources[currentSourceIndex];
  
  // Build embed URL with parameters
  const embedUrl = useMemo(() => {
    if (!currentSource?.embedUrl) return null;
    
    let url = currentSource.embedUrl;
    
    // Add start time if provided (YouTube format)
    if (startTime && currentSource.provider === 'youtube') {
      url += `&start=${Math.floor(startTime)}`;
    }
    
    // Add mute parameter
    if (isMuted) {
      if (currentSource.provider === 'youtube') {
        url += '&mute=1';
      } else if (currentSource.provider === 'vimeo') {
        url += '&muted=1';
      }
    }
    
    return url;
  }, [currentSource, startTime, isMuted]);
  
  // Handle iframe load error - try next source
  const handleIframeError = useCallback(() => {
    if (currentSourceIndex < sources.length - 1) {
      setCurrentSourceIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  }, [currentSourceIndex, sources.length]);
  
  // Open in external player
  const handleOpenExternal = useCallback(() => {
    if (currentSource?.deepLinkUrl) {
      window.open(currentSource.deepLinkUrl, '_blank', 'noopener,noreferrer');
    }
  }, [currentSource]);
  
  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // Handle close
  const handleClose = useCallback(() => {
    setCurrentSourceIndex(0);
    setHasError(false);
    onClose();
  }, [onClose]);
  
  // Get provider info for attribution
  const providerInfo = currentSource 
    ? FAST_PROVIDER_REGISTRY[currentSource.provider]
    : null;
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm',
            className
          )}
          onClick={handleClose}
        >
          {/* Player Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl mx-4 aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Close player"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                {/* Title */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">
                    {mediaNode.title}
                  </h3>
                  {mediaNode.release_year && (
                    <p className="text-gray-400 text-sm">
                      {mediaNode.release_year}
                    </p>
                  )}
                </div>
                
                {/* Control Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  {/* Mute Toggle */}
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  
                  {/* Open External */}
                  <button
                    onClick={handleOpenExternal}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label="Open in new tab"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Provider Attribution */}
              {showAttribution && providerInfo && (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>Provided by</span>
                  <a
                    href={providerInfo.termsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    {providerInfo.logoUrl && (
                      <img 
                        src={providerInfo.logoUrl} 
                        alt={providerInfo.name}
                        className="w-4 h-4 rounded"
                      />
                    )}
                    <span>{providerInfo.name}</span>
                  </a>
                </div>
              )}
            </div>
            
            {/* Embed Content */}
            {hasError || !embedUrl ? (
              /* Fallback - no embeddable source */
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
                <Play className="w-16 h-16 mb-4 text-gray-500" />
                <h4 className="text-xl font-semibold mb-2">
                  Unable to embed this content
                </h4>
                <p className="text-gray-400 mb-4 text-center max-w-md">
                  This content may not be available for inline playback.
                  Try watching on the original platform.
                </p>
                {currentSource?.deepLinkUrl && (
                  <button
                    onClick={handleOpenExternal}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Watch on {providerInfo?.name || 'Source'}
                  </button>
                )}
              </div>
            ) : (
              /* Iframe Embed */
              <iframe
                src={embedUrl}
                title={mediaNode.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onError={handleIframeError}
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// HOOK: useUniversalPlayer
// =============================================================================

export interface UseUniversalPlayerReturn {
  isOpen: boolean;
  currentMedia: MediaNode | null;
  play: (media: MediaNode) => void;
  close: () => void;
}

export function useUniversalPlayer(): UseUniversalPlayerReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<MediaNode | null>(null);
  
  const play = useCallback((media: MediaNode) => {
    setCurrentMedia(media);
    setIsOpen(true);
  }, []);
  
  const close = useCallback(() => {
    setIsOpen(false);
    // Delay clearing media to allow exit animation
    setTimeout(() => setCurrentMedia(null), 300);
  }, []);
  
  return { isOpen, currentMedia, play, close };
}

// =============================================================================
// THUMBNAIL COMPONENT
// =============================================================================

export interface MediaThumbnailProps {
  media: MediaNode;
  onClick?: () => void;
  showPlayButton?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  className?: string;
}

export function MediaThumbnail({
  media,
  onClick,
  showPlayButton = true,
  aspectRatio = '16:9',
  className,
}: MediaThumbnailProps) {
  const aspectClass = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  }[aspectRatio];
  
  // Get best thumbnail URL
  const thumbnailUrl = media.poster_url || media.thumbnail_url || media.backdrop_url;
  
  // Check if embeddable
  const isEmbeddable = extractEmbedSources(media).length > 0;
  
  return (
    <div
      className={cn(
        'relative group cursor-pointer overflow-hidden rounded-lg bg-gray-800',
        aspectClass,
        className
      )}
      onClick={onClick}
    >
      {/* Thumbnail Image */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={media.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-900">
          <span className="text-4xl">🎬</span>
        </div>
      )}
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
      
      {/* Play Button */}
      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className={cn(
            'p-4 rounded-full backdrop-blur-sm transition-transform group-hover:scale-110',
            isEmbeddable ? 'bg-purple-600/80' : 'bg-gray-600/80'
          )}>
            {isEmbeddable ? (
              <Play className="w-8 h-8 text-white" fill="white" />
            ) : (
              <ExternalLink className="w-8 h-8 text-white" />
            )}
          </div>
        </div>
      )}
      
      {/* Duration Badge */}
      {media.duration_seconds && (
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
          {formatDuration(media.duration_seconds)}
        </div>
      )}
      
      {/* Provider Badge */}
      {media.provider_content_id && (
        <div className="absolute top-2 left-2">
          <ProviderBadge canonicalId={media.canonical_id} />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function ProviderBadge({ canonicalId }: { canonicalId?: string }) {
  if (!canonicalId) return null;
  
  const parts = canonicalId.split(':');
  if (parts.length !== 4) return null;
  
  const provider = parts[2] as FASTProviderType;
  const info = FAST_PROVIDER_REGISTRY[provider];
  
  if (!info) return null;
  
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 bg-black/70 rounded text-xs text-white">
      {info.logoUrl && (
        <img src={info.logoUrl} alt={info.name} className="w-3 h-3 rounded" />
      )}
      <span>{info.name}</span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// =============================================================================
// EXPORTS
// =============================================================================

export { extractEmbedSources };
export type { EmbedSource };
