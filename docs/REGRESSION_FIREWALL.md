# REGRESSION FIREWALL

> **This document defines the permanent regression firewall for The Lucy Lounge.**
> **Violations of these rules will break mobile Safari and cause white screens.**

---

## 🚫 FORBIDDEN PATTERNS

These patterns are **PERMANENTLY BANNED** from the codebase:

### 1. Module-Scope Browser APIs

```typescript
// ❌ FORBIDDEN - Crashes SSR and Safari
const theme = localStorage.getItem('theme');
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const ctx = new AudioContext();

// ✅ REQUIRED - Deferred initialization
const [theme, setTheme] = useState('system');
useEffect(() => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme');
    if (stored) setTheme(stored);
  }
}, []);
```

### 2. Unguarded Media Initialization

```typescript
// ❌ FORBIDDEN - Crashes iOS Safari
const audioContext = new AudioContext();
navigator.mediaDevices.getUserMedia({ audio: true });
videoElement.play();

// ✅ REQUIRED - Gesture-gated
const { hasGesture, gestureToken } = useUserGestureGate();

const playAudio = async () => {
  if (!hasGesture) return;
  const ctx = await audioEngineAdapter.initializeAudio(gestureToken);
  // Now safe to use
};
```

### 3. Direct localStorage Access

```typescript
// ❌ FORBIDDEN - Throws in iOS private browsing
localStorage.setItem('key', 'value');

// ✅ REQUIRED - Use safe wrappers
import { getStorageItem, setStorageItem } from '@/lib/safeBrowser';
setStorageItem('key', 'value'); // Never throws
```

### 4. Synchronous Heavy Operations on Mount

```typescript
// ❌ FORBIDDEN - Blocks UI, causes white screen
useEffect(() => {
  const data = processLargeDataset(); // Blocking
  setState(data);
}, []);

// ✅ REQUIRED - Defer with requestIdleCallback or web worker
useEffect(() => {
  requestIdleCallback(() => {
    const data = processLargeDataset();
    setState(data);
  });
}, []);
```

### 5. Uncaught Promise Rejections

```typescript
// ❌ FORBIDDEN - Crashes silently
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}

// ✅ REQUIRED - Always catch errors
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Fetch failed');
    return response.json();
  } catch (error) {
    console.error('[fetchData]', error);
    return null; // Graceful fallback
  }
}
```

---

## ✅ REQUIRED PATTERNS

### 1. Safe Browser Detection

```typescript
import { isBrowser } from '@/guards/MobileRuntimeGuard';

// Always check before browser APIs
if (isBrowser()) {
  // Safe to use window, document, navigator
}
```

### 2. Gesture Gate for Media

```typescript
import { useUserGestureGate } from '@/hooks/useUserGestureGate';
import { audioEngineAdapter } from '@/media/AudioEngineAdapter';

function AudioPlayer() {
  const { hasGesture, gestureToken, captureGesture } = useUserGestureGate();
  
  const handlePlay = async () => {
    captureGesture(); // Mark gesture captured
    
    if (!gestureToken) {
      console.warn('No gesture token - cannot play');
      return;
    }
    
    await audioEngineAdapter.initializeAudio(gestureToken);
    // Now safe to play
  };
  
  return <button onClick={handlePlay}>Play</button>;
}
```

### 3. Error Boundaries Everywhere

```typescript
// App.tsx MUST have RootErrorBoundary
<RootErrorBoundary>
  <App />
</RootErrorBoundary>
```

### 4. Offline-Safe Defaults

```typescript
// Default to safe values, hydrate in useEffect
const [isOnline, setIsOnline] = useState(true); // Optimistic default

useEffect(() => {
  if (isBrowser()) {
    setIsOnline(navigator.onLine);
  }
}, []);
```

---

## 🔒 RUNTIME GUARDS

The following guards MUST be used:

### MobileRuntimeGuard

```typescript
import { 
  guardMediaAccess,
  guardStorageAccess,
  assertBrowser,
} from '@/guards/MobileRuntimeGuard';

// Before any media operation
const result = guardMediaAccess({
  type: 'audio',
  hasGestureToken: !!gestureToken,
  isInitialRender: false,
});

if (!result.allowed) {
  console.warn('Media blocked:', result.reason);
  return;
}
```

### EnvironmentGuard

```typescript
import {
  isFeatureEnabled,
  isDevelopment,
} from '@/guards/EnvironmentGuard';

// Check feature flags
if (isFeatureEnabled('enableVoice')) {
  // Voice features enabled
}

// Debug only
if (isDevelopment()) {
  console.log('Debug info');
}
```

---

## 🚨 CI/CD CHECKS (RECOMMENDED)

### Pre-commit Hook

```bash
#!/bin/bash

# Check for forbidden patterns
FORBIDDEN_PATTERNS=(
  "new AudioContext()"
  "new webkitAudioContext()"
  "navigator.mediaDevices.getUserMedia"
  "window.matchMedia"
  "localStorage.getItem"
  "localStorage.setItem"
)

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  if grep -r "$pattern" src/ --include="*.ts" --include="*.tsx" | grep -v "// @safe" | grep -v "safeBrowser"; then
    echo "❌ FORBIDDEN PATTERN DETECTED: $pattern"
    echo "Use gesture-gated adapters or safe wrappers instead."
    exit 1
  fi
done

echo "✅ No forbidden patterns detected"
```

### TypeScript Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

## 📋 BOOT SEQUENCE VALIDATION

The app MUST pass this boot sequence:

1. **SSR Safe** - No browser APIs at module scope
2. **DOM Ready** - Document loaded before hydration
3. **Storage Available** - With fallback to memory
4. **Network Detected** - With offline fallback
5. **Gesture Captured** - Before any media APIs

```typescript
import { validateBootSequence } from '@/guards/MobileRuntimeGuard';

const result = validateBootSequence();
if (!result.valid) {
  console.error('Boot sequence failed:', result.errors);
}
```

---

## 🔐 GOVERNANCE

### Who Can Modify This Document

- Principal Engineers only
- Requires review from 2 team members
- Must pass mobile Safari testing

### Violations

Any PR that introduces forbidden patterns:
1. Will fail CI checks
2. Cannot be merged
3. Must be fixed before review

### Exceptions

If a pattern MUST be used:
1. Add `// @safe: reason` comment
2. Document in PR description
3. Get approval from Principal Engineer

---

## 📊 MONITORING

Track these metrics to detect regressions:

- **First Contentful Paint** < 2s on 4G
- **Time to Interactive** < 3s on 4G
- **iOS Safari crash rate** = 0%
- **Hydration errors** = 0

---

**Last Updated:** 2026-01-25
**Maintained By:** Principal Platform Engineers
