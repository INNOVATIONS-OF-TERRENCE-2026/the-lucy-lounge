/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — VIDEO ENGINE ADAPTER                                     │
 * │                                                                             │
 * │ Safari-safe video playback with gesture gating.                            │
 * │ DO NOT MODIFY: Governed by /docs/MEDIA_GESTURE_POLICY.md                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * PURPOSE:
 * - Manage video playback with mobile Safari compliance
 * - Handle autoplay restrictions (muted autoplay only)
 * - Provide camera access with proper permission flow
 * - Enforce gesture requirements
 * 
 * RULES:
 * 1. Autoplay ONLY works for muted videos on iOS Safari
 * 2. Camera access REQUIRES explicit user gesture + permission
 * 3. Never auto-initialize camera/display media
 */

import { GestureToken } from '@/hooks/useUserGestureGate';
import { 
  enforceGesturePolicy, 
  validateGestureToken,
  MediaPolicyViolation 
} from './MediaPolicy';
import { isBrowser, isIOS, isIOSSafari, supportsMediaDevices } from '@/lib/safeBrowser';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface VideoEngineState {
  /** Whether any video element is managed */
  hasActiveVideo: boolean;
  /** Camera permission status */
  cameraPermission: PermissionState | 'unknown';
  /** Microphone permission status */
  micPermission: PermissionState | 'unknown';
  /** Active media stream (if any) */
  hasMediaStream: boolean;
}

export interface VideoPlayOptions {
  /** Gesture token (required for unmuted playback) */
  gestureToken?: GestureToken;
  /** Start muted (required for autoplay on iOS) */
  muted?: boolean;
  /** Autoplay (only works if muted on iOS) */
  autoplay?: boolean;
  /** Video element to control */
  videoElement: HTMLVideoElement;
}

export interface CameraOptions {
  /** Gesture token (REQUIRED) */
  gestureToken: GestureToken;
  /** Video constraints */
  video?: boolean | MediaTrackConstraints;
  /** Audio constraints */
  audio?: boolean | MediaTrackConstraints;
}

export interface VideoEngineAdapter {
  /** Check if video playback is supported */
  canUseVideo(): boolean;
  /** Check if camera/mic is supported */
  canUseCamera(): boolean;
  /** Safely play video element */
  playVideo(options: VideoPlayOptions): Promise<boolean>;
  /** Request camera/mic access (REQUIRES gesture) */
  requestCameraAccess(options: CameraOptions): Promise<MediaStream | null>;
  /** Stop all active streams */
  stopAllStreams(): void;
  /** Get current state */
  getState(): VideoEngineState;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const activeStreams: Set<MediaStream> = new Set();
let cameraPermission: PermissionState | 'unknown' = 'unknown';
let micPermission: PermissionState | 'unknown' = 'unknown';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMPLEMENTATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if video playback is supported
 */
function canUseVideo(): boolean {
  if (!isBrowser()) return false;
  
  try {
    const video = document.createElement('video');
    return !!(video.canPlayType && video.canPlayType('video/mp4'));
  } catch {
    return false;
  }
}

/**
 * Check if camera/mic is supported
 */
function canUseCamera(): boolean {
  return supportsMediaDevices();
}

/**
 * Get current state
 */
function getState(): VideoEngineState {
  return {
    hasActiveVideo: activeStreams.size > 0,
    cameraPermission,
    micPermission,
    hasMediaStream: activeStreams.size > 0,
  };
}

/**
 * Safely play a video element
 * Handles iOS Safari autoplay restrictions
 */
async function playVideo(options: VideoPlayOptions): Promise<boolean> {
  const { videoElement, muted = true, autoplay = false, gestureToken } = options;

  if (!videoElement) {
    console.warn('[VideoEngine] No video element provided');
    return false;
  }

  try {
    // iOS Safari requirements
    if (isIOS() || isIOSSafari()) {
      // Autoplay only works muted
      if (autoplay && !muted) {
        console.warn('[VideoEngine] iOS requires muted for autoplay, forcing muted');
        videoElement.muted = true;
      } else {
        videoElement.muted = muted;
      }

      // playsinline is required for inline playback
      videoElement.setAttribute('playsinline', '');
      videoElement.setAttribute('webkit-playsinline', '');
    } else {
      videoElement.muted = muted;
    }

    // Unmuted playback requires gesture
    if (!muted) {
      if (!gestureToken || !validateGestureToken(gestureToken)) {
        console.warn('[VideoEngine] Unmuted playback requires gesture token');
        // Fall back to muted
        videoElement.muted = true;
      }
    }

    // Attempt play
    await videoElement.play();
    console.log('[VideoEngine] Video playing, muted:', videoElement.muted);
    return true;

  } catch (error) {
    // Handle autoplay blocked
    if (error instanceof Error && error.name === 'NotAllowedError') {
      console.warn('[VideoEngine] Autoplay blocked, user gesture required');
      
      // Try muted playback as fallback
      if (!videoElement.muted) {
        videoElement.muted = true;
        try {
          await videoElement.play();
          console.log('[VideoEngine] Playing muted after autoplay block');
          return true;
        } catch {
          // Still blocked
        }
      }
    }

    console.error('[VideoEngine] Play failed:', error);
    return false;
  }
}

/**
 * Request camera/microphone access
 * REQUIRES valid gesture token
 */
async function requestCameraAccess(options: CameraOptions): Promise<MediaStream | null> {
  // Validate gesture token
  if (!validateGestureToken(options.gestureToken)) {
    throw new MediaPolicyViolation(
      'MediaDevices-getUserMedia',
      'Invalid or expired gesture token. Camera access requires a fresh user gesture.'
    );
  }

  // Enforce policy
  enforceGesturePolicy('MediaDevices-getUserMedia');

  // Check support
  if (!canUseCamera()) {
    console.warn('[VideoEngine] MediaDevices not supported');
    return null;
  }

  const { video = true, audio = false } = options;

  try {
    const constraints: MediaStreamConstraints = {
      video,
      audio,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Track the stream
    activeStreams.add(stream);
    
    // Update permission states
    cameraPermission = video ? 'granted' : cameraPermission;
    micPermission = audio ? 'granted' : micPermission;

    console.log('[VideoEngine] Camera access granted');
    return stream;

  } catch (error) {
    // Handle permission denied
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        cameraPermission = video ? 'denied' : cameraPermission;
        micPermission = audio ? 'denied' : micPermission;
        console.warn('[VideoEngine] Camera permission denied');
      } else if (error.name === 'NotFoundError') {
        console.warn('[VideoEngine] No camera/microphone found');
      }
    }

    console.error('[VideoEngine] Camera access failed:', error);
    return null;
  }
}

/**
 * Stop all active media streams
 */
function stopAllStreams(): void {
  for (const stream of activeStreams) {
    try {
      stream.getTracks().forEach(track => track.stop());
    } catch {
      // Ignore errors stopping tracks
    }
  }
  activeStreams.clear();
  console.log('[VideoEngine] All streams stopped');
}

/**
 * Query permission status (if supported)
 */
async function queryPermissions(): Promise<void> {
  if (!isBrowser()) return;
  
  try {
    if (navigator.permissions) {
      const [camera, mic] = await Promise.all([
        navigator.permissions.query({ name: 'camera' as PermissionName }).catch(() => null),
        navigator.permissions.query({ name: 'microphone' as PermissionName }).catch(() => null),
      ]);
      
      if (camera) cameraPermission = camera.state;
      if (mic) micPermission = mic.state;
    }
  } catch {
    // Permissions API not fully supported
  }
}

// Initialize permission query (safe, no side effects)
if (isBrowser()) {
  queryPermissions();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT ADAPTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const videoEngineAdapter: VideoEngineAdapter = {
  canUseVideo,
  canUseCamera,
  playVideo,
  requestCameraAccess,
  stopAllStreams,
  getState,
};

export default videoEngineAdapter;
