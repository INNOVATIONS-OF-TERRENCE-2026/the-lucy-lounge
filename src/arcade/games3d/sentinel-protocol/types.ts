/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY: SENTINEL PROTOCOL — TYPE DEFINITIONS                                  │
 * │                                                                             │
 * │ AAA-grade flagship FPS game type system                                    │
 * │ Comprehensive types for all game systems                                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import type { PhysicsBody, CharacterController } from '../../engine3d';

// ============================================================================
// GAME MODES
// ============================================================================

export type GameMode = 
  | 'campaign'
  | 'arena_pvp'
  | 'coop_survival'
  | 'training'
  | 'custom';

export interface GameModeConfig {
  id: GameMode;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  supportsAI: boolean;
  supportsPvP: boolean;
  hasObjectives: boolean;
  timeLimit?: number;
  scoreLimit?: number;
  respawnEnabled: boolean;
  respawnTime: number;
}

export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  campaign: {
    id: 'campaign',
    name: 'Campaign',
    description: 'AI-driven narrative missions with story progression',
    minPlayers: 1,
    maxPlayers: 4,
    supportsAI: true,
    supportsPvP: false,
    hasObjectives: true,
    respawnEnabled: false,
    respawnTime: 0,
  },
  arena_pvp: {
    id: 'arena_pvp',
    name: 'Arena PvP',
    description: 'Competitive player vs player combat',
    minPlayers: 2,
    maxPlayers: 16,
    supportsAI: true,
    supportsPvP: true,
    hasObjectives: false,
    timeLimit: 600,
    scoreLimit: 50,
    respawnEnabled: true,
    respawnTime: 5,
  },
  coop_survival: {
    id: 'coop_survival',
    name: 'Co-Op Survival',
    description: 'Team up against waves of AI enemies',
    minPlayers: 1,
    maxPlayers: 4,
    supportsAI: true,
    supportsPvP: false,
    hasObjectives: true,
    respawnEnabled: true,
    respawnTime: 10,
  },
  training: {
    id: 'training',
    name: 'Training Grounds',
    description: 'Master aim, movement, and abilities',
    minPlayers: 1,
    maxPlayers: 1,
    supportsAI: true,
    supportsPvP: false,
    hasObjectives: false,
    respawnEnabled: true,
    respawnTime: 0,
  },
  custom: {
    id: 'custom',
    name: 'Custom Match',
    description: 'Create your own rules',
    minPlayers: 1,
    maxPlayers: 16,
    supportsAI: true,
    supportsPvP: true,
    hasObjectives: true,
    respawnEnabled: true,
    respawnTime: 5,
  },
};

// ============================================================================
// WEAPONS
// ============================================================================

export type WeaponCategory = 'pistol' | 'smg' | 'rifle' | 'shotgun' | 'sniper' | 'heavy' | 'melee' | 'explosive';
export type AmmoType = 'light' | 'medium' | 'heavy' | 'shells' | 'rockets' | 'energy';
export type FireMode = 'auto' | 'semi' | 'burst';

export interface WeaponDefinition {
  id: string;
  name: string;
  category: WeaponCategory;
  ammoType: AmmoType;
  fireMode: FireMode;
  burstCount?: number;
  
  // Damage
  baseDamage: number;
  headshotMultiplier: number;
  limbDamageMultiplier: number;
  damageDropoffStart: number;
  damageDropoffEnd: number;
  minDamagePercent: number;
  
  // Ballistics
  bulletSpeed: number;
  bulletDrop: number;
  penetration: number; // 0-1, ability to penetrate cover
  
  // Fire rate
  fireRate: number; // RPM
  
  // Magazine
  magazineSize: number;
  reloadTime: number;
  reloadType: 'magazine' | 'shell' | 'belt';
  
  // Accuracy
  baseSpread: number;
  moveSpreadPenalty: number;
  jumpSpreadPenalty: number;
  adsSpreadBonus: number;
  spreadRecoveryRate: number;
  maxSpread: number;
  
  // Recoil
  recoilVertical: number;
  recoilHorizontal: number;
  recoilRecoveryRate: number;
  
  // ADS
  adsZoomLevel: number;
  adsTime: number;
  
  // Special
  pelletCount?: number; // For shotguns
  chargeTime?: number; // For charge weapons
  
  // Audio/Visual
  muzzleFlashSize: number;
  tracerFrequency: number;
}

export interface WeaponState {
  definition: WeaponDefinition;
  currentAmmo: number;
  reserveAmmo: number;
  isReloading: boolean;
  reloadProgress: number;
  lastFireTime: number;
  currentSpread: number;
  currentRecoil: THREE.Vector2;
  isAiming: boolean;
  aimProgress: number;
}

// ============================================================================
// PLAYER
// ============================================================================

export type MovementState = 
  | 'idle'
  | 'walking'
  | 'sprinting'
  | 'crouching'
  | 'sliding'
  | 'jumping'
  | 'falling'
  | 'vaulting'
  | 'climbing'
  | 'swimming';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  stamina: number;
  maxStamina: number;
}

export interface PlayerMovement {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  state: MovementState;
  isGrounded: boolean;
  slideTime: number;
  vaultProgress: number;
  lastJumpTime: number;
  coyoteTime: number;
  jumpBufferTime: number;
}

export interface PlayerInput {
  move: THREE.Vector2;
  look: THREE.Vector2;
  fire: boolean;
  firePressed: boolean;
  aim: boolean;
  reload: boolean;
  jump: boolean;
  jumpPressed: boolean;
  crouch: boolean;
  sprint: boolean;
  interact: boolean;
  ability1: boolean;
  ability2: boolean;
  melee: boolean;
  grenade: boolean;
  weaponSwitch: number; // -1, 0, 1, 2, 3...
}

export interface Player {
  id: string;
  name: string;
  team: 'alpha' | 'bravo' | 'spectator';
  stats: PlayerStats;
  movement: PlayerMovement;
  weapons: WeaponState[];
  currentWeaponIndex: number;
  abilities: AbilityState[];
  grenades: GrenadeState;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  isAlive: boolean;
  respawnTime: number;
  characterController?: CharacterController;
}

// ============================================================================
// ABILITIES
// ============================================================================

export type AbilityType = 
  | 'dash'
  | 'shield'
  | 'scan'
  | 'heal'
  | 'cloak'
  | 'trap'
  | 'turret'
  | 'flash'
  | 'smoke';

export interface AbilityDefinition {
  id: AbilityType;
  name: string;
  description: string;
  cooldown: number;
  duration: number;
  charges: number;
  chargeRegenTime: number;
}

export interface AbilityState {
  definition: AbilityDefinition;
  currentCharges: number;
  cooldownRemaining: number;
  isActive: boolean;
  activeTime: number;
}

export interface GrenadeState {
  fragCount: number;
  flashCount: number;
  smokeCount: number;
  maxFrag: number;
  maxFlash: number;
  maxSmoke: number;
}

// ============================================================================
// AI SYSTEM
// ============================================================================

export type AIPersonality = 
  | 'aggressive_rusher'
  | 'tactical_flanker'
  | 'defensive_anchor'
  | 'adaptive_hunter'
  | 'support_medic'
  | 'sniper_overwatch';

export interface AIPersonalityConfig {
  id: AIPersonality;
  name: string;
  description: string;
  
  // Combat behavior
  engagementRange: number;
  preferredRange: number;
  retreatHealthPercent: number;
  aggression: number; // 0-1
  patience: number; // 0-1
  
  // Movement
  flanksFrequency: number; // 0-1
  usesCovertFrequency: number; // 0-1
  rushFrequency: number; // 0-1
  
  // Accuracy scaling
  baseAccuracy: number; // 0-1
  accuracyVariance: number;
  
  // Reaction
  baseReactionTime: number; // seconds
  reactionTimeVariance: number;
  
  // Decision making
  decisionFrequency: number; // How often to reconsider actions
  predictsMovesMent: boolean;
  usesGrenades: boolean;
  callsTargets: boolean;
}

export const AI_PERSONALITIES: Record<AIPersonality, AIPersonalityConfig> = {
  aggressive_rusher: {
    id: 'aggressive_rusher',
    name: 'Aggressive Rusher',
    description: 'Charges forward with overwhelming aggression',
    engagementRange: 30,
    preferredRange: 8,
    retreatHealthPercent: 0.15,
    aggression: 0.95,
    patience: 0.1,
    flanksFrequency: 0.2,
    usesCovertFrequency: 0.1,
    rushFrequency: 0.9,
    baseAccuracy: 0.6,
    accuracyVariance: 0.15,
    baseReactionTime: 0.15,
    reactionTimeVariance: 0.05,
    decisionFrequency: 0.3,
    predictsMovesMent: false,
    usesGrenades: true,
    callsTargets: true,
  },
  tactical_flanker: {
    id: 'tactical_flanker',
    name: 'Tactical Flanker',
    description: 'Uses positioning and flanking to gain advantage',
    engagementRange: 40,
    preferredRange: 15,
    retreatHealthPercent: 0.35,
    aggression: 0.6,
    patience: 0.7,
    flanksFrequency: 0.85,
    usesCovertFrequency: 0.7,
    rushFrequency: 0.2,
    baseAccuracy: 0.75,
    accuracyVariance: 0.1,
    baseReactionTime: 0.2,
    reactionTimeVariance: 0.08,
    decisionFrequency: 0.5,
    predictsMovesMent: true,
    usesGrenades: true,
    callsTargets: true,
  },
  defensive_anchor: {
    id: 'defensive_anchor',
    name: 'Defensive Anchor',
    description: 'Holds position and controls areas with precision',
    engagementRange: 50,
    preferredRange: 25,
    retreatHealthPercent: 0.25,
    aggression: 0.3,
    patience: 0.9,
    flanksFrequency: 0.1,
    usesCovertFrequency: 0.8,
    rushFrequency: 0.05,
    baseAccuracy: 0.85,
    accuracyVariance: 0.05,
    baseReactionTime: 0.25,
    reactionTimeVariance: 0.1,
    decisionFrequency: 1.0,
    predictsMovesMent: true,
    usesGrenades: true,
    callsTargets: true,
  },
  adaptive_hunter: {
    id: 'adaptive_hunter',
    name: 'Adaptive Hunter',
    description: 'Learns and adapts to player patterns',
    engagementRange: 45,
    preferredRange: 18,
    retreatHealthPercent: 0.3,
    aggression: 0.7,
    patience: 0.5,
    flanksFrequency: 0.5,
    usesCovertFrequency: 0.5,
    rushFrequency: 0.4,
    baseAccuracy: 0.7,
    accuracyVariance: 0.12,
    baseReactionTime: 0.18,
    reactionTimeVariance: 0.06,
    decisionFrequency: 0.4,
    predictsMovesMent: true,
    usesGrenades: true,
    callsTargets: true,
  },
  support_medic: {
    id: 'support_medic',
    name: 'Support Medic',
    description: 'Prioritizes healing and supporting teammates',
    engagementRange: 35,
    preferredRange: 20,
    retreatHealthPercent: 0.4,
    aggression: 0.4,
    patience: 0.8,
    flanksFrequency: 0.3,
    usesCovertFrequency: 0.6,
    rushFrequency: 0.15,
    baseAccuracy: 0.65,
    accuracyVariance: 0.1,
    baseReactionTime: 0.22,
    reactionTimeVariance: 0.08,
    decisionFrequency: 0.6,
    predictsMovesMent: false,
    usesGrenades: true,
    callsTargets: true,
  },
  sniper_overwatch: {
    id: 'sniper_overwatch',
    name: 'Sniper Overwatch',
    description: 'Long-range precision elimination',
    engagementRange: 100,
    preferredRange: 50,
    retreatHealthPercent: 0.5,
    aggression: 0.2,
    patience: 0.95,
    flanksFrequency: 0.4,
    usesCovertFrequency: 0.9,
    rushFrequency: 0.02,
    baseAccuracy: 0.92,
    accuracyVariance: 0.03,
    baseReactionTime: 0.4,
    reactionTimeVariance: 0.15,
    decisionFrequency: 1.5,
    predictsMovesMent: true,
    usesGrenades: false,
    callsTargets: true,
  },
};

export interface AIMemory {
  lastSeenPlayerPosition: THREE.Vector3 | null;
  lastSeenTime: number;
  playerMovementPattern: THREE.Vector3[];
  predictedPosition: THREE.Vector3 | null;
  knownCoverPositions: THREE.Vector3[];
  dangerZones: THREE.Vector3[];
  teammatePositions: Map<string, THREE.Vector3>;
  killCount: number;
  deathCount: number;
  damageDealt: number;
  damageTaken: number;
}

export interface AIState {
  personality: AIPersonalityConfig;
  currentBehavior: 'engage' | 'flank' | 'retreat' | 'hold' | 'patrol' | 'search' | 'support';
  targetId: string | null;
  targetPosition: THREE.Vector3 | null;
  moveTarget: THREE.Vector3 | null;
  lastDecisionTime: number;
  reactionTimer: number;
  memory: AIMemory;
  difficultyMultiplier: number;
}

// ============================================================================
// PROJECTILES & DAMAGE
// ============================================================================

export interface Projectile {
  id: string;
  mesh: THREE.Mesh;
  body: PhysicsBody;
  velocity: THREE.Vector3;
  owner: string;
  weapon: WeaponDefinition;
  damage: number;
  penetration: number;
  lifetime: number;
  hasHit: boolean;
  trailEnabled: boolean;
}

export interface HitInfo {
  target: string;
  damage: number;
  isHeadshot: boolean;
  isLimbshot: boolean;
  hitPosition: THREE.Vector3;
  hitNormal: THREE.Vector3;
  distance: number;
  penetrated: boolean;
}

export type DamageType = 'bullet' | 'explosive' | 'melee' | 'fall' | 'environmental';

export interface DamageEvent {
  sourceId: string;
  targetId: string;
  amount: number;
  type: DamageType;
  position: THREE.Vector3;
  isHeadshot: boolean;
  weaponId?: string;
  timestamp: number;
}

// ============================================================================
// MAP & OBJECTIVES
// ============================================================================

export interface SpawnPoint {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  team: 'alpha' | 'bravo' | 'neutral';
  type: 'initial' | 'respawn';
}

export interface CoverPoint {
  position: THREE.Vector3;
  normal: THREE.Vector3;
  size: 'small' | 'medium' | 'large';
  canCrouchBehind: boolean;
  canStandBehind: boolean;
}

export interface ObjectiveZone {
  id: string;
  type: 'capture' | 'defend' | 'extract' | 'plant' | 'defuse';
  position: THREE.Vector3;
  radius: number;
  team: 'alpha' | 'bravo' | 'neutral';
  progress: number; // 0-1
  isActive: boolean;
  captureRate: number;
}

export interface MapDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  size: 'small' | 'medium' | 'large';
  supportedModes: GameMode[];
  spawnPoints: SpawnPoint[];
  coverPoints: CoverPoint[];
  objectives: ObjectiveZone[];
  ambientLight: number;
  skybox: string;
}

// ============================================================================
// MATCH STATE
// ============================================================================

export interface MatchState {
  id: string;
  mode: GameMode;
  map: MapDefinition;
  phase: 'warmup' | 'active' | 'overtime' | 'ended';
  timeRemaining: number;
  round: number;
  maxRounds: number;
  scores: {
    alpha: number;
    bravo: number;
  };
  players: Map<string, Player>;
  spectators: string[];
  projectiles: Projectile[];
  damageEvents: DamageEvent[];
  objectives: ObjectiveZone[];
  killFeed: KillFeedEntry[];
}

export interface KillFeedEntry {
  killerId: string;
  killerName: string;
  victimId: string;
  victimName: string;
  weaponId: string;
  isHeadshot: boolean;
  timestamp: number;
}

// ============================================================================
// CAMPAIGN / MISSION
// ============================================================================

export interface MissionObjective {
  id: string;
  type: 'eliminate' | 'reach' | 'defend' | 'collect' | 'escort' | 'survive';
  description: string;
  target?: string;
  position?: THREE.Vector3;
  count?: number;
  currentCount?: number;
  timeLimit?: number;
  isComplete: boolean;
  isOptional: boolean;
}

export interface MissionDefinition {
  id: string;
  name: string;
  description: string;
  briefing: string;
  difficulty: 'recruit' | 'regular' | 'hardened' | 'veteran';
  map: string;
  objectives: MissionObjective[];
  waves?: WaveDefinition[];
  rewards: {
    xp: number;
    coins: number;
    unlocks?: string[];
  };
}

export interface WaveDefinition {
  id: number;
  enemyCount: number;
  enemyTypes: { type: string; count: number; personality: AIPersonality }[];
  spawnDelay: number;
  waveDelay: number;
  bonusObjective?: MissionObjective;
}

// ============================================================================
// TRAINING
// ============================================================================

export interface TrainingDrill {
  id: string;
  name: string;
  category: 'aim' | 'movement' | 'ability' | 'tactics';
  description: string;
  targetScore: number;
  timeLimit?: number;
  metrics: string[];
}

export interface TrainingResult {
  drillId: string;
  score: number;
  accuracy: number;
  headshots: number;
  timeToComplete: number;
  rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

// ============================================================================
// UI / HUD
// ============================================================================

export interface HUDState {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  stamina: number;
  maxStamina: number;
  ammo: number;
  maxAmmo: number;
  reserveAmmo: number;
  weaponName: string;
  isReloading: boolean;
  reloadProgress: number;
  crosshairSpread: number;
  hitMarker: boolean;
  killConfirmed: boolean;
  damageIndicators: DamageIndicator[];
  killfeed: KillFeedEntry[];
  objectives: ObjectiveHUD[];
  teammates: TeammateHUD[];
  score: { alpha: number; bravo: number };
  time: number;
  round: number;
}

export interface DamageIndicator {
  direction: number; // radians
  intensity: number;
  lifetime: number;
}

export interface ObjectiveHUD {
  id: string;
  name: string;
  icon: string;
  progress?: number;
  distance?: number;
  direction?: THREE.Vector3;
}

export interface TeammateHUD {
  name: string;
  health: number;
  distance: number;
  direction: THREE.Vector3;
  isDown: boolean;
}
