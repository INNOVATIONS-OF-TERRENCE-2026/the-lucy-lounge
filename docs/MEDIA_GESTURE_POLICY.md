# Media Gesture Policy

> **BINDING**: All media code MUST follow this policy.
> Version: 1.0.0 | Last Updated: 2026-01-25

## Overview

Mobile browsers (especially iOS Safari) require **explicit user gestures** before allowing:
- AudioContext creation/resume
- Video/audio playback
- Microphone/camera access
- Screen sharing
- Notifications
- Speech recognition

This document defines what is allowed at each stage.

---

## Stage 1: Page Load (No Gesture)

### ✅ ALLOWED at Load

| Action | Safe? | Notes |
|--------|-------|-------|
| Check if AudioContext exists | ✅ | `!!window.AudioContext` |
| Check if MediaDevices exists | ✅ | `!!navigator.mediaDevices` |
| Check matchMedia queries | ✅ | `matchMedia(...).matches` |
| Read navigator properties | ✅ | `navigator.userAgent` |
| Read localStorage | ✅* | Wrap in try/catch |
| Create canvas (2D) | ✅ | No GPU init |
| Check WebGL support | ✅ | Via canvas context check |

### ❌ FORBIDDEN at Load

| Action | Why | Crash on iOS? |
|--------|-----|---------------|
| `new AudioContext()` | Requires gesture | YES |
| `audioContext.resume()` | Requires gesture | YES |
| `video.play()` | Requires gesture | Silently fails |
| `audio.play()` | Requires gesture | Silently fails |
| `getUserMedia()` | Requires gesture | Blocked |
| `getDisplayMedia()` | Requires gesture | Blocked |
| SpeechRecognition.start() | Requires gesture | Blocked |

---

## Stage 2: After User Gesture

Once ANY of these events fire:
- `click`
- `touchstart`
- `touchend`
- `keydown`
- `mousedown`

### Now ALLOWED

```typescript
// All of these become safe:
const ctx = new AudioContext();
await ctx.resume();

await video.play();
await audio.play();

const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
```

### Best Practices

1. **Create AudioContext inside gesture handler**
   ```typescript
   onClick={() => {
     const ctx = new AudioContext(); // ✅ Created in gesture
     await ctx.resume();
   }}
   ```

2. **Reuse AudioContext**
   ```typescript
   // Create once, reuse everywhere
   let globalCtx: AudioContext | null = null;
   
   function getAudioContext() {
     if (!globalCtx) {
       globalCtx = new AudioContext();
     }
     return globalCtx;
   }
   ```

3. **Warm audio pipeline on iOS**
   ```typescript
   function warmPipeline(ctx: AudioContext) {
     const buffer = ctx.createBuffer(1, 1, 22050);
     const source = ctx.createBufferSource();
     source.buffer = buffer;
     source.connect(ctx.destination);
     source.start(0);
     source.stop(0.001);
   }
   ```

---

## The Gesture Gate System

Lucy uses a centralized gesture tracking system:

### 1. UserGestureGateProvider

Wraps the entire app and tracks first user gesture:

```typescript
// In App.tsx
<UserGestureGateProvider>
  <YourApp />
</UserGestureGateProvider>
```

### 2. useUserGestureGate Hook

Check gesture status in components:

```typescript
function MyComponent() {
  const { hasGesture, gestureToken, awaitUserGesture } = useUserGestureGate();
  
  // Check synchronously
  if (hasGesture) {
    // Can use media APIs
  }
  
  // Wait for gesture
  const handleInit = async () => {
    const token = await awaitUserGesture();
    // Now init media
  };
}
```

### 3. useDeferredCapabilityInit Hook

Queue init functions that auto-execute on gesture:

```typescript
const { deferredInit } = useDeferredCapabilityInit();

// This queues until gesture, then executes
deferredInit(
  { key: 'audio-context' },
  async (token) => {
    const ctx = new AudioContext();
    await ctx.resume();
    return true;
  }
);
```

---

## Media Adapters

Use the adapters instead of raw APIs:

### AudioEngineAdapter

```typescript
import { audioEngineAdapter } from '@/media';

// Check support (safe at any time)
const canUse = audioEngineAdapter.canUseAudio();

// Initialize (requires gesture)
await audioEngineAdapter.initializeAudio({ gestureToken });

// Get context
const ctx = audioEngineAdapter.getAudioContext();
```

### VideoEngineAdapter

```typescript
import { videoEngineAdapter } from '@/media';

// Play video (handles iOS quirks)
await videoEngineAdapter.playVideo({
  videoElement: videoRef.current,
  muted: true, // Required for autoplay on iOS
});

// Camera access (requires gesture)
const stream = await videoEngineAdapter.requestCameraAccess({
  gestureToken,
  video: true,
});
```

---

## iOS Safari Specific

### AudioContext Quirks

1. **Starts suspended** - MUST call `resume()` from gesture
2. **Resume can fail silently** - Check state after
3. **Needs warm-up** - Play silent buffer to enable output

### Video Quirks

1. **Autoplay requires muted** - No exceptions
2. **playsinline required** - For inline (non-fullscreen) playback
3. **webkit-playsinline** - For older iOS

### Storage Quirks

1. **Private mode blocks storage** - localStorage throws
2. **Quota can be exceeded** - setItem throws
3. **Always wrap in try/catch**

---

## Debugging Gestures

Enable debug mode:

```typescript
// In console
localStorage.setItem('DEBUG_GESTURE', '1');

// Or URL param
?debug_gesture=1
```

Check current state:

```typescript
import { logAssertionState } from '@/lib/assertions';
logAssertionState();
```

---

## Summary

| Stage | AudioContext | Video Play | getUserMedia |
|-------|-------------|------------|--------------|
| Page Load | ❌ | ❌ | ❌ |
| After Gesture | ✅ | ✅ | ✅ |

**When in doubt, use the adapters. They handle all the edge cases.**
