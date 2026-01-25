/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SERVICE WORKER                                           │
 * │                                                                             │
 * │ Production-safe service worker for offline support.                        │
 * │ NEVER cache auth tokens or user data.                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

const CACHE_NAME = 'lucy-ai-v4';
const STATIC_CACHE_NAME = 'lucy-static-v4';

// Static assets to cache immediately on install
const STATIC_URLS = [
  '/',
  '/offline.html',
  '/favicon.png',
  '/icon-512.png',
  '/manifest.json'
];

// Routes that should have network-first strategy
const NETWORK_FIRST_ROUTES = [
  '/chat',
  '/auth',
  '/api/',
  '/supabase/'
];

// NEVER cache these patterns (security critical)
const NEVER_CACHE_PATTERNS = [
  /\/api\//,
  /supabase/,
  /\.supabase\.co/,
  /auth/,
  /token/,
  /session/,
  /realtime/
];

// Check if URL should never be cached
function shouldNeverCache(url) {
  return NEVER_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

// Check if request is for a navigation (page load)
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Check if request is for a static asset
function isStaticAsset(url) {
  return /\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/.test(url);
}

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_URLS);
      })
      .then(() => {
        console.log('[SW] Install complete');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Install failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME && name !== STATIC_CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activate complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension and other schemes
  if (!url.protocol.startsWith('http')) return;
  
  // NEVER cache sensitive URLs
  if (shouldNeverCache(url.href)) {
    return;
  }
  
  // Navigation requests - network first, fallback to offline page
  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }
  
  // Static assets - cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => {
          if (cached) return cached;
          
          return fetch(event.request)
            .then(response => {
              // Don't cache non-ok responses
              if (!response || response.status !== 200) {
                return response;
              }
              
              // Clone and cache
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
              
              return response;
            });
        })
    );
    return;
  }
  
  // Default - network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Don't cache non-ok responses or auth endpoints
        if (!response || response.status !== 200 || shouldNeverCache(url.href)) {
          return response;
        }
        
        // Clone and cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseToCache));
        
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Handle messages from app
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

