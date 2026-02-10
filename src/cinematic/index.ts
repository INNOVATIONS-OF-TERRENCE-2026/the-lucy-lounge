/**
 * Cinematic Module — Barrel Export
 * 
 * Central export for Lucy Cinema's truth-based storyboard pipeline.
 */

// Types
export type {
  CinematicJobStatus,
  CinematicJobType,
  CinematicShot as CinematicJobShot,
  CinematicJob,
  PromptMemory,
  UsageLedgerEntry,
  CinematicPlan,
  UserPlan,
  StylePreset,
  ExportPlatform,
} from './types/cinematic.types';

// Storyboard Director (Phase 3)
export {
  buildClientStoryboard,
  detectPacing,
  detectMood,
  CINEMA_OUTPUT_LABELS,
  type PacingStyle,
  type StoryboardConfig,
  type CinemaOutputLabel,
  type CinematicShot,
  type CinematicStoryboard,
  type CinemaSequence,
  type CameraMovement,
  type CameraPosition,
  type TransitionType,
} from './ai/storyboardDirector';

// Render Pipeline (Phase 7)
export {
  renderKeyframes,
  renderTimeline,
  renderVideo,
  runRenderPipeline,
  progressToRenderState,
  type RenderBackend,
  type RenderConfig,
  type KeyframeResult,
  type TimelineResult,
  type VideoResult as PipelineVideoResult,
  type PipelineOutput,
  type PipelineProgress,
  type ProgressCallback,
} from './pipeline/renderPipeline';
