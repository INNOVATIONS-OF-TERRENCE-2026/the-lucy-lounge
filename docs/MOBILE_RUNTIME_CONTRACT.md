# Mobile Runtime Contract

> **DO NOT VIOLATE**: This contract governs all mobile runtime behavior.
> Version: 1.0.0 | Last Updated: 2026-01-25

## Overview

The Lucy Lounge MUST work correctly on:
- iOS Safari (PRIMARY target)
- iOS Chrome (WebKit-based)
- Android Chrome
- Desktop Chrome/Edge/Safari/Firefox

iOS Safari is the **strictest** runtime. If it works on iOS Safari, it works everywhere.

---

## 🚫 FORBIDDEN PATTERNS

### 1. Module-Level Browser API Access

```typescript
// ❌ FORBIDDEN - Will crash on iOS Safari
const userAgent = navigator.userAgent;
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const stored = localStorage.getItem('key');

// ✅ CORRECT - Access in component/hook
function useUserAgent() {
  const [ua, setUa] = useState('');
  useEffect(() => {
    setUa(navigator.userAgent);
  }, []);
  return ua;
}
```

### 2. AudioContext Creation at Load

```typescript
// ❌ FORBIDDEN - iOS Safari will throw
const audioContext = new AudioContext();

// ✅ CORRECT - Create in user gesture handler
const handleClick = async () => {
  const ctx = new AudioContext();
  await ctx.resume();
};
```

### 3. Auto-playing Media

```typescript
// ❌ FORBIDDEN - Will fail silently or throw
useEffect(() => {
  videoRef.current?.play();
}, []);

// ✅ CORRECT - Play in user gesture handler
const handlePlay = async () => {
  await videoRef.current?.play();
};
```

### 4. getUserMedia Without Gesture

```typescript
// ❌ FORBIDDEN - Will be blocked
useEffect(() => {
  navigator.mediaDevices.getUserMedia({ audio: true });
}, []);

// ✅ CORRECT - Request in click handler
const handleMicClick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
};
```

### 5. Throwing at Import Time

```typescript
// ❌ FORBIDDEN - Bypasses error boundaries
const url = import.meta.env.VITE_API_URL;
if (!url) throw new Error('Missing URL'); // At module scope!

// ✅ CORRECT - Validate at runtime, React-catchable
function App() {
  const url = import.meta.env.VITE_API_URL;
  if (!url) throw new Error('Missing URL'); // Caught by ErrorBoundary
}
```

---

## ✅ REQUIRED PATTERNS

### 1. Safe Browser API Access

Always use utilities from `@/lib/safeBrowser`:

```typescript
import { isBrowser, safeLocalStorage, supportsWebAudio } from '@/lib/safeBrowser';

// Detection is safe
const hasAudio = supportsWebAudio();

// Storage access is wrapped
const value = safeLocalStorage()?.getItem('key') ?? 'default';
```

### 2. Gesture-Gated Initialization

Use the gesture gate system for all media:

```typescript
import { useUserGestureGate } from '@/hooks/useUserGestureGate';
import { useDeferredCapabilityInit } from '@/hooks/useDeferredCapabilityInit';

function MyComponent() {
  const { hasGesture, gestureToken } = useUserGestureGate();
  const { deferredInit } = useDeferredCapabilityInit();

  const handleEnable = async () => {
    await deferredInit(
      { key: 'audio-context' },
      async (token) => {
        const ctx = new AudioContext();
        await ctx.resume();
        return true;
      }
    );
  };
}
```

### 3. Deferred State Hydration

Never access storage during initial render:

```typescript
// ❌ WRONG
const [value, setValue] = useState(localStorage.getItem('key'));

// ✅ CORRECT
const [value, setValue] = useState('default');
useEffect(() => {
  const stored = safeLocalStorage()?.getItem('key');
  if (stored) setValue(stored);
}, []);
```

### 4. Error Boundary Wrapping

All risky features must be wrapped:

```typescript
<FeatureErrorBoundary feature="audio-player" silent>
  <AudioPlayer />
</FeatureErrorBoundary>
```

---

## Polyfill

- requestIdleCallback and cancelIdleCallback are polyfilled for iOS/legacy WebKit.
- Polyfill is loaded BEFORE React and all app code.

## Auth Resolution Guarantee

**CRITICAL: Auth MUST resolve within 3 seconds. NEVER hang indefinitely.**

The `useAuthResolver()` hook provides:
- Hard timeout of 3 seconds maximum wait
- If Supabase doesn't respond, forces resolution as unauthenticated
- `resolved` flag ALWAYS becomes `true` (guaranteed)
- `session` is either valid OR null (never undefined after resolution)

```typescript
// ✅ CORRECT - Use useAuthResolver for auth-gated pages
const { user, resolved, timedOut } = useAuthResolver();
if (!resolved) return <LoadingScreen />;
if (!user) return <LoggedOutView />;

// ❌ FORBIDDEN - Can hang forever if Supabase doesn't respond
const [loading, setLoading] = useState(true);
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setLoading(false); // May never be called!
  });
}, []);
```

## Defensive Practices

- All mobile APIs must be guarded.
- All scheduler logic must use safeRequestIdleCallback.
- All auth-gated pages must use useAuthResolver.
- No silent fallbacks or error suppression.

## Enforcement

- DEV-ONLY runtime assertion logs polyfill activation on iOS.
- DEV-ONLY warning if auth times out.
- Static code comments and assertions are present at all call sites.

## Non-Negotiable Rules

- DO NOT use requestIdleCallback directly. Use safeRequestIdleCallback ONLY.
- DO NOT use raw supabase.auth.getSession() for gating. Use useAuthResolver ONLY.
- DO NOT initialize media APIs before user interaction.
- DO NOT bypass RootErrorBoundary or SupabaseGuard.
- DO NOT add fallback secrets or silent error handling.
- DO NOT introduce mobile regressions.

---

## Boot Sequence

1. `initViewportFix()` - Fix mobile 100vh
2. `<RootErrorBoundary>` - Catch all errors
3. `<SupabaseGuard>` - Validate config
4. `<UserGestureGateProvider>` - Track gestures
5. `<SafeMediaGateProvider>` - Gate media
6. `<App />` - Application

---

## Verification Checklist

Before any merge, verify:

- [ ] iOS Safari first load (no console errors)
- [ ] iOS Safari audio plays after tap
- [ ] iOS Chrome first load
- [ ] Android Chrome first load
- [ ] Desktop Chrome first load
- [ ] Auth flow works on all platforms
- [ ] Auth resolves within 3 seconds (never hangs)
- [ ] No white screens anywhere
- [ ] RootErrorBoundary only shows for real errors

---

## If You Break This Contract

1. RootErrorBoundary will catch the error
2. User sees "Lucy needs a moment..." instead of white screen
3. But this is a FAILURE state - fix it!

**The goal is ZERO RootErrorBoundary activations on normal flows.**
