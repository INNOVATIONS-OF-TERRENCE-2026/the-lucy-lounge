/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY GAME SDK — CORE TYPE DEFINITIONS                                      │
 * │                                                                             │
 * │ The foundational type system for all Lucy Arcade games                     │
 * │                                                                             │
 * │ VERSION: 1.0.0                                                             │
 * │ AUTHOR: Lucy Arcade Platform                                               │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// ============================================================================
// GRAPHICS TIER SYSTEM (FORMAL SPEC)
// ============================================================================

/**
 * AAA Graphics Tier Classification
 * 
 * Tier S — Console / High-End PC (PS5, RTX 3080+)
 * Tier A — Desktop / Gaming Laptop (GTX 1070+)
 * Tier B — Tablet / Integrated Graphics
 * Tier C — Mobile / Low-End Devices
 */
export type GraphicsTierLevel = 'S' | 'A' | 'B' | 'C';

export interface GraphicsTierSpec {
  tier: GraphicsTierLevel;
  name: string;
  description: string;
  
  // Polygon Budgets
  maxTrianglesPerFrame: number;
  maxTrianglesPerObject: number;
  maxDrawCalls: number;
  
  // Texture Limits
  maxTextureResolution: number;
  textureAnisotropy: number;
  compressedTextures: boolean;
  
  // Shader Complexity
  shaderQuality: 'ultra' | 'high' | 'medium' | 'low';
  enablePBR: boolean;
  enableNormalMaps: boolean;
  enableParallaxMapping: boolean;
  
  // Shadows
  shadowMapResolution: number;
  shadowCascades: number;
  enableSoftShadows: boolean;
  
  // Lighting
  maxDynamicLights: number;
  enableVolumetricLighting: boolean;
  enableGlobalIllumination: boolean;
  enableSSAO: boolean;
  
  // Post-Processing
  enableBloom: boolean;
  enableMotionBlur: boolean;
  enableDOF: boolean;
  enableSSR: boolean;
  enableFXAA: boolean;
  enableTAA: boolean;
  
  // Particles
  maxParticlesPerSystem: number;
  maxActiveSystems: number;
  enableGPUParticles: boolean;
  
  // Physics
  physicsSubsteps: number;
  maxRigidBodies: number;
  
  // Resolution & FPS
  resolutionScale: number;
  targetFPS: number;
  minAcceptableFPS: number;
  
  // Memory
  maxVRAMMB: number;
  maxRAMMB: number;
}

// ============================================================================
// GAME CONFIGURATION
// ============================================================================

export interface LucyGameConfig {
  id: string;
  name: string;
  version: string;
  author: string;
  
  // Graphics Requirements
  minTier: GraphicsTierLevel;
  recommendedTier: GraphicsTierLevel;
  
  // Game Type
  gameType: GameType;
  genre: GameGenre;
  
  // Player Configuration
  minPlayers: number;
  maxPlayers: number;
  supportsAI: boolean;
  supportsPvP: boolean;
  supportsCoOp: boolean;
  supportsCrossplay: boolean;
  
  // Input Support
  inputMethods: InputMethod[];
  requiresPointerLock: boolean;
  
  // Network
  networkMode: NetworkMode;
  tickRate: number;
  
  // Monetization
  monetizationType: MonetizationType;
  
  // Metadata
  thumbnail: string;
  banner: string;
  description: string;
  tags: string[];
  ageRating: AgeRating;
}

export type GameType = 
  | 'fps'
  | 'tps' 
  | 'racing'
  | 'sports'
  | 'fighting'
  | 'strategy'
  | 'puzzle'
  | 'platformer'
  | 'rpg'
  | 'simulation'
  | 'party'
  | 'card'
  | 'board';

export type GameGenre =
  | 'action'
  | 'adventure'
  | 'arcade'
  | 'casual'
  | 'competitive'
  | 'educational'
  | 'horror'
  | 'music'
  | 'sandbox'
  | 'survival';

export type InputMethod = 
  | 'keyboard'
  | 'mouse'
  | 'touch'
  | 'gamepad_xbox'
  | 'gamepad_playstation'
  | 'gamepad_generic';

export type NetworkMode =
  | 'offline'
  | 'local_multiplayer'
  | 'online_pvp'
  | 'online_coop'
  | 'mmo';

export type MonetizationType =
  | 'free'
  | 'premium'
  | 'freemium'
  | 'cosmetic_only'
  | 'tournament_entry';

export type AgeRating = 'E' | 'E10' | 'T' | 'M';

// ============================================================================
// PLAYER & SESSION
// ============================================================================

export interface LucyPlayer {
  id: string;
  displayName: string;
  avatarUrl: string;
  
  // Progression
  level: number;
  totalXP: number;
  coins: number;
  
  // Stats
  stats: PlayerStats;
  
  // Ranking
  mmr: number;
  rank: PlayerRank;
  rankTier: number;
  
  // Social
  isOnline: boolean;
  lastSeen: number;
  
  // Input
  preferredInput: InputMethod;
  gamepadIndex?: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  killDeathRatio?: number;
  avgScore: number;
  playtimeHours: number;
}

export interface PlayerRank {
  name: string;
  tier: number;
  division: number;
  icon: string;
}

export interface GameSession {
  id: string;
  gameId: string;
  
  // Players
  players: SessionPlayer[];
  maxPlayers: number;
  
  // State
  state: SessionState;
  mode: GameModeType;
  
  // Timing
  startedAt: number;
  duration: number;
  pausedAt?: number;
  
  // Network
  isHost: boolean;
  hostId: string;
  tickRate: number;
  
  // Match Data
  scores: Record<string, number>;
  gameState: any;
  eventLog: GameEvent[];
}

export interface SessionPlayer {
  player: LucyPlayer;
  team: number;
  slot: number;
  isReady: boolean;
  isConnected: boolean;
  latency: number;
  inputState: InputSnapshot;
}

export type SessionState = 
  | 'lobby'
  | 'loading'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'overtime'
  | 'finished'
  | 'abandoned';

export type GameModeType =
  | 'casual'
  | 'ranked'
  | 'tournament'
  | 'practice'
  | 'custom';

// ============================================================================
// INPUT SYSTEM
// ============================================================================

export interface InputSnapshot {
  timestamp: number;
  tick: number;
  
  // Movement
  moveX: number;
  moveY: number;
  lookX: number;
  lookY: number;
  
  // Actions (bitfield)
  buttons: number;
  
  // Raw States
  keyboard: KeyboardState;
  mouse: MouseState;
  gamepad?: GamepadState;
  touch?: TouchState;
}

export interface KeyboardState {
  keysDown: Set<string>;
  keysJustPressed: Set<string>;
  keysJustReleased: Set<string>;
}

export interface MouseState {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  buttons: number;
  wheel: number;
  locked: boolean;
}

export interface GamepadState {
  index: number;
  connected: boolean;
  
  // Axes (normalized -1 to 1)
  leftStickX: number;
  leftStickY: number;
  rightStickX: number;
  rightStickY: number;
  leftTrigger: number;
  rightTrigger: number;
  
  // Buttons
  buttons: boolean[];
  
  // Vibration
  canVibrate: boolean;
}

export interface TouchState {
  touches: Touch[];
  gestures: Gesture[];
}

export interface Touch {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  pressure: number;
  timestamp: number;
}

export interface Gesture {
  type: 'tap' | 'double_tap' | 'long_press' | 'swipe' | 'pinch' | 'rotate';
  data: any;
}

// ============================================================================
// NETWORKING
// ============================================================================

export interface NetworkPacket {
  type: PacketType;
  tick: number;
  timestamp: number;
  senderId: string;
  data: any;
  reliable: boolean;
  channel: number;
}

export type PacketType =
  | 'input'
  | 'state_snapshot'
  | 'state_delta'
  | 'event'
  | 'rpc'
  | 'ping'
  | 'pong'
  | 'ack';

export interface NetworkState {
  isConnected: boolean;
  isHost: boolean;
  latency: number;
  jitter: number;
  packetLoss: number;
  
  // Sync
  serverTick: number;
  clientTick: number;
  tickOffset: number;
  
  // Bandwidth
  bytesSent: number;
  bytesReceived: number;
  packetsPerSecond: number;
}

export interface SyncedEntity {
  entityId: string;
  ownerId: string;
  type: string;
  
  // Transform
  position: Vector3;
  rotation: Quaternion;
  velocity: Vector3;
  angularVelocity: Vector3;
  
  // State
  state: Record<string, any>;
  
  // Interpolation
  interpolationBuffer: InterpolationSnapshot[];
  lastUpdate: number;
}

export interface InterpolationSnapshot {
  tick: number;
  timestamp: number;
  position: Vector3;
  rotation: Quaternion;
  state: Record<string, any>;
}

// ============================================================================
// PHYSICS (DETERMINISTIC)
// ============================================================================

export interface PhysicsConfig {
  gravity: Vector3;
  fixedTimestep: number;
  maxSubsteps: number;
  
  // Collision
  collisionIterations: number;
  contactOffset: number;
  
  // Determinism
  useDeterministicMode: boolean;
  randomSeed: number;
  
  // Performance
  broadphaseType: 'naive' | 'sweep_and_prune' | 'bvh';
  sleepThreshold: number;
}

export interface RigidBodyConfig {
  type: 'static' | 'dynamic' | 'kinematic';
  mass: number;
  friction: number;
  restitution: number;
  linearDamping: number;
  angularDamping: number;
  collisionGroup: number;
  collisionMask: number;
}

export interface ColliderShape {
  type: 'box' | 'sphere' | 'capsule' | 'cylinder' | 'convex' | 'trimesh';
  dimensions: Vector3 | number;
  offset?: Vector3;
  rotation?: Quaternion;
}

// ============================================================================
// AUDIO
// ============================================================================

export interface AudioConfig {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  ambientVolume: number;
  voiceVolume: number;
  
  // Spatial
  spatialEnabled: boolean;
  listenerPosition: Vector3;
  listenerForward: Vector3;
  listenerUp: Vector3;
  
  // Quality
  sampleRate: number;
  latencyHint: 'interactive' | 'balanced' | 'playback';
}

export interface SoundEffect {
  id: string;
  url: string;
  volume: number;
  pitch: number;
  loop: boolean;
  spatial: boolean;
  position?: Vector3;
  minDistance?: number;
  maxDistance?: number;
  rolloffFactor?: number;
}

export interface MusicTrack {
  id: string;
  url: string;
  layers?: string[];
  bpm?: number;
  loopStart?: number;
  loopEnd?: number;
  fadeInDuration: number;
  fadeOutDuration: number;
}

// ============================================================================
// AI SYSTEM
// ============================================================================

export type AIPersonalityType =
  | 'aggressive'
  | 'defensive'
  | 'tactical'
  | 'adaptive'
  | 'unpredictable'
  | 'supportive';

export interface AIConfig {
  personality: AIPersonalityType;
  difficulty: AIDifficulty;
  
  // Behavior Weights
  aggressionWeight: number;
  defensivenessWeight: number;
  objectiveWeight: number;
  
  // Reaction
  reactionTimeBase: number;
  reactionTimeVariance: number;
  
  // Accuracy
  aimAccuracyBase: number;
  aimAccuracyVariance: number;
  
  // Learning
  adaptToPlayer: boolean;
  learningRate: number;
  memoryDuration: number;
}

export interface AIDifficulty {
  level: 'easy' | 'medium' | 'hard' | 'expert' | 'nightmare';
  
  // Scaling factors (0-1)
  reactionMultiplier: number;
  accuracyMultiplier: number;
  decisionQuality: number;
  predictionAccuracy: number;
  
  // MMR-based scaling
  targetMMR?: number;
  mmrVariance?: number;
}

export interface AIState {
  entityId: string;
  personality: AIPersonalityType;
  
  // Current Goals
  primaryGoal: AIGoal;
  secondaryGoals: AIGoal[];
  
  // Memory
  knownEntities: AIMemoryEntity[];
  threatLevel: number;
  lastDecisionTime: number;
  
  // Behavior Tree
  currentNode: string;
  blackboard: Record<string, any>;
}

export interface AIGoal {
  type: string;
  target?: string;
  priority: number;
  progress: number;
  timeout: number;
}

export interface AIMemoryEntity {
  entityId: string;
  lastSeenPosition: Vector3;
  lastSeenTime: number;
  threatLevel: number;
  movementPattern: Vector3[];
  predictedPosition?: Vector3;
}

// ============================================================================
// EVENTS
// ============================================================================

export interface GameEvent {
  id: string;
  type: string;
  timestamp: number;
  tick: number;
  playerId?: string;
  data: any;
  
  // Replay
  isReplayable: boolean;
  undoData?: any;
}

export type EventCallback = (event: GameEvent) => void;

// ============================================================================
// MATH TYPES
// ============================================================================

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Matrix4 {
  elements: number[];
}

export interface Transform {
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
}

export interface BoundingBox {
  min: Vector3;
  max: Vector3;
}

export interface Ray {
  origin: Vector3;
  direction: Vector3;
}

// ============================================================================
// MATCHMAKING & ESPORTS
// ============================================================================

export interface MatchmakingRequest {
  playerId: string;
  gameId: string;
  mode: GameModeType;
  region: string;
  partyMembers?: string[];
  
  // Preferences
  preferredServer?: string;
  maxLatency?: number;
  
  // Skill
  mmr: number;
  mmrRange: number;
}

export interface MatchmakingTicket {
  id: string;
  status: MatchmakingStatus;
  request: MatchmakingRequest;
  
  // Progress
  searchTimeSeconds: number;
  expandedRange: number;
  
  // Result
  matchId?: string;
  serverAddress?: string;
  error?: string;
}

export type MatchmakingStatus =
  | 'searching'
  | 'expanding'
  | 'found'
  | 'connecting'
  | 'ready'
  | 'cancelled'
  | 'error';

export interface TournamentConfig {
  id: string;
  name: string;
  gameId: string;
  
  // Format
  format: TournamentFormat;
  maxParticipants: number;
  teamSize: number;
  
  // Scheduling
  registrationStart: number;
  registrationEnd: number;
  startTime: number;
  
  // Rules
  bestOf: number;
  allowedMaps?: string[];
  
  // Prizes
  prizePool: number;
  prizeDistribution: number[];
  
  // Entry
  entryFee: number;
  minRank?: PlayerRank;
}

export type TournamentFormat =
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'swiss'
  | 'ladder';

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  
  // Teams
  team1Id: string;
  team2Id: string;
  
  // Status
  status: TournamentMatchStatus;
  scheduledTime: number;
  
  // Results
  team1Score: number;
  team2Score: number;
  winnerId?: string;
  
  // VOD
  replayId?: string;
  vodUrl?: string;
}

export type TournamentMatchStatus =
  | 'scheduled'
  | 'check_in'
  | 'live'
  | 'completed'
  | 'disputed'
  | 'forfeited';

// ============================================================================
// SPECTATOR & REPLAY
// ============================================================================

export interface SpectatorState {
  matchId: string;
  viewMode: SpectatorViewMode;
  followPlayerId?: string;
  
  // Camera
  cameraPosition: Vector3;
  cameraTarget: Vector3;
  cameraFov: number;
  
  // UI
  showHUD: boolean;
  showPlayerNames: boolean;
  showKillFeed: boolean;
  showMinimap: boolean;
  
  // Stream
  delay: number;
  quality: 'low' | 'medium' | 'high' | 'source';
}

export type SpectatorViewMode =
  | 'free_cam'
  | 'first_person'
  | 'third_person'
  | 'overhead'
  | 'director';

export interface ReplayData {
  id: string;
  matchId: string;
  gameId: string;
  
  // Metadata
  recordedAt: number;
  duration: number;
  version: string;
  
  // Players
  players: ReplayPlayer[];
  
  // Data
  tickRate: number;
  totalTicks: number;
  snapshots: ReplaySnapshot[];
  events: GameEvent[];
  
  // Compression
  compressed: boolean;
  sizeBytes: number;
}

export interface ReplayPlayer {
  id: string;
  displayName: string;
  team: number;
  finalScore: number;
}

export interface ReplaySnapshot {
  tick: number;
  timestamp: number;
  entities: SyncedEntity[];
  gameState: any;
}

// ============================================================================
// CREATOR STUDIO
// ============================================================================

export interface CreatorGameProject {
  id: string;
  creatorId: string;
  name: string;
  
  // Template
  template: GameTemplate;
  
  // Config
  config: LucyGameConfig;
  
  // Assets
  assets: CreatorAsset[];
  
  // Code
  scripts: CreatorScript[];
  
  // State
  status: ProjectStatus;
  version: string;
  
  // Publishing
  publishedVersion?: string;
  publishedAt?: number;
  
  // Analytics
  plays: number;
  ratings: number;
  avgRating: number;
  revenue: number;
}

export type GameTemplate =
  | 'fps_arena'
  | 'fps_battle_royale'
  | 'racing_circuit'
  | 'racing_open_world'
  | 'sports_team'
  | 'sports_solo'
  | 'strategy_rts'
  | 'strategy_turn_based'
  | 'puzzle_match3'
  | 'puzzle_physics'
  | 'platformer_2d'
  | 'platformer_3d'
  | 'party_minigames'
  | 'custom';

export type ProjectStatus =
  | 'draft'
  | 'testing'
  | 'review'
  | 'published'
  | 'archived';

export interface CreatorAsset {
  id: string;
  type: AssetType;
  name: string;
  url: string;
  sizeBytes: number;
  metadata: Record<string, any>;
}

export type AssetType =
  | 'model_3d'
  | 'texture'
  | 'audio_sfx'
  | 'audio_music'
  | 'animation'
  | 'font'
  | 'shader'
  | 'script'
  | 'map';

export interface CreatorScript {
  id: string;
  name: string;
  type: ScriptType;
  code: string;
  compiledCode?: string;
  errors?: ScriptError[];
}

export type ScriptType =
  | 'game_logic'
  | 'player_controller'
  | 'ai_behavior'
  | 'ui_controller'
  | 'effect';

export interface ScriptError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// ============================================================================
// MONETIZATION
// ============================================================================

export interface CreatorEarnings {
  creatorId: string;
  gameId: string;
  
  // Revenue
  totalRevenue: number;
  totalPayouts: number;
  pendingPayout: number;
  
  // Breakdown
  premiumSales: number;
  cosmetics: number;
  tournamentEntries: number;
  tips: number;
  
  // Stats
  totalPlays: number;
  uniquePlayers: number;
  avgSessionLength: number;
}

export interface Cosmetic {
  id: string;
  gameId: string;
  type: CosmeticType;
  name: string;
  description: string;
  price: number;
  rarity: CosmeticRarity;
  previewUrl: string;
  assetUrl: string;
}

export type CosmeticType =
  | 'skin'
  | 'weapon_skin'
  | 'vehicle_skin'
  | 'emote'
  | 'trail'
  | 'profile_frame'
  | 'title';

export type CosmeticRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

// ============================================================================
// ANALYTICS
// ============================================================================

export interface GameAnalytics {
  gameId: string;
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
  
  // Engagement
  retention1Day: number;
  retention7Day: number;
  retention30Day: number;
  
  // Performance
  avgFPS: number;
  crashRate: number;
  loadTimeAvg: number;
  
  // Progression
  completionRate: number;
  avgLevel: number;
  
  // Social
  shareCount: number;
  inviteCount: number;
}

export default {
  // Re-export all types
};
