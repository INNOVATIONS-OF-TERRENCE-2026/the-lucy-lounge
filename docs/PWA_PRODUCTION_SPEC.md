# PWA Production Spec

> **BINDING**: PWA behavior must match this spec.
> Version: 1.0.0 | Last Updated: 2026-01-25

## Overview

Lucy AI is a Progressive Web App (PWA) that MUST:
- Install correctly on iOS and Android
- Work offline for basic functionality
- Never show blank screens
- Handle network failures gracefully

---

## Manifest Requirements

### Required Fields

```json
{
  "name": "Lucy AI - Beyond Intelligence",
  "short_name": "Lucy AI",
  "description": "Your advanced AI assistant",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a0f2e",
  "theme_color": "#8b5cf6",
  "orientation": "portrait-primary"
}
```

### Icons

| Size | Purpose | Required |
|------|---------|----------|
| 192x192 | Any | ✅ |
| 512x512 | Any | ✅ |
| 512x512 | Maskable | ✅ |

### iOS Specific

Add to `<head>`:

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Lucy AI">
<link rel="apple-touch-icon" href="/icon-512.png">
```

---

## Service Worker Strategy

### Cache Strategy

| Resource Type | Strategy | Reason |
|---------------|----------|--------|
| Static assets (JS/CSS) | Cache First | Immutable |
| HTML pages | Network First | Fresh content |
| API calls | Network Only | Dynamic data |
| Images | Cache First | Large, stable |
| Auth tokens | NEVER CACHE | Security |

### Cached Routes

```javascript
const urlsToCache = [
  '/',
  '/chat',
  '/auth',
  '/offline.html',
  '/favicon.png',
  '/icon-512.png'
];
```

### CRITICAL: Never Cache

- Auth tokens (JWT, session)
- User credentials
- API responses with personal data
- Supabase realtime connections

---

## Offline Behavior

### Fully Functional Offline

| Feature | Offline Support |
|---------|-----------------|
| App shell render | ✅ |
| View past chats (cached) | ✅ |
| Compose messages (queued) | ✅ |
| UI navigation | ✅ |
| Theme switching | ✅ |

### Requires Network

| Feature | Behavior When Offline |
|---------|----------------------|
| Send chat message | Queue, retry on reconnect |
| AI responses | Show "Offline" indicator |
| Login/signup | Show "Network required" |
| Realtime features | Graceful degradation |

### Offline UI Requirements

1. **OfflineBanner** - Shows when offline
2. **Message queue indicator** - Shows pending messages
3. **Retry mechanism** - Auto-retry with backoff
4. **Clear offline state** - On reconnect

---

## iOS PWA Specifics

### Safe Area Handling

```css
/* Support notch/dynamic island */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

### Status Bar

```css
/* Transparent status bar */
@supports (padding: env(safe-area-inset-top)) {
  body {
    padding-top: env(safe-area-inset-top);
  }
}
```

### Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

### Rubber-band Prevention

```css
/* Prevent overscroll on iOS */
html, body {
  overscroll-behavior: none;
}
```

---

## Install Prompt UX

### Standard Browsers (Chrome, Edge)

- Listen for `beforeinstallprompt` event
- Show custom install button
- Call `prompt()` on user click

### iOS Safari

iOS Safari does NOT fire `beforeinstallprompt`. Instead:

1. Detect iOS Safari
2. Show custom "Add to Home Screen" instructions
3. Include visual guide (Share → Add to Home Screen)

```typescript
function isIOSSafariStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (navigator as any).standalone === true;
}

function shouldShowIOSInstallHint() {
  return isIOSSafari() && !isIOSSafariStandalone();
}
```

---

## Network Status Handling

### useNetworkStatus Hook

```typescript
const { isOnline, isSlowConnection, connectionType } = useNetworkStatus();
```

### Connection Quality

| Type | Behavior |
|------|----------|
| `4g` | Full features |
| `3g` | Reduce media quality |
| `2g` | Text only mode |
| `slow-2g` | Offline mode |
| `offline` | Full offline mode |

---

## Testing Checklist

### iOS Safari PWA

- [ ] Install from Safari (Add to Home Screen)
- [ ] Open from home screen (standalone mode)
- [ ] Status bar renders correctly
- [ ] Safe areas respected
- [ ] Audio works after tap
- [ ] Offline banner shows when offline
- [ ] App doesn't crash on low memory

### Android Chrome PWA

- [ ] Install prompt appears
- [ ] Install via prompt works
- [ ] Open from app drawer
- [ ] Push notifications (if enabled)
- [ ] Background sync (if needed)

### Desktop PWA

- [ ] Install from browser
- [ ] Window controls work
- [ ] Keyboard shortcuts work
- [ ] Multi-window support

---

## Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| First Contentful Paint | < 1.5s | ✅ |
| Time to Interactive | < 3s | ✅ |
| Largest Contentful Paint | < 2.5s | ✅ |
| Cumulative Layout Shift | < 0.1 | ✅ |
| Service Worker registration | < 100ms | |

---

## Security Requirements

1. **HTTPS only** - Required for service workers
2. **No credential caching** - Auth tokens in memory only
3. **Clear on logout** - Wipe cached user data
4. **CSP headers** - Content Security Policy enforced

---

## Updates

### App Update Flow

1. Service worker checks for updates
2. New SW installs in background
3. On next visit, show "Update available"
4. User clicks to activate new version

### Force Update (Emergency)

```javascript
// In sw.js - force skip waiting
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
```
