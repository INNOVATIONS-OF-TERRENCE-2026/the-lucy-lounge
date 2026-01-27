/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D ENGINE CORE EXPORTS                                       │
 * │                                                                             │
 * │ Central export point for all engine components                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// Core Engine
export { Engine3D, type Engine3DConfig, type EngineStats, type UpdateCallback, type FixedUpdateCallback } from './Engine3D';

// Input System
export { 
  InputManager, 
  type InputState, 
  type GamepadState, 
  type MouseState, 
  type TouchState, 
  type VirtualInputState 
} from './InputManager';

// Physics System
export { 
  PhysicsWorld, 
  CollisionGroups,
  type RigidBodyDesc, 
  type ColliderDesc, 
  type PhysicsBody, 
  type RaycastResult, 
  type CharacterController 
} from './PhysicsWorld';

// Audio System
export { 
  AudioEngine, 
  type SoundConfig, 
  type Sound, 
  type PositionalSound, 
  type MusicTrack 
} from './AudioEngine';

// Asset Loading
export { 
  AssetLoader, 
  type LoadProgress, 
  type AssetManifest, 
  type ProgressCallback 
} from './AssetLoader';

// Camera Controllers
export {
  BaseCameraController,
  FPSCameraController,
  ThirdPersonCameraController,
  OrbitCameraController,
  VehicleCameraController,
  type FPSCameraConfig,
  type ThirdPersonCameraConfig,
  type OrbitCameraConfig,
  type VehicleCameraConfig,
  type CameraShake,
} from './CameraController';

// Particle System
export { 
  ParticleSystem, 
  ParticlePresets,
  type ParticleConfig 
} from './ParticleSystem';

// Game Base Class
export { 
  Game3DBase, 
  type Game3DConfig, 
  type GameState, 
  type GameScore 
} from './Game3DBase';

// Performance Management
export {
  PerformanceManager,
  type PerformanceConfig,
  type PerformanceMetrics,
  type QualityLevel,
} from './PerformanceManager';

// AI Behavior Trees
export {
  BTNode,
  Sequence,
  Selector,
  Parallel,
  RandomSelector,
  Inverter,
  Repeater,
  Succeeder,
  Cooldown,
  TimeLimit,
  Condition,
  Conditions,
  Action,
  Actions,
  BehaviorTree,
  Blackboard,
  BehaviorTrees,
  AdaptiveDifficulty,
  type NodeStatus,
  type BTContext,
  type AIAgent,
  type DifficultyConfig,
} from './AIBehaviorTree';
