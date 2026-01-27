/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — PERFORMANCE UTILITIES                                    │
 * │                                                                             │
 * │ Edge caching, prefetching, and optimization utilities                      │
 * │                                                                             │
 * │ Lucy is fast.                                                              │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// =============================================================================
// CACHE MANAGEMENT
// =============================================================================

const CACHE_PREFIX = 'lucy-cache-';
const CACHE_VERSION = 'v1';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Get item from cache
 */
export function getCached<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    if (now - entry.timestamp > entry.ttl) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Set item in cache
 */
export function setCache<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (err) {
    console.warn('[Cache] Failed to set cache:', err);
  }
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Clear expired cache entries
 */
export function cleanExpiredCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    for (const key of keys) {
      if (key.startsWith(CACHE_PREFIX)) {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry = JSON.parse(cached);
          if (now - entry.timestamp > entry.ttl) {
            localStorage.removeItem(key);
          }
        }
      }
    }
  } catch {
    // Ignore errors
  }
}

// =============================================================================
// PREFETCHING
// =============================================================================

const prefetchedUrls = new Set<string>();

/**
 * Prefetch a route's code
 */
export function prefetchRoute(routePath: string): void {
  if (prefetchedUrls.has(routePath)) return;

  // Map routes to their chunk names
  const routeChunks: Record<string, () => Promise<unknown>> = {
    '/chat': () => import('@/pages/Chat'),
    '/studios': () => import('@/pages/Studios'),
    '/tools': () => import('@/pages/Tools'),
    '/arcade': () => import('@/arcade/pages/ArcadeHub'),
    '/listening': () => import('@/pages/ListeningModeV2'),
    '/media': () => import('@/pages/MediaV2'),
  };

  const loader = routeChunks[routePath];
  if (loader) {
    prefetchedUrls.add(routePath);
    // Use requestIdleCallback for non-blocking prefetch
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        loader().catch(() => {
          // Ignore prefetch errors
        });
      });
    } else {
      setTimeout(() => {
        loader().catch(() => {});
      }, 100);
    }
  }
}

/**
 * Prefetch multiple routes
 */
export function prefetchRoutes(routes: string[]): void {
  routes.forEach(prefetchRoute);
}

/**
 * Prefetch common routes after initial load
 */
export function prefetchCommonRoutes(): void {
  // Wait for initial load to complete
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      prefetchRoutes(['/chat', '/studios', '/tools', '/arcade']);
    });
  } else {
    setTimeout(() => {
      prefetchRoutes(['/chat', '/studios', '/tools', '/arcade']);
    }, 2000);
  }
}

// =============================================================================
// IMAGE OPTIMIZATION
// =============================================================================

/**
 * Create optimized image URL with sizing
 */
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  quality = 80
): string {
  // If it's already an optimized URL or a data URL, return as-is
  if (url.startsWith('data:') || url.includes('?w=')) {
    return url;
  }

  // For Supabase storage URLs
  if (url.includes('supabase.co/storage')) {
    const params = new URLSearchParams();
    if (width) params.set('width', width.toString());
    params.set('quality', quality.toString());
    return `${url}?${params.toString()}`;
  }

  return url;
}

/**
 * Preload an image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// =============================================================================
// DEBOUNCE & THROTTLE
// =============================================================================

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// =============================================================================
// INTERSECTION OBSERVER
// =============================================================================

/**
 * Create a lazy load observer
 */
export function createLazyObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, {
    rootMargin: '100px',
    threshold: 0.1,
    ...options,
  });
}

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

/**
 * Get Web Vitals metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  const metrics: PerformanceMetrics = {
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  };

  try {
    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
    }

    // Get paint timing
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
    if (fcp) {
      metrics.fcp = fcp.startTime;
    }
  } catch {
    // Ignore errors
  }

  return metrics;
}

/**
 * Log performance metrics
 */
export function logPerformanceMetrics(): void {
  const metrics = getPerformanceMetrics();
  console.log('[Performance]', metrics);
}

// =============================================================================
// MEMORY MANAGEMENT
// =============================================================================

/**
 * Check if memory is low
 */
export function isMemoryLow(): boolean {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usedRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    return usedRatio > 0.9;
  }
  return false;
}

/**
 * Suggest garbage collection (hint only)
 */
export function suggestGC(): void {
  // Clear caches if memory is low
  if (isMemoryLow()) {
    cleanExpiredCache();
    prefetchedUrls.clear();
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Clean expired cache on load
if (typeof window !== 'undefined') {
  cleanExpiredCache();
  
  // Prefetch common routes after load
  window.addEventListener('load', () => {
    setTimeout(prefetchCommonRoutes, 3000);
  });

  // Log performance metrics in development
  if (process.env.NODE_ENV === 'development') {
    window.addEventListener('load', () => {
      setTimeout(logPerformanceMetrics, 1000);
    });
  }
}

export default {
  getCached,
  setCache,
  clearCache,
  cleanExpiredCache,
  prefetchRoute,
  prefetchRoutes,
  prefetchCommonRoutes,
  getOptimizedImageUrl,
  preloadImage,
  debounce,
  throttle,
  createLazyObserver,
  getPerformanceMetrics,
  logPerformanceMetrics,
  isMemoryLow,
  suggestGC,
};
