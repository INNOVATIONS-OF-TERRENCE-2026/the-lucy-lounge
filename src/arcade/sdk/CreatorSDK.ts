/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — CREATOR SDK                                                   │
 * │                                                                             │
 * │ Build custom FPS maps, weapons, and game modes                             │
 * │                                                                             │
 * │ FEATURES:                                                                  │
 * │ • Visual map editor with drag-and-drop                                     │
 * │ • Weapon creation and balancing tools                                      │
 * │ • Custom game mode scripting                                               │
 * │ • Asset library and marketplace integration                                │
 * │ • Publish to competitive playlists                                         │
 * │ • Revenue sharing for creators                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

export interface CreatorProject {
  id: string;
  creatorId: string;
  type: 'map' | 'weapon' | 'gamemode' | 'character' | 'bundle';
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'testing' | 'review' | 'published' | 'rejected';
  visibility: 'private' | 'unlisted' | 'public' | 'competitive';
  
  // Data
  data: MapData | WeaponData | GameModeData | CharacterData | BundleData;
  assets: CreatorAsset[];
  
  // Stats
  plays: number;
  likes: number;
  rating: number;
  revenue: number;
  
  // Meta
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  tags: string[];
  thumbnail?: string;
}

export interface CreatorAsset {
  id: string;
  type: 'model' | 'texture' | 'audio' | 'script' | 'material';
  name: string;
  url: string;
  fileSize: number;
  format: string;
  metadata: Record<string, any>;
}

// ============================================================================
// MAP DATA
// ============================================================================

export interface MapData {
  name: string;
  description: string;
  size: 'small' | 'medium' | 'large' | 'massive';
  theme: MapTheme;
  supportedModes: string[];
  supportedPlayers: { min: number; max: number };
  
  // Geometry
  terrain: TerrainData;
  structures: StructureData[];
  props: PropData[];
  
  // Gameplay
  spawnPoints: SpawnPointData[];
  coverPoints: CoverPointData[];
  objectives: ObjectiveData[];
  weapons: WeaponSpawnData[];
  vehicles: VehicleSpawnData[];
  
  // Environment
  lighting: LightingData;
  skybox: SkyboxData;
  weather: WeatherData;
  audio: MapAudioData;
  
  // Bounds
  playableBounds: { min: THREE.Vector3; max: THREE.Vector3 };
  killZones: KillZoneData[];
  
  // Navigation
  navMesh?: NavMeshData;
  aiWaypoints: WaypointData[];
}

export type MapTheme = 
  | 'urban'
  | 'industrial'
  | 'military'
  | 'nature'
  | 'sci_fi'
  | 'desert'
  | 'snow'
  | 'underwater'
  | 'space'
  | 'custom';

export interface TerrainData {
  type: 'flat' | 'heightmap' | 'procedural';
  heightmapUrl?: string;
  size: { width: number; depth: number };
  segments: number;
  material: MaterialData;
  layers?: TerrainLayerData[];
}

export interface TerrainLayerData {
  texture: string;
  normalMap?: string;
  scale: number;
  blendStart: number;
  blendEnd: number;
}

export interface StructureData {
  id: string;
  name: string;
  type: 'building' | 'wall' | 'platform' | 'ramp' | 'bridge' | 'custom';
  modelUrl?: string;
  primitiveType?: 'box' | 'cylinder' | 'sphere';
  
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  
  material: MaterialData;
  collision: CollisionData;
  destructible: boolean;
  health?: number;
}

export interface PropData {
  id: string;
  type: 'static' | 'physics' | 'interactive';
  modelUrl: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  collision: CollisionData;
  interactable?: boolean;
  interactAction?: string;
}

export interface MaterialData {
  type: 'standard' | 'pbr' | 'unlit' | 'custom';
  color?: string;
  textureUrl?: string;
  normalMapUrl?: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  opacity?: number;
}

export interface CollisionData {
  type: 'box' | 'sphere' | 'mesh' | 'convex' | 'none';
  isTrigger: boolean;
  layer: string;
}

export interface SpawnPointData {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  team: 'alpha' | 'bravo' | 'neutral' | 'ffa';
  type: 'initial' | 'respawn' | 'vehicle';
  priority: number;
}

export interface CoverPointData {
  position: { x: number; y: number; z: number };
  normal: { x: number; y: number; z: number };
  height: 'crouch' | 'stand';
  width: number;
}

export interface ObjectiveData {
  id: string;
  type: 'capture' | 'payload' | 'bomb' | 'ctf' | 'koth' | 'custom';
  name: string;
  position: { x: number; y: number; z: number };
  radius: number;
  team?: string;
  settings: Record<string, any>;
}

export interface WeaponSpawnData {
  id: string;
  weaponId: string;
  position: { x: number; y: number; z: number };
  respawnTime: number;
}

export interface VehicleSpawnData {
  id: string;
  vehicleId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  respawnTime: number;
  team?: string;
}

export interface LightingData {
  ambientColor: string;
  ambientIntensity: number;
  
  directionalLights: DirectionalLightData[];
  pointLights: PointLightData[];
  spotLights: SpotLightData[];
  
  shadows: boolean;
  shadowQuality: 'low' | 'medium' | 'high' | 'ultra';
  
  fog?: {
    type: 'linear' | 'exponential';
    color: string;
    near?: number;
    far?: number;
    density?: number;
  };
}

export interface DirectionalLightData {
  color: string;
  intensity: number;
  position: { x: number; y: number; z: number };
  castShadow: boolean;
}

export interface PointLightData {
  color: string;
  intensity: number;
  position: { x: number; y: number; z: number };
  distance: number;
  decay: number;
  castShadow: boolean;
}

export interface SpotLightData {
  color: string;
  intensity: number;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  angle: number;
  penumbra: number;
  distance: number;
  castShadow: boolean;
}

export interface SkyboxData {
  type: 'color' | 'gradient' | 'cubemap' | 'hdri' | 'procedural';
  color?: string;
  gradientTop?: string;
  gradientBottom?: string;
  cubemapUrls?: string[];
  hdriUrl?: string;
  proceduralSettings?: {
    turbidity: number;
    rayleigh: number;
    mieCoefficient: number;
    sunPosition: { x: number; y: number; z: number };
  };
}

export interface WeatherData {
  type: 'clear' | 'rain' | 'snow' | 'fog' | 'dust' | 'custom';
  intensity: number;
  windDirection: { x: number; y: number; z: number };
  windSpeed: number;
  particles?: ParticleSystemData;
}

export interface ParticleSystemData {
  count: number;
  size: number;
  color: string;
  velocity: { x: number; y: number; z: number };
  lifetime: number;
  spread: number;
}

export interface MapAudioData {
  ambient: AmbientAudioData[];
  music?: string;
  musicVolume: number;
}

export interface AmbientAudioData {
  audioUrl: string;
  position?: { x: number; y: number; z: number };
  radius?: number;
  volume: number;
  loop: boolean;
}

export interface KillZoneData {
  type: 'box' | 'sphere' | 'plane';
  position: { x: number; y: number; z: number };
  size?: { x: number; y: number; z: number };
  radius?: number;
  normal?: { x: number; y: number; z: number };
  damageType: 'instant' | 'damage_over_time';
  damage?: number;
}

export interface NavMeshData {
  vertices: number[];
  indices: number[];
  areas: NavMeshAreaData[];
}

export interface NavMeshAreaData {
  id: string;
  type: 'walkable' | 'jump' | 'crouch' | 'ladder' | 'water';
  cost: number;
  triangles: number[];
}

export interface WaypointData {
  id: string;
  position: { x: number; y: number; z: number };
  type: 'patrol' | 'combat' | 'cover' | 'snipe' | 'objective';
  connections: string[];
  team?: string;
}

// ============================================================================
// WEAPON DATA
// ============================================================================

export interface WeaponData {
  // Identity
  id: string;
  name: string;
  description: string;
  category: 'pistol' | 'smg' | 'rifle' | 'shotgun' | 'sniper' | 'heavy' | 'melee' | 'explosive';
  
  // Visuals
  modelUrl: string;
  textureUrl?: string;
  animations: WeaponAnimationData;
  effects: WeaponEffectsData;
  
  // Audio
  audio: WeaponAudioData;
  
  // Stats
  stats: WeaponStatsData;
  
  // Attachments
  attachmentSlots: AttachmentSlotData[];
  defaultAttachments: string[];
}

export interface WeaponStatsData {
  // Damage
  baseDamage: number;
  headshotMultiplier: number;
  limbMultiplier: number;
  armorPenetration: number;
  damageDropoffStart: number;
  damageDropoffEnd: number;
  minDamagePercent: number;
  
  // Fire
  fireRate: number; // RPM
  fireMode: 'auto' | 'semi' | 'burst';
  burstCount?: number;
  
  // Magazine
  magazineSize: number;
  reserveAmmo: number;
  reloadTime: number;
  reloadType: 'magazine' | 'shell' | 'belt';
  
  // Accuracy
  baseSpread: number;
  movementSpreadPenalty: number;
  jumpSpreadPenalty: number;
  adsSpreadReduction: number;
  spreadRecoveryRate: number;
  maxSpread: number;
  
  // Recoil
  recoilVertical: number;
  recoilHorizontal: number;
  recoilRecoveryRate: number;
  recoilPattern?: { x: number; y: number }[];
  
  // ADS
  adsZoom: number;
  adsTime: number;
  adsMoveSpeed: number;
  
  // Ballistics
  bulletSpeed: number;
  bulletDrop: number;
  bulletPenetration: number;
  
  // Special
  pelletCount?: number;
  chargeTime?: number;
  explosionRadius?: number;
}

export interface WeaponAnimationData {
  idle: string;
  fire: string;
  reload: string;
  reloadEmpty?: string;
  draw: string;
  holster: string;
  ads: string;
  sprint?: string;
  inspect?: string;
}

export interface WeaponEffectsData {
  muzzleFlash: {
    size: number;
    color: string;
    duration: number;
  };
  tracer: {
    enabled: boolean;
    color: string;
    frequency: number;
    speed: number;
  };
  bulletImpact: {
    decalUrl?: string;
    particles: boolean;
    sparks: boolean;
  };
  shellEjection: {
    enabled: boolean;
    modelUrl?: string;
    direction: { x: number; y: number; z: number };
    force: number;
  };
}

export interface WeaponAudioData {
  fire: string;
  fireSilenced?: string;
  reload: string;
  reloadEmpty?: string;
  draw: string;
  empty: string;
  impact: string[];
}

export interface AttachmentSlotData {
  id: string;
  name: string;
  type: 'optic' | 'barrel' | 'grip' | 'magazine' | 'stock' | 'underbarrel';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  compatibleAttachments: string[];
}

// ============================================================================
// GAME MODE DATA
// ============================================================================

export interface GameModeData {
  id: string;
  name: string;
  description: string;
  type: 'deathmatch' | 'team_deathmatch' | 'objective' | 'survival' | 'custom';
  
  // Configuration
  settings: GameModeSettingsData;
  rules: GameModeRuleData[];
  phases: GamePhaseData[];
  
  // Scoring
  scoring: ScoringSystemData;
  
  // Spawning
  spawnLogic: SpawnLogicData;
  
  // Custom scripting
  scripts: GameModeScriptData[];
  
  // UI
  hudConfig: HUDConfigData;
}

export interface GameModeSettingsData {
  teamCount: number;
  playersPerTeam: number;
  roundCount: number;
  roundTime: number; // seconds
  respawnEnabled: boolean;
  respawnTime: number;
  friendlyFire: boolean;
  killCam: boolean;
  aiEnabled: boolean;
  vehiclesEnabled: boolean;
}

export interface GameModeRuleData {
  id: string;
  name: string;
  description: string;
  type: 'win_condition' | 'loss_condition' | 'modifier' | 'restriction';
  trigger: RuleTrigger;
  condition: RuleCondition;
  action: RuleAction;
}

export interface RuleTrigger {
  event: string;
  filter?: Record<string, any>;
}

export interface RuleCondition {
  type: 'score' | 'time' | 'kills' | 'objective' | 'custom';
  comparison: '==' | '!=' | '<' | '<=' | '>' | '>=';
  value: number | string;
  target?: string;
}

export interface RuleAction {
  type: 'end_round' | 'end_match' | 'award_points' | 'spawn_entity' | 'trigger_event' | 'custom';
  params: Record<string, any>;
}

export interface GamePhaseData {
  id: string;
  name: string;
  duration: number;
  announcements: PhaseAnnouncementData[];
  rules: string[];
  nextPhase?: string;
}

export interface PhaseAnnouncementData {
  time: number; // seconds into phase
  message: string;
  audioUrl?: string;
}

export interface ScoringSystemData {
  scoreToWin?: number;
  pointsPerKill: number;
  pointsPerDeath: number;
  pointsPerAssist: number;
  pointsPerObjective: number;
  customScoring: CustomScoringData[];
}

export interface CustomScoringData {
  event: string;
  points: number;
  description: string;
}

export interface SpawnLogicData {
  type: 'fixed' | 'squad' | 'tactical' | 'random' | 'custom';
  avoidEnemyRadius: number;
  preferTeammateRadius: number;
  minEnemyDistance: number;
  spawnProtectionTime: number;
}

export interface GameModeScriptData {
  id: string;
  name: string;
  trigger: string;
  code: string;
  enabled: boolean;
}

export interface HUDConfigData {
  showScore: boolean;
  showTime: boolean;
  showKillFeed: boolean;
  showObjectives: boolean;
  showMinimap: boolean;
  showTeammates: boolean;
  customElements: CustomHUDElementData[];
}

export interface CustomHUDElementData {
  id: string;
  type: 'text' | 'bar' | 'icon' | 'counter';
  position: { x: number; y: number };
  anchor: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  binding: string;
  style: Record<string, any>;
}

// ============================================================================
// CHARACTER DATA
// ============================================================================

export interface CharacterData {
  id: string;
  name: string;
  description: string;
  faction: string;
  
  // Visuals
  modelUrl: string;
  animations: CharacterAnimationData;
  customization: CharacterCustomizationData;
  
  // Stats
  health: number;
  armor: number;
  speed: number;
  
  // Abilities
  abilities: CharacterAbilityData[];
  
  // Audio
  voiceLines: VoiceLineData[];
}

export interface CharacterAnimationData {
  idle: string;
  walk: string;
  run: string;
  sprint: string;
  crouch: string;
  jump: string;
  fall: string;
  slide: string;
  death: string[];
}

export interface CharacterCustomizationData {
  slots: CustomizationSlotData[];
  defaultSkin: string;
}

export interface CustomizationSlotData {
  id: string;
  name: string;
  type: 'skin' | 'head' | 'body' | 'accessory';
  options: string[];
}

export interface CharacterAbilityData {
  id: string;
  name: string;
  description: string;
  icon: string;
  slot: 'tactical' | 'ultimate' | 'passive';
  cooldown: number;
  charges?: number;
  duration?: number;
  effects: AbilityEffectData[];
}

export interface AbilityEffectData {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'utility';
  target: 'self' | 'ally' | 'enemy' | 'area';
  value: number;
  duration?: number;
  radius?: number;
}

export interface VoiceLineData {
  id: string;
  trigger: string;
  audioUrl: string;
  subtitles: string;
  cooldown: number;
}

// ============================================================================
// BUNDLE DATA
// ============================================================================

export interface BundleData {
  items: BundleItemData[];
  price: number;
  discount?: number;
}

export interface BundleItemData {
  type: 'map' | 'weapon' | 'gamemode' | 'character' | 'cosmetic';
  itemId: string;
}

// ============================================================================
// CREATOR SDK CLASS
// ============================================================================

export class CreatorSDK {
  private static instance: CreatorSDK;
  private currentProject: CreatorProject | null = null;
  private undoStack: any[] = [];
  private redoStack: any[] = [];
  
  private constructor() {}
  
  public static getInstance(): CreatorSDK {
    if (!CreatorSDK.instance) {
      CreatorSDK.instance = new CreatorSDK();
    }
    return CreatorSDK.instance;
  }
  
  // ============================================================================
  // PROJECT MANAGEMENT
  // ============================================================================
  
  public createProject(
    type: CreatorProject['type'],
    name: string,
    creatorId: string
  ): CreatorProject {
    const project: CreatorProject = {
      id: crypto.randomUUID(),
      creatorId,
      type,
      name,
      description: '',
      version: '1.0.0',
      status: 'draft',
      visibility: 'private',
      data: this.getDefaultData(type),
      assets: [],
      plays: 0,
      likes: 0,
      rating: 0,
      revenue: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    };
    
    this.currentProject = project;
    return project;
  }
  
  private getDefaultData(type: CreatorProject['type']): any {
    switch (type) {
      case 'map':
        return this.getDefaultMapData();
      case 'weapon':
        return this.getDefaultWeaponData();
      case 'gamemode':
        return this.getDefaultGameModeData();
      case 'character':
        return this.getDefaultCharacterData();
      default:
        return {};
    }
  }
  
  private getDefaultMapData(): MapData {
    return {
      name: 'New Map',
      description: '',
      size: 'medium',
      theme: 'urban',
      supportedModes: ['team_deathmatch'],
      supportedPlayers: { min: 2, max: 16 },
      terrain: {
        type: 'flat',
        size: { width: 100, depth: 100 },
        segments: 64,
        material: { type: 'standard', color: '#1a1a2a' },
      },
      structures: [],
      props: [],
      spawnPoints: [],
      coverPoints: [],
      objectives: [],
      weapons: [],
      vehicles: [],
      lighting: {
        ambientColor: '#303050',
        ambientIntensity: 0.4,
        directionalLights: [{
          color: '#ffffff',
          intensity: 1,
          position: { x: 50, y: 100, z: 50 },
          castShadow: true,
        }],
        pointLights: [],
        spotLights: [],
        shadows: true,
        shadowQuality: 'high',
      },
      skybox: {
        type: 'gradient',
        gradientTop: '#000011',
        gradientBottom: '#0a1530',
      },
      weather: {
        type: 'clear',
        intensity: 0,
        windDirection: { x: 1, y: 0, z: 0 },
        windSpeed: 0,
      },
      audio: {
        ambient: [],
        musicVolume: 0.3,
      },
      playableBounds: {
        min: new THREE.Vector3(-50, -5, -50),
        max: new THREE.Vector3(50, 50, 50),
      },
      killZones: [],
      aiWaypoints: [],
    };
  }
  
  private getDefaultWeaponData(): WeaponData {
    return {
      id: crypto.randomUUID(),
      name: 'New Weapon',
      description: '',
      category: 'rifle',
      modelUrl: '',
      animations: {
        idle: '',
        fire: '',
        reload: '',
        draw: '',
        holster: '',
        ads: '',
      },
      effects: {
        muzzleFlash: { size: 1, color: '#ffff00', duration: 0.05 },
        tracer: { enabled: true, color: '#ffff00', frequency: 3, speed: 100 },
        bulletImpact: { particles: true, sparks: true },
        shellEjection: { enabled: true, direction: { x: 1, y: 1, z: 0 }, force: 5 },
      },
      audio: {
        fire: '',
        reload: '',
        draw: '',
        empty: '',
        impact: [],
      },
      stats: {
        baseDamage: 30,
        headshotMultiplier: 1.75,
        limbMultiplier: 0.85,
        armorPenetration: 0.4,
        damageDropoffStart: 25,
        damageDropoffEnd: 75,
        minDamagePercent: 0.65,
        fireRate: 600,
        fireMode: 'auto',
        magazineSize: 30,
        reserveAmmo: 90,
        reloadTime: 2.4,
        reloadType: 'magazine',
        baseSpread: 0.012,
        movementSpreadPenalty: 0.025,
        jumpSpreadPenalty: 0.1,
        adsSpreadReduction: 0.6,
        spreadRecoveryRate: 2.5,
        maxSpread: 0.08,
        recoilVertical: 0.032,
        recoilHorizontal: 0.01,
        recoilRecoveryRate: 7,
        adsZoom: 1.4,
        adsTime: 0.25,
        adsMoveSpeed: 0.85,
        bulletSpeed: 550,
        bulletDrop: 0.25,
        bulletPenetration: 0.4,
      },
      attachmentSlots: [],
      defaultAttachments: [],
    };
  }
  
  private getDefaultGameModeData(): GameModeData {
    return {
      id: crypto.randomUUID(),
      name: 'New Game Mode',
      description: '',
      type: 'team_deathmatch',
      settings: {
        teamCount: 2,
        playersPerTeam: 8,
        roundCount: 1,
        roundTime: 600,
        respawnEnabled: true,
        respawnTime: 5,
        friendlyFire: false,
        killCam: true,
        aiEnabled: true,
        vehiclesEnabled: false,
      },
      rules: [],
      phases: [],
      scoring: {
        scoreToWin: 75,
        pointsPerKill: 100,
        pointsPerDeath: 0,
        pointsPerAssist: 50,
        pointsPerObjective: 200,
        customScoring: [],
      },
      spawnLogic: {
        type: 'tactical',
        avoidEnemyRadius: 20,
        preferTeammateRadius: 15,
        minEnemyDistance: 10,
        spawnProtectionTime: 3,
      },
      scripts: [],
      hudConfig: {
        showScore: true,
        showTime: true,
        showKillFeed: true,
        showObjectives: true,
        showMinimap: true,
        showTeammates: true,
        customElements: [],
      },
    };
  }
  
  private getDefaultCharacterData(): CharacterData {
    return {
      id: crypto.randomUUID(),
      name: 'New Character',
      description: '',
      faction: '',
      modelUrl: '',
      animations: {
        idle: '',
        walk: '',
        run: '',
        sprint: '',
        crouch: '',
        jump: '',
        fall: '',
        slide: '',
        death: [],
      },
      customization: {
        slots: [],
        defaultSkin: '',
      },
      health: 100,
      armor: 0,
      speed: 1,
      abilities: [],
      voiceLines: [],
    };
  }
  
  // ============================================================================
  // MAP EDITING
  // ============================================================================
  
  public addStructure(structure: StructureData): void {
    if (!this.currentProject || this.currentProject.type !== 'map') return;
    
    const mapData = this.currentProject.data as MapData;
    this.pushUndoState();
    
    mapData.structures.push(structure);
    this.markDirty();
  }
  
  public updateStructure(id: string, updates: Partial<StructureData>): void {
    if (!this.currentProject || this.currentProject.type !== 'map') return;
    
    const mapData = this.currentProject.data as MapData;
    const index = mapData.structures.findIndex(s => s.id === id);
    
    if (index >= 0) {
      this.pushUndoState();
      mapData.structures[index] = { ...mapData.structures[index], ...updates };
      this.markDirty();
    }
  }
  
  public removeStructure(id: string): void {
    if (!this.currentProject || this.currentProject.type !== 'map') return;
    
    const mapData = this.currentProject.data as MapData;
    this.pushUndoState();
    
    mapData.structures = mapData.structures.filter(s => s.id !== id);
    this.markDirty();
  }
  
  public addSpawnPoint(spawn: SpawnPointData): void {
    if (!this.currentProject || this.currentProject.type !== 'map') return;
    
    const mapData = this.currentProject.data as MapData;
    this.pushUndoState();
    
    mapData.spawnPoints.push(spawn);
    this.markDirty();
  }
  
  public addCoverPoint(cover: CoverPointData): void {
    if (!this.currentProject || this.currentProject.type !== 'map') return;
    
    const mapData = this.currentProject.data as MapData;
    this.pushUndoState();
    
    mapData.coverPoints.push(cover);
    this.markDirty();
  }
  
  public setLighting(lighting: LightingData): void {
    if (!this.currentProject || this.currentProject.type !== 'map') return;
    
    const mapData = this.currentProject.data as MapData;
    this.pushUndoState();
    
    mapData.lighting = lighting;
    this.markDirty();
  }
  
  public setSkybox(skybox: SkyboxData): void {
    if (!this.currentProject || this.currentProject.type !== 'map') return;
    
    const mapData = this.currentProject.data as MapData;
    this.pushUndoState();
    
    mapData.skybox = skybox;
    this.markDirty();
  }
  
  // ============================================================================
  // WEAPON EDITING
  // ============================================================================
  
  public updateWeaponStats(stats: Partial<WeaponStatsData>): void {
    if (!this.currentProject || this.currentProject.type !== 'weapon') return;
    
    const weaponData = this.currentProject.data as WeaponData;
    this.pushUndoState();
    
    weaponData.stats = { ...weaponData.stats, ...stats };
    this.markDirty();
  }
  
  public setWeaponModel(modelUrl: string): void {
    if (!this.currentProject || this.currentProject.type !== 'weapon') return;
    
    const weaponData = this.currentProject.data as WeaponData;
    this.pushUndoState();
    
    weaponData.modelUrl = modelUrl;
    this.markDirty();
  }
  
  public addAttachmentSlot(slot: AttachmentSlotData): void {
    if (!this.currentProject || this.currentProject.type !== 'weapon') return;
    
    const weaponData = this.currentProject.data as WeaponData;
    this.pushUndoState();
    
    weaponData.attachmentSlots.push(slot);
    this.markDirty();
  }
  
  // ============================================================================
  // GAME MODE EDITING
  // ============================================================================
  
  public addGameRule(rule: GameModeRuleData): void {
    if (!this.currentProject || this.currentProject.type !== 'gamemode') return;
    
    const modeData = this.currentProject.data as GameModeData;
    this.pushUndoState();
    
    modeData.rules.push(rule);
    this.markDirty();
  }
  
  public addGamePhase(phase: GamePhaseData): void {
    if (!this.currentProject || this.currentProject.type !== 'gamemode') return;
    
    const modeData = this.currentProject.data as GameModeData;
    this.pushUndoState();
    
    modeData.phases.push(phase);
    this.markDirty();
  }
  
  public updateGameSettings(settings: Partial<GameModeSettingsData>): void {
    if (!this.currentProject || this.currentProject.type !== 'gamemode') return;
    
    const modeData = this.currentProject.data as GameModeData;
    this.pushUndoState();
    
    modeData.settings = { ...modeData.settings, ...settings };
    this.markDirty();
  }
  
  public addScript(script: GameModeScriptData): void {
    if (!this.currentProject || this.currentProject.type !== 'gamemode') return;
    
    const modeData = this.currentProject.data as GameModeData;
    this.pushUndoState();
    
    modeData.scripts.push(script);
    this.markDirty();
  }
  
  // ============================================================================
  // UNDO / REDO
  // ============================================================================
  
  private pushUndoState(): void {
    if (this.currentProject) {
      this.undoStack.push(JSON.parse(JSON.stringify(this.currentProject.data)));
      this.redoStack = [];
      
      // Limit stack size
      if (this.undoStack.length > 50) {
        this.undoStack.shift();
      }
    }
  }
  
  public undo(): boolean {
    if (this.undoStack.length === 0 || !this.currentProject) return false;
    
    this.redoStack.push(JSON.parse(JSON.stringify(this.currentProject.data)));
    this.currentProject.data = this.undoStack.pop();
    this.markDirty();
    
    return true;
  }
  
  public redo(): boolean {
    if (this.redoStack.length === 0 || !this.currentProject) return false;
    
    this.undoStack.push(JSON.parse(JSON.stringify(this.currentProject.data)));
    this.currentProject.data = this.redoStack.pop();
    this.markDirty();
    
    return true;
  }
  
  private markDirty(): void {
    if (this.currentProject) {
      this.currentProject.updatedAt = new Date();
    }
  }
  
  // ============================================================================
  // VALIDATION
  // ============================================================================
  
  public validateProject(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.currentProject) {
      return { valid: false, errors: ['No project loaded'] };
    }
    
    switch (this.currentProject.type) {
      case 'map':
        return this.validateMap(this.currentProject.data as MapData);
      case 'weapon':
        return this.validateWeapon(this.currentProject.data as WeaponData);
      case 'gamemode':
        return this.validateGameMode(this.currentProject.data as GameModeData);
      default:
        return { valid: true, errors: [] };
    }
  }
  
  private validateMap(data: MapData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Must have spawn points
    if (data.spawnPoints.length < 2) {
      errors.push('Map must have at least 2 spawn points');
    }
    
    // Must have balanced team spawns
    const alphaSpawns = data.spawnPoints.filter(s => s.team === 'alpha').length;
    const bravoSpawns = data.spawnPoints.filter(s => s.team === 'bravo').length;
    
    if (Math.abs(alphaSpawns - bravoSpawns) > 2) {
      errors.push('Team spawn points should be roughly balanced');
    }
    
    // Must have cover
    if (data.coverPoints.length < 10) {
      errors.push('Map should have more cover points for tactical gameplay');
    }
    
    // Check bounds
    if (!data.playableBounds) {
      errors.push('Map must define playable bounds');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  private validateWeapon(data: WeaponData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Must have model
    if (!data.modelUrl) {
      errors.push('Weapon must have a 3D model');
    }
    
    // Balance checks
    if (data.stats.baseDamage < 5 || data.stats.baseDamage > 200) {
      errors.push('Base damage must be between 5 and 200');
    }
    
    if (data.stats.fireRate < 50 || data.stats.fireRate > 2000) {
      errors.push('Fire rate must be between 50 and 2000 RPM');
    }
    
    // DPS check
    const dps = (data.stats.baseDamage * data.stats.fireRate) / 60;
    if (dps > 1000) {
      errors.push('Weapon DPS is too high for balanced gameplay');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  private validateGameMode(data: GameModeData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Must have win condition
    const hasWinCondition = data.rules.some(r => r.type === 'win_condition');
    if (!hasWinCondition && !data.scoring.scoreToWin) {
      errors.push('Game mode must have a win condition');
    }
    
    // Must have valid settings
    if (data.settings.teamCount < 1 || data.settings.teamCount > 4) {
      errors.push('Team count must be between 1 and 4');
    }
    
    if (data.settings.playersPerTeam < 1 || data.settings.playersPerTeam > 32) {
      errors.push('Players per team must be between 1 and 32');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  // ============================================================================
  // PUBLISHING
  // ============================================================================
  
  public async publishProject(): Promise<{ success: boolean; error?: string }> {
    if (!this.currentProject) {
      return { success: false, error: 'No project loaded' };
    }
    
    // Validate
    const validation = this.validateProject();
    if (!validation.valid) {
      return { success: false, error: validation.errors.join('; ') };
    }
    
    // Update status
    this.currentProject.status = 'review';
    this.currentProject.updatedAt = new Date();
    
    // Would submit to backend for review
    console.log('[CreatorSDK] Project submitted for review:', this.currentProject.id);
    
    return { success: true };
  }
  
  public async submitForCompetitive(): Promise<{ success: boolean; error?: string }> {
    if (!this.currentProject) {
      return { success: false, error: 'No project loaded' };
    }
    
    if (this.currentProject.status !== 'published') {
      return { success: false, error: 'Project must be published first' };
    }
    
    // Additional competitive validation
    const validation = this.validateProject();
    if (!validation.valid) {
      return { success: false, error: validation.errors.join('; ') };
    }
    
    // Check rating requirements
    if (this.currentProject.rating < 4.0) {
      return { success: false, error: 'Project must have at least 4.0 rating for competitive' };
    }
    
    if (this.currentProject.plays < 1000) {
      return { success: false, error: 'Project must have at least 1000 plays for competitive' };
    }
    
    this.currentProject.visibility = 'competitive';
    
    return { success: true };
  }
  
  // ============================================================================
  // GETTERS
  // ============================================================================
  
  public getCurrentProject(): CreatorProject | null {
    return this.currentProject;
  }
  
  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }
  
  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}

export default CreatorSDK;
