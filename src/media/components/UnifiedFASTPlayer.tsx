/**
 * UnifiedFASTPlayer - Universal FAST Provider Player Abstraction
 * ==============================================================================
 * Inline playback with official FAST iframe players
 * Mobile Safari compatible - NO new tabs, NO redirects
 * ==============================================================================
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX,
  ExternalLink,
  ArrowLeft,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type FASTProviderType = 
  | 'archive_org' 
  | 'youtube' 
  | 'vimeo' 
  | 'dailymotion'
  | 'tubi'
  | 'pluto_tv'
  | 'plex_free'
  | 'roku_channel'
  | 'freevee'
  | 'fast_metadata';

interface FASTPlayerProps {
  /** The FAST provider type */
  provider: FASTProviderType;
  /** The content ID on the provider */
  contentId: string;
  /** Content title for display */
  title: string;
  /** Optional poster/thumbnail URL */
  posterUrl?: string;
  /** Auto-play when ready */
  autoplay?: boolean;
  /** Show native controls */
  showControls?: boolean;
  /** Aspect ratio - default 16:9 */
  aspectRatio?: '16:9' | '4:3' | '21:9' | '1:1';
  /** Custom class names */
  className?: string;
  /** Callback when playback starts */
  onPlay?: () => void;
  /** Callback when playback pauses */
  onPause?: () => void;
  /** Callback when content ends */
  onEnded?: () => void;
  /** Callback for errors */
  onError?: (error: string) => void;
  /** Callback for progress tracking */
  onProgress?: (progress: { currentTime: number; duration: number }) => void;
}

// =============================================================================
// PROVIDER CONFIGURATIONS
// =============================================================================

interface ProviderConfig {
  name: string;
  supportsEmbed: boolean;
  embedUrlPattern?: string;
  deepLinkPattern: string;
  params?: Record<string, string>;
  allowAttributes?: string;
}

const PROVIDER_CONFIGS: Record<FASTProviderType, ProviderConfig> = {
  archive_org: {
    name: 'Internet Archive',
    supportsEmbed: true,
    embedUrlPattern: 'https://archive.org/embed/{id}',
    deepLinkPattern: 'https://archive.org/details/{id}',
    allowAttributes: 'autoplay; fullscreen',
  },
  youtube: {
    name: 'YouTube',
    supportsEmbed: true,
    embedUrlPattern: 'https://www.youtube.com/embed/{id}',
    deepLinkPattern: 'https://www.youtube.com/watch?v={id}',
    params: {
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
      playsinline: '1', // Critical for iOS
    },
    allowAttributes: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
  },
  vimeo: {
    name: 'Vimeo',
    supportsEmbed: true,
    embedUrlPattern: 'https://player.vimeo.com/video/{id}',
    deepLinkPattern: 'https://vimeo.com/{id}',
    params: {
      autoplay: '1',
      playsinline: '1',
    },
    allowAttributes: 'autoplay; fullscreen; picture-in-picture',
  },
  dailymotion: {
    name: 'Dailymotion',
    supportsEmbed: true,
    embedUrlPattern: 'https://www.dailymotion.com/embed/video/{id}',
    deepLinkPattern: 'https://www.dailymotion.com/video/{id}',
    params: {
      autoplay: '1',
    },
    allowAttributes: 'autoplay; fullscreen',
  },
  tubi: {
    name: 'Tubi',
    supportsEmbed: false,
    deepLinkPattern: 'https://tubitv.com/movies/{id}',
  },
  pluto_tv: {
    name: 'Pluto TV',
    supportsEmbed: false,
    deepLinkPattern: 'https://pluto.tv/on-demand/movies/{id}',
  },
  plex_free: {
    name: 'Plex',
    supportsEmbed: false,
    deepLinkPattern: 'https://watch.plex.tv/movie/{id}',
  },
  roku_channel: {
    name: 'The Roku Channel',
    supportsEmbed: false,
    deepLinkPattern: 'https://therokuchannel.roku.com/details/{id}',
  },
  freevee: {
    name: 'Amazon Freevee',
    supportsEmbed: false,
    deepLinkPattern: 'https://www.amazon.com/gp/video/detail/{id}',
  },
  fast_metadata: {
    name: 'FAST Content',
    supportsEmbed: false,
    deepLinkPattern: '',
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function buildEmbedUrl(provider: FASTProviderType, contentId: string, autoplay: boolean): string | null {
  const config = PROVIDER_CONFIGS[provider];
  if (!config.supportsEmbed || !config.embedUrlPattern) {
    return null;
  }

  let url = config.embedUrlPattern.replace('{id}', contentId);
  
  if (config.params) {
    const params = new URLSearchParams();
    Object.entries(config.params).forEach(([key, value]) => {
      // Override autoplay param based on prop
      if (key === 'autoplay') {
        params.set(key, autoplay ? '1' : '0');
      } else {
        params.set(key, value);
      }
    });
    url += `?${params.toString()}`;
  }

  return url;
}

function buildDeepLink(provider: FASTProviderType, contentId: string): string {
  const config = PROVIDER_CONFIGS[provider];
  return config.deepLinkPattern.replace('{id}', contentId);
}

function getAspectRatioPadding(ratio: string): string {
  switch (ratio) {
    case '4:3': return 'pb-[75%]';
    case '21:9': return 'pb-[42.86%]';
    case '1:1': return 'pb-[100%]';
    case '16:9':
    default: return 'pb-[56.25%]';
  }
}

// =============================================================================
// INLINE PLAYER COMPONENT (Embeddable providers)
// =============================================================================

interface InlinePlayerProps {
  embedUrl: string;
  title: string;
  posterUrl?: string;
  allowAttributes: string;
  aspectRatio: string;
  autoplay: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const InlinePlayer: React.FC<InlinePlayerProps> = ({
  embedUrl,
  title,
  posterUrl,
  allowAttributes,
  aspectRatio,
  autoplay,
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(autoplay);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handlePlayClick = useCallback(() => {
    setHasStarted(true);
  }, []);

  return (
    <div className={cn('relative w-full', getAspectRatioPadding(aspectRatio), 'bg-black rounded-lg overflow-hidden')}>
      {/* Poster overlay (before playback starts) */}
      <AnimatePresence>
        {!hasStarted && posterUrl && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors"
            >
              <div className="w-20 h-20 rounded-full bg-violet-600/90 flex items-center justify-center hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading spinner */}
      <AnimatePresence>
        {isLoading && hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/60"
          >
            <Loader2 className="w-12 h-12 text-violet-400 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Iframe Player */}
      {hasStarted && (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title}
          allow={allowAttributes}
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
          onLoad={handleIframeLoad}
          onError={() => onError?.()}
        />
      )}
    </div>
  );
};

// =============================================================================
// DEEP LINK PLAYER COMPONENT (Non-embeddable providers)
// =============================================================================

interface DeepLinkPlayerProps {
  provider: FASTProviderType;
  contentId: string;
  title: string;
  posterUrl?: string;
  aspectRatio: string;
  onPlay?: () => void;
}

const DeepLinkPlayer: React.FC<DeepLinkPlayerProps> = ({
  provider,
  contentId,
  title,
  posterUrl,
  aspectRatio,
  onPlay,
}) => {
  const config = PROVIDER_CONFIGS[provider];
  const deepLink = buildDeepLink(provider, contentId);
  const [showModal, setShowModal] = useState(false);

  const handleWatchClick = useCallback(() => {
    setShowModal(true);
    onPlay?.();
  }, [onPlay]);

  const handleOpenApp = useCallback(() => {
    // Open in new tab (user-initiated action)
    window.open(deepLink, '_blank', 'noopener,noreferrer');
    setShowModal(false);
  }, [deepLink]);

  return (
    <>
      {/* Main Player Card */}
      <div className={cn('relative w-full', getAspectRatioPadding(aspectRatio), 'bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-lg overflow-hidden')}>
        {/* Poster Background */}
        {posterUrl && (
          <div className="absolute inset-0">
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover opacity-30 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          {/* Provider Badge */}
          <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
            <span className="text-sm text-zinc-300">Available on</span>
            <span className="text-sm font-semibold text-white">{config.name}</span>
          </div>

          {/* Play Button */}
          <button
            onClick={handleWatchClick}
            className="group flex items-center gap-3 px-8 py-4 bg-violet-600 hover:bg-violet-500 rounded-full transition-all hover:scale-105 mb-4"
          >
            <Play className="w-6 h-6 text-white" />
            <span className="text-lg font-semibold text-white">Watch Now</span>
            <ExternalLink className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
          </button>

          {/* Notice */}
          <p className="text-xs text-zinc-400 max-w-sm">
            Opens in {config.name} app or website. Free with ads.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full bg-zinc-900 rounded-2xl p-6 border border-zinc-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Content */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-600/20 flex items-center justify-center">
                  <ExternalLink className="w-8 h-8 text-violet-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  Open in {config.name}?
                </h3>

                <p className="text-zinc-400 mb-6">
                  <strong className="text-white">{title}</strong> is available free on {config.name}. 
                  You'll be redirected to watch it there.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOpenApp}
                    className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-semibold"
                  >
                    Open {config.name}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// =============================================================================
// MAIN UNIFIED FAST PLAYER
// =============================================================================

export const UnifiedFASTPlayer: React.FC<FASTPlayerProps> = ({
  provider,
  contentId,
  title,
  posterUrl,
  autoplay = false,
  showControls = true,
  aspectRatio = '16:9',
  className,
  onPlay,
  onPause,
  onEnded,
  onError,
  onProgress,
}) => {
  const config = PROVIDER_CONFIGS[provider];
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build embed URL if supported
  const embedUrl = buildEmbedUrl(provider, contentId, autoplay);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle errors
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    onError?.(errorMessage);
  }, [onError]);

  // Error state
  if (error) {
    return (
      <div className={cn('relative w-full', getAspectRatioPadding(aspectRatio), 'bg-zinc-900 rounded-lg overflow-hidden', className)}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-zinc-300 mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative group',
        isFullscreen && 'fixed inset-0 z-50 bg-black',
        className
      )}
    >
      {/* Render appropriate player based on provider support */}
      {config.supportsEmbed && embedUrl ? (
        <InlinePlayer
          embedUrl={embedUrl}
          title={title}
          posterUrl={posterUrl}
          allowAttributes={config.allowAttributes || 'autoplay; fullscreen'}
          aspectRatio={aspectRatio}
          autoplay={autoplay}
          onLoad={onPlay}
          onError={() => handleError('Failed to load video')}
        />
      ) : (
        <DeepLinkPlayer
          provider={provider}
          contentId={contentId}
          title={title}
          posterUrl={posterUrl}
          aspectRatio={aspectRatio}
          onPlay={onPlay}
        />
      )}

      {/* Fullscreen toggle (visible on hover) */}
      {showControls && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-30"
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
};

// =============================================================================
// PLAYER CARD COMPONENT (For rail displays)
// =============================================================================

interface FASTPlayerCardProps {
  provider: FASTProviderType;
  contentId: string;
  title: string;
  description?: string;
  posterUrl?: string;
  year?: number;
  rating?: string;
  duration?: string;
  className?: string;
  onSelect?: () => void;
}

export const FASTPlayerCard: React.FC<FASTPlayerCardProps> = ({
  provider,
  contentId,
  title,
  description,
  posterUrl,
  year,
  rating,
  duration,
  className,
  onSelect,
}) => {
  const config = PROVIDER_CONFIGS[provider];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn(
        'relative flex-shrink-0 w-[200px] md:w-[240px] cursor-pointer group',
        className
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onSelect}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-12 h-12 text-zinc-600" />
          </div>
        )}

        {/* Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end p-4"
            >
              {/* Play Button */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-14 h-14 rounded-full bg-violet-600/90 flex items-center justify-center">
                  <Play className="w-7 h-7 text-white ml-1" />
                </div>
              </div>

              {/* Description */}
              {description && (
                <p className="text-xs text-zinc-300 line-clamp-2 mb-2">
                  {description}
                </p>
              )}

              {/* Provider Badge */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-white/20 rounded text-xs text-white">
                  {config.name}
                </span>
                {config.supportsEmbed && (
                  <span className="px-2 py-1 bg-violet-600/80 rounded text-xs text-white">
                    Inline Play
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Provider Badge (always visible) */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white backdrop-blur-sm">
          {config.name}
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium text-white truncate">{title}</h3>
        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
          {year && <span>{year}</span>}
          {rating && (
            <>
              <span>•</span>
              <span>{rating}</span>
            </>
          )}
          {duration && (
            <>
              <span>•</span>
              <span>{duration}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default UnifiedFASTPlayer;

export {
  PROVIDER_CONFIGS,
  buildEmbedUrl,
  buildDeepLink,
};
