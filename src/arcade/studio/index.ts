/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY GAME STUDIO — PUBLIC EXPORTS                                          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// Service
export { GameStudioService } from './GameStudioService';
export { default as gameStudioService } from './GameStudioService';

// Components
export { GameStudioWorkspace } from './components/GameStudioWorkspace';

// Types
export type {
  // Project
  GameProject,
  ProjectStatus,
  ProjectSettings,
  PricingModel,
  
  // Assets
  ProjectAsset,
  AssetType,
  AssetMetadata,
  AssetVariant,
  
  // Scripts
  ProjectScript,
  ScriptType,
  ScriptError,
  
  // Scenes
  GameScene,
  SceneObject,
  ObjectType,
  ObjectComponent,
  ComponentType,
  SceneEnvironment,
  SceneLighting,
  ScenePhysics,
  CollisionLayer,
  NavMeshConfig,
  SpawnPoint,
  
  // AI
  AIBehaviorConfig,
  AIPersonality,
  BehaviorTreeNode,
  DifficultyScaling,
  DifficultyParams,
  AIMovementConfig,
  AICombatConfig,
  AIPerceptionConfig,
  
  // Prompt-to-Game
  GamePrompt,
  PromptStatus,
  PromptIteration,
  GameGenerationConfig,
  
  // Publishing
  PublishRequest,
  PublishResult,
  ArcadeListing,
  ListingStatus,
  
  // Monetization
  CreatorPayout,
  PayoutStatus,
  GameCosmetic,
  CosmeticType,
  
  // Analytics
  ProjectAnalytics,
} from './types';
