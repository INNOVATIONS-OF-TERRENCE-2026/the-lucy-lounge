/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — AUDIO MODULE EXPORTS                                     │
 * │                                                                             │
 * │ Unified audio intelligence layer                                           │
 * │ One import, all audio sources.                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// Types
export * from './types';

// Core Orchestrator
export { 
  AudioOrchestrator, 
  getAudioOrchestrator, 
  resetAudioOrchestrator 
} from './AudioOrchestrator';

// Adapters
export {
  PodcastRSSAdapter,
  getPodcastAdapter,
  AudiobookAdapter,
  getAudiobookAdapter,
  SpotifyOrchestratorAdapter,
  getSpotifyOrchestratorAdapter,
} from './adapters';

// Cross-Device Sync
export {
  CrossDeviceSync,
  getCrossDeviceSync,
  initializeCrossDeviceSync,
} from './CrossDeviceSync';

// Temporal Engine
export {
  TemporalEngine,
  getTemporalEngine,
  getCurrentTemporalContext,
  type TimeOfDay,
  type TemporalContext,
  type TemporalJourney,
} from './TemporalEngine';
