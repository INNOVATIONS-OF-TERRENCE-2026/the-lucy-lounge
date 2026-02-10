/**
 * PHASE 7 — Render Pipeline Abstraction
 * 
 * This module creates a future-proof rendering abstraction that:
 * 1. Today: renders keyframes + structured motion metadata
 * 2. Tomorrow: swaps in real video APIs with ZERO refactoring
 * 
 * The pipeline has three stages:
 * - renderKeyframes(): Generate static images for each shot
 * - renderTimeline(): Build motion/audio metadata for playback simulation
 * - renderVideo(): FUTURE — call real video diffusion API
 * 
 * Each stage returns typed output that the UI consumes uniformly.
 * When real video becomes available, only the renderVideo() implementation changes.
 */

// ─── Cinematic Types (local definitions — canonical source in vision engine) ──

interface CinematicShot {
  shotNumber: number;
  description: string;
  cameraMotion: string;
  duration: number;
  aspectRatio: string;
  mood: string;
  imagePrompt: string;
  imageUrl?: string;
  generating?: boolean;
  cameraPosition: string;
  cameraMovementType: string;
  subjectContinuity: string;
  lightingContinuity: string;
  motionIntent: string;
  transitionToNext: string;
  environment: string;
  audioCue?: string;
}

interface CinematicStoryboard {
  title: string;
  logline: string;
  shots: CinematicShot[];
  overallMood: string;
  colorPalette: string;
  audioDirection: string;
}

interface ShotMotionMetadata {
  shotNumber: number;
  startTimeSec: number;
  endTimeSec: number;
  cameraMovement: string;
  cameraPosition: string;
  transition: string;
  easing: string;
  kenBurns: {
    startScale: number;
    endScale: number;
    startX: number;
    endX: number;
    startY: number;
    endY: number;
  };
}

interface AudioTimelineEntry {
  type: string;
  description: string;
  startTimeSec: number;
  endTimeSec: number;
  volume: number;
}

interface CinemaSequence {
  storyboard: CinematicStoryboard;
  motionTimeline: ShotMotionMetadata[];
  audioTimeline: AudioTimelineEntry[];
  totalDurationSec: number;
  outputLabel: string;
  schemaVersion: number;
}

interface RenderPipelineState {
  status: 'idle' | 'rendering' | 'complete' | 'error';
  currentShot: number;
  totalShots: number;
  progress: number;
  errors: string[];
}

// ─── Local timeline builders (avoid cross-module dependency) ──────

function buildMotionTimeline(shots: CinematicShot[]): ShotMotionMetadata[] {
  let currentTime = 0;
  return shots.map((shot) => {
    const startTime = currentTime;
    const endTime = currentTime + shot.duration;
    currentTime = endTime;
    return {
      shotNumber: shot.shotNumber,
      startTimeSec: startTime,
      endTimeSec: endTime,
      cameraMovement: shot.cameraMovementType,
      cameraPosition: shot.cameraPosition,
      transition: shot.transitionToNext,
      easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      kenBurns: { startScale: 1.0, endScale: 1.08, startX: 0, endX: 0, startY: 0, endY: 0 },
    };
  });
}

function buildAudioTimeline(shots: CinematicShot[]): AudioTimelineEntry[] {
  const totalDuration = shots.reduce((sum, s) => sum + s.duration, 0);
  const entries: AudioTimelineEntry[] = [];
  entries.push({
    type: "music",
    description: `${shots[0]?.mood || "cinematic"} background score`,
    startTimeSec: 0,
    endTimeSec: totalDuration,
    volume: 0.4,
  });
  let currentTime = 0;
  for (const shot of shots) {
    if (shot.audioCue) {
      entries.push({
        type: "ambience",
        description: shot.audioCue,
        startTimeSec: currentTime,
        endTimeSec: currentTime + shot.duration,
        volume: 0.6,
      });
    }
    currentTime += shot.duration;
  }
  return entries;
}

function createCinemaSequence(storyboard: CinematicStoryboard): CinemaSequence {
  const motionTimeline = buildMotionTimeline(storyboard.shots);
  const audioTimeline = buildAudioTimeline(storyboard.shots);
  const totalDurationSec = storyboard.shots.reduce((sum, s) => sum + s.duration, 0);
  return {
    storyboard,
    motionTimeline,
    audioTimeline,
    totalDurationSec,
    outputLabel: "Cinematic storyboard preview",
    schemaVersion: 2,
  };
}

// ─── Pipeline Types ───────────────────────────────────────────────

export type RenderBackend = 'keyframe' | 'video_diffusion' | 'hybrid';

export interface RenderConfig {
  /** Which rendering backend to use. Currently only 'keyframe' is real. */
  backend: RenderBackend;
  /** Quality tier affects image resolution and detail */
  quality: 'draft' | 'standard' | 'high';
  /** Whether to generate audio alongside visuals */
  includeAudio: boolean;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

export interface KeyframeResult {
  shotNumber: number;
  imageUrl: string | null;
  error?: string;
  durationMs: number;
}

export interface TimelineResult {
  motionTimeline: ShotMotionMetadata[];
  audioTimeline: AudioTimelineEntry[];
  totalDurationSec: number;
}

export interface VideoResult {
  /** NOT YET AVAILABLE — will contain video URL when real API is integrated */
  videoUrl: string | null;
  /** Whether this is real video or simulated from keyframes */
  isSimulated: boolean;
  /** Human-readable status */
  status: 'keyframe_preview' | 'real_video' | 'hybrid';
  message: string;
}

export interface PipelineOutput {
  keyframes: KeyframeResult[];
  timeline: TimelineResult;
  video: VideoResult;
  sequence: CinemaSequence;
  /** Total pipeline duration in ms */
  totalDurationMs: number;
  /** Output label — MUST be truthful */
  outputLabel: string;
}

// ─── Progress Callback ────────────────────────────────────────────

export interface PipelineProgress {
  stage: 'keyframes' | 'timeline' | 'video' | 'complete';
  current: number;
  total: number;
  percent: number;
  message: string;
}

export type ProgressCallback = (progress: PipelineProgress) => void;

// ─── Render Pipeline ──────────────────────────────────────────────

const DEFAULT_CONFIG: RenderConfig = {
  backend: 'keyframe',
  quality: 'standard',
  includeAudio: true,
};

/**
 * Stage 1: Render keyframes for each shot.
 * Calls the image generation API for each shot in sequence.
 */
export async function renderKeyframes(
  storyboard: CinematicStoryboard,
  generateImage: (prompt: string) => Promise<string | null>,
  onProgress?: ProgressCallback,
  signal?: AbortSignal,
): Promise<KeyframeResult[]> {
  const results: KeyframeResult[] = [];
  const total = storyboard.shots.length;

  for (let i = 0; i < total; i++) {
    if (signal?.aborted) break;

    const shot = storyboard.shots[i];
    const start = performance.now();

    onProgress?.({
      stage: 'keyframes',
      current: i + 1,
      total,
      percent: ((i) / total) * 100,
      message: `Rendering keyframe ${i + 1}/${total}: ${shot.cameraPosition.replace(/_/g, ' ')} shot`,
    });

    try {
      const imageUrl = await generateImage(shot.imagePrompt);
      results.push({
        shotNumber: shot.shotNumber,
        imageUrl,
        durationMs: performance.now() - start,
      });
    } catch (err: any) {
      results.push({
        shotNumber: shot.shotNumber,
        imageUrl: null,
        error: err?.message || 'Generation failed',
        durationMs: performance.now() - start,
      });
    }
  }

  onProgress?.({
    stage: 'keyframes',
    current: total,
    total,
    percent: 100,
    message: `All ${total} keyframes rendered`,
  });

  return results;
}

/**
 * Stage 2: Build motion + audio timeline from storyboard metadata.
 * This is pure computation — no API calls needed.
 */
export function renderTimeline(
  storyboard: CinematicStoryboard,
  onProgress?: ProgressCallback,
): TimelineResult {
  onProgress?.({
    stage: 'timeline',
    current: 0,
    total: 1,
    percent: 0,
    message: 'Building motion and audio timeline...',
  });

  const motionTimeline = buildMotionTimeline(storyboard.shots);
  const audioTimeline = buildAudioTimeline(storyboard.shots);
  const totalDurationSec = storyboard.shots.reduce((sum, s) => sum + s.duration, 0);

  onProgress?.({
    stage: 'timeline',
    current: 1,
    total: 1,
    percent: 100,
    message: 'Timeline complete',
  });

  return { motionTimeline, audioTimeline, totalDurationSec };
}

/**
 * Stage 3: Render video — FUTURE API slot.
 * 
 * Currently returns a simulated result based on keyframes.
 * When a real video API (Sora, Runway, Kling, etc.) becomes available,
 * ONLY THIS FUNCTION needs to change.
 * 
 * @future Replace the implementation body with real video API call
 */
export async function renderVideo(
  _storyboard: CinematicStoryboard,
  _keyframes: KeyframeResult[],
  _timeline: TimelineResult,
  _config: RenderConfig = DEFAULT_CONFIG,
  onProgress?: ProgressCallback,
): Promise<VideoResult> {
  onProgress?.({
    stage: 'video',
    current: 0,
    total: 1,
    percent: 0,
    message: 'Video diffusion not yet available — using keyframe preview',
  });

  // ────────────────────────────────────────────────────────────
  // FUTURE: Replace this block with real video API integration
  // 
  // Example when API becomes available:
  //
  // if (config.backend === 'video_diffusion') {
  //   const result = await videoAPI.generate({
  //     keyframes: keyframes.map(k => k.imageUrl).filter(Boolean),
  //     timeline: timeline.motionTimeline,
  //     audio: timeline.audioTimeline,
  //     quality: config.quality,
  //   });
  //   return {
  //     videoUrl: result.url,
  //     isSimulated: false,
  //     status: 'real_video',
  //     message: 'Video generated via [API Name]',
  //   };
  // }
  // ────────────────────────────────────────────────────────────

  onProgress?.({
    stage: 'video',
    current: 1,
    total: 1,
    percent: 100,
    message: 'Keyframe-based preview ready',
  });

  return {
    videoUrl: null,
    isSimulated: true,
    status: 'keyframe_preview',
    message: 'Cinematic storyboard preview — keyframe-based playback. Real video generation will be available in a future update.',
  };
}

// ─── Full Pipeline Orchestrator ───────────────────────────────────

/**
 * Run the complete render pipeline: keyframes → timeline → video.
 * 
 * This is the single entry point for all cinema rendering.
 * The output is always typed and truthful about what was generated.
 */
export async function runRenderPipeline(
  storyboard: CinematicStoryboard,
  generateImage: (prompt: string) => Promise<string | null>,
  config: Partial<RenderConfig> = {},
  onProgress?: ProgressCallback,
): Promise<PipelineOutput> {
  const fullConfig: RenderConfig = { ...DEFAULT_CONFIG, ...config };
  const pipelineStart = performance.now();

  // Stage 1: Keyframes
  const keyframes = await renderKeyframes(
    storyboard,
    generateImage,
    onProgress,
    fullConfig.signal,
  );

  // Stage 2: Timeline
  const timeline = renderTimeline(storyboard, onProgress);

  // Stage 3: Video (future)
  const video = await renderVideo(
    storyboard,
    keyframes,
    timeline,
    fullConfig,
    onProgress,
  );

  // Build cinema sequence
  const sequence = createCinemaSequence(storyboard);

  onProgress?.({
    stage: 'complete',
    current: 1,
    total: 1,
    percent: 100,
    message: 'Pipeline complete',
  });

  return {
    keyframes,
    timeline,
    video,
    sequence,
    totalDurationMs: performance.now() - pipelineStart,
    outputLabel: video.isSimulated
      ? 'Cinematic storyboard preview'
      : 'Video generated',
  };
}

// ─── Pipeline State Adapter ───────────────────────────────────────

/**
 * Convert pipeline progress to the existing RenderPipelineState format
 * for backward compatibility with the current UI.
 */
export function progressToRenderState(
  progress: PipelineProgress,
  totalShots: number,
): RenderPipelineState {
  return {
    status: progress.stage === 'complete' ? 'complete' : 'rendering',
    currentShot: progress.stage === 'keyframes' ? progress.current : totalShots,
    totalShots,
    progress: progress.percent,
    errors: [],
  };
}
