/**
 * THE LUCY LOUNGE - Cinematic Module Index
 * 
 * Central export for all cinematic components and hooks.
 */

// Core wrapper
export { CinematicWrapper, default as CinematicWrapperDefault } from './CinematicWrapper';

// Lucy Presence System
export { 
  LucyPresence, 
  useLucyPresenceState,
  default as LucyPresenceDefault,
  type LucyState,
} from './LucyPresence';

// Page Transitions
export {
  PageTransition,
  SharedElement,
  RouteTransitionWrapper,
  default as PageTransitionDefault,
} from './PageTransition';

// Audio Cinema Layer
export {
  AudioCinemaLayer,
  AudioBars,
  useAudioCinema,
  default as AudioCinemaLayerDefault,
  type AudioMood,
} from './AudioCinemaLayer';

// Dream & Presence Mode
export {
  CognitiveModeProvider,
  useCognitiveMode,
  DreamModeLayer,
  FloatingText,
  EssentialOnly,
  NonEssential,
  TimeDilated,
  default as DreamModeLayerDefault,
  type CognitiveMode,
} from './DreamModeLayer';

// Memory Timeline
export {
  MemoryTimeline,
  MemoryConstellation,
  default as MemoryTimelineDefault,
  type SessionMood,
  type SessionActivity,
  type MemorySession,
} from './MemoryTimeline';

// Cinematic Sidebar
export {
  CinematicLoungesList,
  loungeConfig,
  default as CinematicLoungesListDefault,
  type LoungeConfig,
} from './CinematicLoungesList';

// Atmosphere Settings
export {
  AtmosphereSettings,
  AtmosphereToggle,
  default as AtmosphereSettingsDefault,
} from './AtmosphereSettings';
