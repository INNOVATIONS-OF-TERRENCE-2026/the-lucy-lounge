/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY GAME SDK — PUBLIC API                                                 │
 * │                                                                             │
 * │ The official SDK for building games on Lucy Arcade                         │
 * │                                                                             │
 * │ USAGE:                                                                     │
 * │   import { LucyGameSDK, GRAPHICS_TIER_SPECS } from '@lucy/arcade-sdk';     │
 * │                                                                             │
 * │   const sdk = LucyGameSDK.create();                                        │
 * │   await sdk.initialize({ gameConfig, container });                         │
 * │   sdk.start();                                                             │
 * │                                                                             │
 * │ VERSION: 1.0.0                                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// Core SDK
export {
  LucyGameSDK,
  SDKRenderer,
  SDKPhysics,
  SDKInput,
  SDKAudio,
  SDKNetwork,
  SDKAI,
  AIAgent,
  GRAPHICS_TIER_SPECS,
  type SDKInitOptions,
  type SDKState,
} from './LucyGameSDK';

// Types
export type {
  // Graphics
  GraphicsTierLevel,
  GraphicsTierSpec,
  
  // Game Config
  LucyGameConfig,
  GameType,
  GameGenre,
  InputMethod,
  NetworkMode,
  MonetizationType,
  AgeRating,
  
  // Player & Session
  LucyPlayer,
  PlayerStats,
  PlayerRank,
  GameSession,
  SessionPlayer,
  SessionState,
  GameModeType,
  
  // Input
  InputSnapshot,
  KeyboardState,
  MouseState,
  GamepadState,
  TouchState,
  Touch,
  Gesture,
  
  // Networking
  NetworkPacket,
  PacketType,
  NetworkState,
  SyncedEntity,
  InterpolationSnapshot,
  
  // Physics
  PhysicsConfig,
  RigidBodyConfig,
  ColliderShape,
  
  // Audio
  AudioConfig,
  SoundEffect,
  MusicTrack,
  
  // AI
  AIPersonalityType,
  AIConfig,
  AIDifficulty,
  AIState,
  AIGoal,
  AIMemoryEntity,
  
  // Events
  GameEvent,
  EventCallback,
  
  // Math
  Vector2,
  Vector3,
  Quaternion,
  Matrix4,
  Transform,
  BoundingBox,
  Ray,
  
  // Matchmaking & Esports
  MatchmakingRequest,
  MatchmakingTicket,
  MatchmakingStatus,
  TournamentConfig,
  TournamentFormat,
  TournamentMatch,
  TournamentMatchStatus,
  
  // Spectator & Replay
  SpectatorState,
  SpectatorViewMode,
  ReplayData,
  ReplayPlayer,
  ReplaySnapshot,
  
  // Creator Studio
  CreatorGameProject,
  GameTemplate,
  ProjectStatus,
  CreatorAsset,
  AssetType,
  CreatorScript,
  ScriptType,
  ScriptError,
  
  // Monetization
  CreatorEarnings,
  Cosmetic,
  CosmeticType,
  CosmeticRarity,
  
  // Analytics
  GameAnalytics,
} from './types';

// Re-export for convenience
export { default } from './LucyGameSDK';
