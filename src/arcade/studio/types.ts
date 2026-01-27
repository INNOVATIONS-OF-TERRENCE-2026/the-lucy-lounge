/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY GAME STUDIO — TYPE DEFINITIONS                                        │
 * │                                                                             │
 * │ Types for the Creator Game Studio platform                                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type { GameTemplate, LucyGameConfig, GraphicsTierLevel } from '../sdk/types';

// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface GameProject {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  
  // Template & Config
  template: GameTemplate;
  config: LucyGameConfig;
  
  // Assets
  assets: ProjectAsset[];
  assetCount: number;
  totalAssetSizeBytes: number;
  
  // Scripts
  scripts: ProjectScript[];
  
  // Scenes
  scenes: GameScene[];
  mainScene: string;
  
  // AI Configuration
  aiConfigs: AIBehaviorConfig[];
  
  // State
  status: ProjectStatus;
  version: string;
  lastModified: number;
  createdAt: number;
  
  // Publishing
  isPublished: boolean;
  publishedVersion?: string;
  publishedAt?: number;
  arcadeListingId?: string;
  
  // Analytics
  playCount: number;
  averageRating: number;
  ratingCount: number;
  totalRevenue: number;
  
  // Settings
  settings: ProjectSettings;
}

export type ProjectStatus = 
  | 'draft'
  | 'building'
  | 'testing'
  | 'review'
  | 'published'
  | 'suspended'
  | 'archived';

export interface ProjectSettings {
  // Graphics
  minGraphicsTier: GraphicsTierLevel;
  targetGraphicsTier: GraphicsTierLevel;
  
  // Performance
  targetFPS: number;
  maxLoadTime: number;
  
  // Monetization
  pricingModel: PricingModel;
  price?: number;
  
  // Access
  isPublic: boolean;
  allowForking: boolean;
  
  // Moderation
  ageRating: 'E' | 'E10' | 'T' | 'M';
  contentWarnings: string[];
}

export type PricingModel = 
  | 'free'
  | 'paid'
  | 'freemium'
  | 'cosmetic_only'
  | 'tournament';

// ============================================================================
// ASSET TYPES
// ============================================================================

export interface ProjectAsset {
  id: string;
  projectId: string;
  
  // File Info
  name: string;
  type: AssetType;
  path: string;
  url: string;
  sizeBytes: number;
  
  // Metadata
  metadata: AssetMetadata;
  
  // Processing
  isProcessed: boolean;
  processingStatus?: 'pending' | 'processing' | 'complete' | 'failed';
  processingError?: string;
  
  // Variants (for tier-based loading)
  variants?: AssetVariant[];
  
  // Usage
  usedInScenes: string[];
  usedInScripts: string[];
  
  // Timestamps
  uploadedAt: number;
  modifiedAt: number;
}

export type AssetType =
  | 'model_3d'
  | 'texture_diffuse'
  | 'texture_normal'
  | 'texture_pbr'
  | 'audio_sfx'
  | 'audio_music'
  | 'audio_ambient'
  | 'animation'
  | 'particle'
  | 'shader'
  | 'font'
  | 'data_json'
  | 'map_heightmap'
  | 'map_navmesh';

export interface AssetMetadata {
  // Model
  triangleCount?: number;
  vertexCount?: number;
  boundingBox?: { min: [number, number, number]; max: [number, number, number] };
  hasAnimations?: boolean;
  
  // Texture
  width?: number;
  height?: number;
  channels?: number;
  format?: string;
  
  // Audio
  duration?: number;
  sampleRate?: number;
  bitRate?: number;
  
  // Animation
  clipCount?: number;
  totalDuration?: number;
  
  // Custom
  tags?: string[];
  category?: string;
}

export interface AssetVariant {
  tier: GraphicsTierLevel;
  url: string;
  sizeBytes: number;
  metadata: AssetMetadata;
}

// ============================================================================
// SCRIPT TYPES
// ============================================================================

export interface ProjectScript {
  id: string;
  projectId: string;
  
  // File Info
  name: string;
  type: ScriptType;
  code: string;
  
  // Compilation
  compiledCode?: string;
  isCompiled: boolean;
  compileErrors?: ScriptError[];
  compileWarnings?: ScriptError[];
  
  // Dependencies
  imports: string[];
  exports: string[];
  
  // Usage
  usedInScenes: string[];
  
  // Timestamps
  createdAt: number;
  modifiedAt: number;
}

export type ScriptType =
  | 'game_logic'
  | 'player_controller'
  | 'enemy_controller'
  | 'vehicle_controller'
  | 'weapon_system'
  | 'ui_controller'
  | 'ai_behavior'
  | 'physics_handler'
  | 'network_sync'
  | 'effect_script'
  | 'utility';

export interface ScriptError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

// ============================================================================
// SCENE TYPES
// ============================================================================

export interface GameScene {
  id: string;
  projectId: string;
  
  // Info
  name: string;
  description: string;
  
  // Hierarchy
  rootObjects: SceneObject[];
  
  // Environment
  environment: SceneEnvironment;
  
  // Lighting
  lighting: SceneLighting;
  
  // Physics
  physics: ScenePhysics;
  
  // Navigation
  navMesh?: NavMeshConfig;
  
  // Spawn Points
  spawnPoints: SpawnPoint[];
  
  // Scripts
  scripts: string[]; // Script IDs
  
  // Timestamps
  createdAt: number;
  modifiedAt: number;
}

export interface SceneObject {
  id: string;
  name: string;
  type: ObjectType;
  
  // Transform
  position: [number, number, number];
  rotation: [number, number, number, number]; // Quaternion
  scale: [number, number, number];
  
  // Components
  components: ObjectComponent[];
  
  // Hierarchy
  children: SceneObject[];
  parentId?: string;
  
  // State
  isActive: boolean;
  isStatic: boolean;
  layer: number;
  tags: string[];
}

export type ObjectType =
  | 'empty'
  | 'mesh'
  | 'light'
  | 'camera'
  | 'audio_source'
  | 'particle_system'
  | 'trigger'
  | 'spawner'
  | 'waypoint'
  | 'prefab_instance';

export interface ObjectComponent {
  type: ComponentType;
  enabled: boolean;
  properties: Record<string, any>;
}

export type ComponentType =
  | 'mesh_renderer'
  | 'collider_box'
  | 'collider_sphere'
  | 'collider_capsule'
  | 'collider_mesh'
  | 'rigid_body'
  | 'character_controller'
  | 'vehicle_controller'
  | 'audio_source'
  | 'particle_emitter'
  | 'light_point'
  | 'light_spot'
  | 'light_directional'
  | 'camera'
  | 'script'
  | 'network_identity'
  | 'ai_agent';

export interface SceneEnvironment {
  skyboxType: 'color' | 'gradient' | 'cubemap' | 'procedural';
  skyboxColor?: string;
  skyboxGradient?: { top: string; bottom: string };
  skyboxTexture?: string;
  
  fog: {
    enabled: boolean;
    type: 'linear' | 'exponential' | 'exponential2';
    color: string;
    density?: number;
    near?: number;
    far?: number;
  };
  
  ambientLight: {
    color: string;
    intensity: number;
  };
}

export interface SceneLighting {
  directionalLight?: {
    color: string;
    intensity: number;
    direction: [number, number, number];
    castShadow: boolean;
    shadowMapSize: number;
  };
  
  pointLights: Array<{
    position: [number, number, number];
    color: string;
    intensity: number;
    range: number;
    castShadow: boolean;
  }>;
  
  spotLights: Array<{
    position: [number, number, number];
    direction: [number, number, number];
    color: string;
    intensity: number;
    range: number;
    angle: number;
    penumbra: number;
    castShadow: boolean;
  }>;
}

export interface ScenePhysics {
  gravity: [number, number, number];
  fixedTimestep: number;
  
  collisionLayers: CollisionLayer[];
  collisionMatrix: boolean[][];
}

export interface CollisionLayer {
  index: number;
  name: string;
}

export interface NavMeshConfig {
  agentRadius: number;
  agentHeight: number;
  maxSlope: number;
  stepHeight: number;
  meshData?: string; // Serialized nav mesh
}

export interface SpawnPoint {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  team?: number;
  type: 'player' | 'enemy' | 'item' | 'vehicle';
  priority: number;
}

// ============================================================================
// AI CONFIGURATION
// ============================================================================

export interface AIBehaviorConfig {
  id: string;
  name: string;
  description: string;
  
  // Personality
  personality: AIPersonality;
  
  // Behavior Tree
  behaviorTree: BehaviorTreeNode;
  
  // Difficulty Scaling
  difficultyScaling: DifficultyScaling;
  
  // Movement
  movement: AIMovementConfig;
  
  // Combat
  combat: AICombatConfig;
  
  // Perception
  perception: AIPerceptionConfig;
}

export interface AIPersonality {
  aggression: number; // 0-1
  caution: number; // 0-1
  teamwork: number; // 0-1
  adaptability: number; // 0-1
  unpredictability: number; // 0-1
}

export interface BehaviorTreeNode {
  type: 'sequence' | 'selector' | 'parallel' | 'decorator' | 'action' | 'condition';
  name: string;
  children?: BehaviorTreeNode[];
  
  // For decorators
  decorator?: 'inverter' | 'repeater' | 'succeeder' | 'cooldown' | 'timeout';
  decoratorParams?: Record<string, any>;
  
  // For actions/conditions
  actionType?: string;
  actionParams?: Record<string, any>;
}

export interface DifficultyScaling {
  easy: DifficultyParams;
  medium: DifficultyParams;
  hard: DifficultyParams;
  expert: DifficultyParams;
}

export interface DifficultyParams {
  reactionTimeMultiplier: number;
  accuracyMultiplier: number;
  damageMultiplier: number;
  healthMultiplier: number;
  aggressionMultiplier: number;
  perceptionMultiplier: number;
}

export interface AIMovementConfig {
  walkSpeed: number;
  runSpeed: number;
  turnSpeed: number;
  jumpHeight: number;
  
  pathfinding: {
    algorithm: 'astar' | 'dijkstra' | 'navmesh';
    updateInterval: number;
    maxPathLength: number;
  };
  
  avoidance: {
    enabled: boolean;
    radius: number;
    priority: number;
  };
}

export interface AICombatConfig {
  preferredRange: number;
  minRange: number;
  maxRange: number;
  
  burstDuration: number;
  burstCooldown: number;
  
  coverUsage: number; // 0-1 preference
  flankingChance: number; // 0-1
  retreatThreshold: number; // Health percentage
}

export interface AIPerceptionConfig {
  sightRange: number;
  sightAngle: number;
  hearingRange: number;
  
  memoryDuration: number;
  awarenessDecay: number;
  
  threatAssessment: {
    distanceWeight: number;
    healthWeight: number;
    weaponWeight: number;
    positionWeight: number;
  };
}

// ============================================================================
// PROMPT-TO-GAME TYPES
// ============================================================================

export interface GamePrompt {
  id: string;
  creatorId: string;
  
  // Input
  prompt: string;
  template: GameTemplate;
  
  // Generation
  generationStatus: PromptStatus;
  generationProgress: number;
  generationLog: string[];
  
  // Result
  generatedProject?: GameProject;
  error?: string;
  
  // History
  iterations: PromptIteration[];
  
  // Timestamps
  createdAt: number;
  completedAt?: number;
}

export type PromptStatus =
  | 'pending'
  | 'analyzing'
  | 'generating_structure'
  | 'generating_assets'
  | 'generating_scripts'
  | 'generating_ai'
  | 'compiling'
  | 'testing'
  | 'complete'
  | 'failed';

export interface PromptIteration {
  timestamp: number;
  prompt: string;
  changes: string[];
  success: boolean;
}

export interface GameGenerationConfig {
  template: GameTemplate;
  
  // Style
  artStyle: 'realistic' | 'stylized' | 'cartoon' | 'pixel' | 'low_poly';
  colorPalette: string[];
  
  // Gameplay
  cameraType: 'first_person' | 'third_person' | 'top_down' | 'side_scroll' | 'isometric';
  gameplayMechanics: string[];
  
  // Technical
  targetTier: GraphicsTierLevel;
  maxAssetSizeMB: number;
  
  // AI
  aiOpponents: boolean;
  aiDifficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  
  // Multiplayer
  multiplayerMode: 'none' | 'local' | 'online_pvp' | 'online_coop';
  maxPlayers: number;
}

// ============================================================================
// PUBLISHING TYPES
// ============================================================================

export interface PublishRequest {
  projectId: string;
  version: string;
  
  // Listing Info
  title: string;
  description: string;
  shortDescription: string;
  
  // Media
  thumbnail: string;
  banner: string;
  screenshots: string[];
  trailerUrl?: string;
  
  // Categorization
  category: string;
  tags: string[];
  
  // Pricing
  pricingModel: PricingModel;
  price?: number;
  
  // Release
  releaseType: 'immediate' | 'scheduled';
  scheduledDate?: number;
  
  // Review
  notes?: string;
}

export interface PublishResult {
  success: boolean;
  listingId?: string;
  reviewRequired: boolean;
  reviewEstimate?: number;
  errors?: string[];
}

export interface ArcadeListing {
  id: string;
  projectId: string;
  creatorId: string;
  
  // Info
  title: string;
  description: string;
  shortDescription: string;
  
  // Media
  thumbnail: string;
  banner: string;
  screenshots: string[];
  trailerUrl?: string;
  
  // Categorization
  category: string;
  tags: string[];
  
  // Pricing
  pricingModel: PricingModel;
  price?: number;
  
  // Stats
  playCount: number;
  uniquePlayers: number;
  avgRating: number;
  ratingCount: number;
  favoriteCount: number;
  
  // Revenue
  totalRevenue: number;
  revenueThisMonth: number;
  
  // Status
  status: ListingStatus;
  
  // Version
  currentVersion: string;
  
  // Timestamps
  publishedAt: number;
  updatedAt: number;
}

export type ListingStatus =
  | 'pending_review'
  | 'active'
  | 'suspended'
  | 'delisted';

// ============================================================================
// MONETIZATION TYPES
// ============================================================================

export interface CreatorPayout {
  id: string;
  creatorId: string;
  
  // Amount
  amount: number;
  currency: string;
  
  // Breakdown
  breakdown: {
    gameSales: number;
    cosmetics: number;
    tournaments: number;
    tips: number;
    platformFee: number;
  };
  
  // Status
  status: PayoutStatus;
  
  // Payment
  paymentMethod: string;
  paymentDetails?: string;
  
  // Timestamps
  periodStart: number;
  periodEnd: number;
  requestedAt: number;
  processedAt?: number;
}

export type PayoutStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface GameCosmetic {
  id: string;
  projectId: string;
  
  // Info
  name: string;
  description: string;
  type: CosmeticType;
  
  // Rarity
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  
  // Pricing
  price: number;
  currency: 'coins' | 'premium';
  
  // Assets
  previewUrl: string;
  assetUrl: string;
  
  // Availability
  isAvailable: boolean;
  limitedQuantity?: number;
  soldCount: number;
  
  // Timestamps
  createdAt: number;
  releasedAt?: number;
}

export type CosmeticType =
  | 'character_skin'
  | 'weapon_skin'
  | 'vehicle_skin'
  | 'emote'
  | 'victory_pose'
  | 'trail_effect'
  | 'profile_frame'
  | 'title'
  | 'banner';

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface ProjectAnalytics {
  projectId: string;
  period: 'hour' | 'day' | 'week' | 'month' | 'all_time';
  
  // Players
  totalPlays: number;
  uniquePlayers: number;
  newPlayers: number;
  returningPlayers: number;
  
  // Sessions
  avgSessionLength: number;
  totalPlaytime: number;
  sessionsPerPlayer: number;
  
  // Retention
  retention1Day: number;
  retention7Day: number;
  retention30Day: number;
  
  // Performance
  avgFPS: number;
  avgLoadTime: number;
  crashCount: number;
  crashRate: number;
  
  // Engagement
  avgScore: number;
  completionRate: number;
  achievementUnlockRate: number;
  
  // Social
  shareCount: number;
  favoriteCount: number;
  
  // Revenue
  revenue: number;
  revenuePerPlayer: number;
  
  // Ratings
  avgRating: number;
  newRatings: number;
  
  // Funnel
  funnel: {
    impressions: number;
    clicks: number;
    plays: number;
    completions: number;
    returns: number;
  };
  
  // Geographic
  topRegions: Array<{ region: string; players: number }>;
  
  // Device
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  
  // Tier Usage
  tierBreakdown: Record<GraphicsTierLevel, number>;
}

export default {};
