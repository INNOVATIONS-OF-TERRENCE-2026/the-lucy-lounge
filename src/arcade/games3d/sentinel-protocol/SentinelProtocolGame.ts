/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY: SENTINEL PROTOCOL                                                    │
 * │                                                                             │
 * │ AAA FLAGSHIP FPS GAME                                                      │
 * │                                                                             │
 * │ GAME MODES:                                                                │
 * │ • Campaign - AI-driven narrative missions                                  │
 * │ • Arena PvP - Competitive multiplayer                                      │
 * │ • Co-Op Survival - Wave-based survival                                     │
 * │ • Training Grounds - Skill development                                     │
 * │ • Custom Matches - Player-created games                                    │
 * │                                                                             │
 * │ FEATURES:                                                                  │
 * │ • Advanced FPS movement (slide, vault, ADS, tactical abilities)            │
 * │ • Sophisticated AI with personality profiles                               │
 * │ • Multiple weapons with realistic ballistics                               │
 * │ • Console-quality graphics and performance                                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  FPSCameraController,
  ParticlePresets,
  CollisionGroups,
  type PhysicsBody,
  type CharacterController,
  type InputState,
} from '../../engine3d';
import { AIDirector, type AIDecision, type AIControllerConfig } from './AIDirector';
import { ALL_WEAPONS, PHANTOM_AR, SENTINEL_P9, DEVASTATOR_SG } from './weapons';
import type {
  GameMode,
  Player,
  WeaponState,
  WeaponDefinition,
  Projectile,
  HitInfo,
  DamageEvent,
  CoverPoint,
  SpawnPoint,
  MatchState,
  HUDState,
  DamageIndicator,
  MovementState,
  AIPersonality,
  MissionDefinition,
  WaveDefinition,
  TrainingDrill,
} from './types';
import { GAME_MODES, AI_PERSONALITIES } from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const MOVEMENT = {
  walkSpeed: 5.5,
  sprintSpeed: 8.5,
  crouchSpeed: 3.0,
  slideSpeed: 10.0,
  slideDuration: 0.8,
  slideCooldown: 1.5,
  jumpForce: 7.5,
  gravity: 22.0,
  airControl: 0.3,
  vaultHeight: 2.0,
  vaultSpeed: 0.4,
  coyoteTime: 0.15,
  jumpBuffer: 0.1,
  staminaMax: 100,
  staminaDrain: 20, // per second sprinting
  staminaRegen: 15,
};

const GRAPHICS_TIERS = {
  0: { name: 'Mobile Safe', shadowMapSize: 512, bloom: false, particles: 0.25 },
  1: { name: 'Console Web', shadowMapSize: 1024, bloom: true, particles: 0.75 },
  2: { name: 'Desktop Ultra', shadowMapSize: 2048, bloom: true, particles: 1.5 },
  3: { name: 'Experimental', shadowMapSize: 4096, bloom: true, particles: 2.0 },
};

// ============================================================================
// MAIN GAME CLASS
// ============================================================================

export class SentinelProtocolGame extends Game3DBase {
  // Game mode
  private gameMode: GameMode = 'coop_survival';
  private matchState!: MatchState;
  
  // Camera
  private cameraController!: FPSCameraController;
  
  // Player
  private localPlayer!: Player;
  
  // AI
  private aiDirector!: AIDirector;
  
  // Entities
  private players: Map<string, Player> = new Map();
  private projectiles: Projectile[] = [];
  private projectileIdCounter: number = 0;
  
  // Level
  private coverPoints: CoverPoint[] = [];
  private spawnPoints: SpawnPoint[] = [];
  private levelMeshes: THREE.Object3D[] = [];
  
  // Wave system (Co-Op Survival)
  private currentWave: number = 0;
  private waveEnemiesRemaining: number = 0;
  private waveTimer: number = 0;
  private isWaveActive: boolean = false;
  private waveDefinitions: WaveDefinition[] = [];
  
  // Campaign (if applicable)
  private currentMission?: MissionDefinition;
  
  // Training (if applicable)
  private currentDrill?: TrainingDrill;
  private trainingTargets: THREE.Object3D[] = [];
  
  // HUD state
  private hudState!: HUDState;
  private damageIndicators: DamageIndicator[] = [];
  private hitMarkerTime: number = 0;
  private killConfirmTime: number = 0;
  
  // Movement state
  private slideTimer: number = 0;
  private slideCooldownTimer: number = 0;
  private lastSlideDirection: THREE.Vector3 = new THREE.Vector3();
  private vaultTarget: THREE.Vector3 | null = null;
  private jumpBufferTimer: number = 0;
  private coyoteTimer: number = 0;
  private wasGrounded: boolean = true;
  
  // Graphics tier
  private graphicsTier: 0 | 1 | 2 | 3 = 1;

  constructor(container: HTMLElement, config?: Game3DConfig & { mode?: GameMode }) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        shadowMapSize: 2048,
        bloom: true,
        bloomStrength: 0.4,
        bloomThreshold: 0.85,
        fog: { color: 0x0a0f1a, near: 20, far: 150 },
        antialias: 'smaa',
        ...config?.engineConfig,
      },
    });
    
    if (config?.mode) {
      this.gameMode = config.mode;
    }
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  protected async loadAssets(): Promise<void> {
    console.log('[SentinelProtocol] Loading assets...');
    
    // Initialize AI Director
    this.aiDirector = new AIDirector();
    
    // In production: load models, textures, sounds
    // await this.engine.assets.loadGLTF('soldier', '/models/soldier.glb');
    // await this.engine.assets.loadGLTF('weapon_ar', '/models/weapons/ar.glb');
    
    console.log('[SentinelProtocol] Assets loaded');
  }

  protected initScene(): void {
    console.log(`[SentinelProtocol] Initializing ${this.gameMode} mode...`);
    
    // Setup lighting
    this.setupLighting();
    
    // Create level based on mode
    this.createLevel();
    
    // Initialize local player
    this.initLocalPlayer();
    
    // Setup camera
    this.cameraController = new FPSCameraController(this.engine.camera, {
      height: 1.7,
      sensitivity: 0.002,
      bobEnabled: true,
      bobSpeed: 14,
      bobAmount: 0.025,
      pitchLimits: { min: -85, max: 85 },
    });
    
    // Create particle systems
    this.setupParticleSystems();
    
    // Initialize HUD state
    this.initHUD();
    
    // Initialize match state
    this.initMatchState();
    
    // Mode-specific initialization
    switch (this.gameMode) {
      case 'coop_survival':
        this.initSurvivalMode();
        break;
      case 'campaign':
        this.initCampaignMode();
        break;
      case 'training':
        this.initTrainingMode();
        break;
      case 'arena_pvp':
        this.initArenaPvPMode();
        break;
      case 'custom':
        this.initCustomMode();
        break;
    }
    
    console.log('[SentinelProtocol] Scene initialized');
  }

  private setupLighting(): void {
    // Ambient light
    this.engine.addAmbientLight(0x303050, 0.35);
    
    // Main directional light (moon/sun)
    const mainLight = this.engine.addDirectionalLight(
      0x6080aa,
      0.9,
      new THREE.Vector3(40, 60, 30),
      true
    );
    mainLight.shadow.camera.left = -60;
    mainLight.shadow.camera.right = 60;
    mainLight.shadow.camera.top = 60;
    mainLight.shadow.camera.bottom = -60;
    mainLight.shadow.bias = -0.0001;
    
    // Fill light
    this.engine.addDirectionalLight(
      0x4060a0,
      0.3,
      new THREE.Vector3(-20, 30, -20),
      false
    );
    
    // Atmospheric point lights
    this.engine.addPointLight(0xff6633, 2.5, new THREE.Vector3(-20, 4, -25), 18, 2);
    this.engine.addPointLight(0x33ff66, 2.0, new THREE.Vector3(25, 4, 10), 15, 2);
    this.engine.addPointLight(0xff3366, 1.5, new THREE.Vector3(0, 4, 35), 12, 2);
  }

  private createLevel(): void {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(120, 120);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2a,
      roughness: 0.85,
      metalness: 0.15,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.engine.add(ground);
    this.levelMeshes.push(ground);
    
    this.engine.physics.addBox(ground, new THREE.Vector3(120, 0.1, 120), 'static');
    
    // Skybox
    this.createGradientSkybox(0x050510, 0x0a1530);
    
    // Create arena walls
    this.createWalls();
    
    // Create cover and structures
    this.createCoverObjects();
    
    // Generate spawn points
    this.generateSpawnPoints();
  }

  private createWalls(): void {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x252535,
      roughness: 0.7,
      metalness: 0.3,
    });
    
    const wallDefs = [
      { pos: [0, 6, -60], size: [120, 12, 3] },
      { pos: [0, 6, 60], size: [120, 12, 3] },
      { pos: [-60, 6, 0], size: [3, 12, 120] },
      { pos: [60, 6, 0], size: [3, 12, 120] },
    ];
    
    wallDefs.forEach(({ pos, size }) => {
      const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
      const wall = new THREE.Mesh(geometry, wallMaterial);
      wall.position.set(pos[0], pos[1], pos[2]);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.engine.add(wall);
      this.levelMeshes.push(wall);
      
      this.engine.physics.addBox(
        wall,
        new THREE.Vector3(size[0], size[1], size[2]),
        'static'
      );
    });
  }

  private createCoverObjects(): void {
    const coverMaterial = new THREE.MeshStandardMaterial({
      color: 0x353545,
      roughness: 0.65,
      metalness: 0.35,
    });
    
    const coverDefs = [
      // Low walls for crouch cover
      { pos: [-20, 1.25, -15], size: [5, 2.5, 1.2], type: 'low' as const },
      { pos: [20, 1.25, -15], size: [5, 2.5, 1.2], type: 'low' as const },
      { pos: [-20, 1.25, 15], size: [5, 2.5, 1.2], type: 'low' as const },
      { pos: [20, 1.25, 15], size: [5, 2.5, 1.2], type: 'low' as const },
      { pos: [0, 1.25, 0], size: [8, 2.5, 1.2], type: 'low' as const },
      
      // Tall pillars for standing cover
      { pos: [-35, 2.5, -30], size: [3, 5, 3], type: 'tall' as const },
      { pos: [35, 2.5, -30], size: [3, 5, 3], type: 'tall' as const },
      { pos: [-35, 2.5, 30], size: [3, 5, 3], type: 'tall' as const },
      { pos: [35, 2.5, 30], size: [3, 5, 3], type: 'tall' as const },
      
      // Medium structures
      { pos: [-10, 2, -35], size: [4, 4, 3], type: 'medium' as const },
      { pos: [10, 2, -35], size: [4, 4, 3], type: 'medium' as const },
      { pos: [-10, 2, 35], size: [4, 4, 3], type: 'medium' as const },
      { pos: [10, 2, 35], size: [4, 4, 3], type: 'medium' as const },
      
      // Angled cover
      { pos: [-30, 1.5, 0], size: [2.5, 3, 8], type: 'tall' as const },
      { pos: [30, 1.5, 0], size: [2.5, 3, 8], type: 'tall' as const },
    ];
    
    coverDefs.forEach(({ pos, size, type }) => {
      const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
      const cover = new THREE.Mesh(geometry, coverMaterial);
      cover.position.set(pos[0], pos[1], pos[2]);
      cover.castShadow = true;
      cover.receiveShadow = true;
      this.engine.add(cover);
      this.levelMeshes.push(cover);
      
      this.engine.physics.addBox(
        cover,
        new THREE.Vector3(size[0], size[1], size[2]),
        'static'
      );
      
      // Register as cover point
      const normal = new THREE.Vector3(0, 0, 1); // Simplified
      this.coverPoints.push({
        position: new THREE.Vector3(pos[0], 0, pos[2]),
        normal,
        size: type === 'low' ? 'small' : type === 'medium' ? 'medium' : 'large',
        canCrouchBehind: true,
        canStandBehind: type !== 'low',
      });
    });
  }

  private generateSpawnPoints(): void {
    // Alpha team spawns (south)
    const alphaSpawns = [
      new THREE.Vector3(-15, 0, 45),
      new THREE.Vector3(0, 0, 45),
      new THREE.Vector3(15, 0, 45),
      new THREE.Vector3(-30, 0, 50),
      new THREE.Vector3(30, 0, 50),
    ];
    
    alphaSpawns.forEach(pos => {
      this.spawnPoints.push({
        position: pos,
        rotation: new THREE.Euler(0, Math.PI, 0),
        team: 'alpha',
        type: 'initial',
      });
    });
    
    // Bravo team / enemy spawns (north)
    const bravoSpawns = [
      new THREE.Vector3(-15, 0, -45),
      new THREE.Vector3(0, 0, -45),
      new THREE.Vector3(15, 0, -45),
      new THREE.Vector3(-30, 0, -50),
      new THREE.Vector3(30, 0, -50),
      new THREE.Vector3(-45, 0, -30),
      new THREE.Vector3(45, 0, -30),
    ];
    
    bravoSpawns.forEach(pos => {
      this.spawnPoints.push({
        position: pos,
        rotation: new THREE.Euler(0, 0, 0),
        team: 'bravo',
        type: 'initial',
      });
    });
  }

  private setupParticleSystems(): void {
    this.createParticleSystem('muzzle_flash', ParticlePresets.muzzleFlash());
    this.createParticleSystem('blood', {
      ...ParticlePresets.explosion(),
      startColor: new THREE.Color(0.7, 0, 0),
      endColor: new THREE.Color(0.3, 0, 0),
      gravity: new THREE.Vector3(0, -20, 0),
      startSize: 0.15,
      endSize: 0.05,
    });
    this.createParticleSystem('sparks', ParticlePresets.sparks());
    this.createParticleSystem('dust', ParticlePresets.dust());
    this.createParticleSystem('smoke', ParticlePresets.smoke());
  }

  // ============================================================================
  // PLAYER INITIALIZATION
  // ============================================================================

  private initLocalPlayer(): void {
    const spawnPoint = this.spawnPoints.find(s => s.team === 'alpha') || this.spawnPoints[0];
    
    this.localPlayer = this.createPlayer('local', 'Player', 'alpha', spawnPoint.position);
    this.players.set('local', this.localPlayer);
    
    // Equip starting weapons
    this.equipWeapon(this.localPlayer, PHANTOM_AR);
    this.equipWeapon(this.localPlayer, SENTINEL_P9);
    this.equipWeapon(this.localPlayer, DEVASTATOR_SG);
    this.localPlayer.currentWeaponIndex = 0;
    
    // Set camera position
    this.engine.camera.position.copy(spawnPoint.position);
    this.engine.camera.position.y += 1.7;
  }

  private createPlayer(
    id: string,
    name: string,
    team: 'alpha' | 'bravo',
    position: THREE.Vector3
  ): Player {
    const player: Player = {
      id,
      name,
      team,
      stats: {
        health: 100,
        maxHealth: 100,
        armor: 50,
        maxArmor: 100,
        stamina: MOVEMENT.staminaMax,
        maxStamina: MOVEMENT.staminaMax,
      },
      movement: {
        position: position.clone(),
        velocity: new THREE.Vector3(),
        rotation: new THREE.Euler(),
        state: 'idle',
        isGrounded: true,
        slideTime: 0,
        vaultProgress: 0,
        lastJumpTime: 0,
        coyoteTime: 0,
        jumpBufferTime: 0,
      },
      weapons: [],
      currentWeaponIndex: 0,
      abilities: [],
      grenades: {
        fragCount: 2,
        flashCount: 1,
        smokeCount: 1,
        maxFrag: 2,
        maxFlash: 2,
        maxSmoke: 2,
      },
      kills: 0,
      deaths: 0,
      assists: 0,
      score: 0,
      isAlive: true,
      respawnTime: 0,
    };
    
    // Create character controller for physics
    if (id === 'local') {
      player.characterController = this.engine.physics.createCharacterController(
        position,
        1.8,
        0.3,
        {
          offset: 0.01,
          maxSlopeClimbAngle: Math.PI / 4,
          minSlopeSlideAngle: Math.PI / 6,
          autostep: { maxHeight: 0.4, minWidth: 0.2, includeDynamicBodies: false },
          snapToGround: 0.3,
        }
      );
    }
    
    return player;
  }

  private equipWeapon(player: Player, weapon: WeaponDefinition): void {
    const weaponState: WeaponState = {
      definition: weapon,
      currentAmmo: weapon.magazineSize,
      reserveAmmo: weapon.magazineSize * 3,
      isReloading: false,
      reloadProgress: 0,
      lastFireTime: 0,
      currentSpread: weapon.baseSpread,
      currentRecoil: new THREE.Vector2(),
      isAiming: false,
      aimProgress: 0,
    };
    
    player.weapons.push(weaponState);
  }

  // ============================================================================
  // MATCH & MODE INITIALIZATION
  // ============================================================================

  private initMatchState(): void {
    this.matchState = {
      id: `match_${Date.now()}`,
      mode: this.gameMode,
      map: {
        id: 'sentinel_arena',
        name: 'Sentinel Arena',
        description: 'Training facility for Sentinel Protocol agents',
        thumbnail: '',
        size: 'medium',
        supportedModes: ['arena_pvp', 'coop_survival', 'training', 'custom'],
        spawnPoints: this.spawnPoints,
        coverPoints: this.coverPoints,
        objectives: [],
        ambientLight: 0.35,
        skybox: 'night_sky',
      },
      phase: 'warmup',
      timeRemaining: GAME_MODES[this.gameMode].timeLimit || 0,
      round: 1,
      maxRounds: 1,
      scores: { alpha: 0, bravo: 0 },
      players: this.players,
      spectators: [],
      projectiles: [],
      damageEvents: [],
      objectives: [],
      killFeed: [],
    };
  }

  private initHUD(): void {
    this.hudState = {
      health: 100,
      maxHealth: 100,
      armor: 50,
      maxArmor: 100,
      stamina: 100,
      maxStamina: 100,
      ammo: 30,
      maxAmmo: 30,
      reserveAmmo: 90,
      weaponName: 'Phantom AR',
      isReloading: false,
      reloadProgress: 0,
      crosshairSpread: 0,
      hitMarker: false,
      killConfirmed: false,
      damageIndicators: [],
      killfeed: [],
      objectives: [],
      teammates: [],
      score: { alpha: 0, bravo: 0 },
      time: 0,
      round: 1,
    };
  }

  private initSurvivalMode(): void {
    this.currentWave = 0;
    this.isWaveActive = false;
    this.waveTimer = 5; // Countdown to first wave
    
    this.waveDefinitions = this.generateSurvivalWaves();
    
    console.log('[SentinelProtocol] Survival mode initialized');
  }

  private generateSurvivalWaves(): WaveDefinition[] {
    const waves: WaveDefinition[] = [];
    
    for (let i = 1; i <= 30; i++) {
      const baseEnemies = 3 + Math.floor(i * 1.5);
      const personalities: AIPersonality[] = ['aggressive_rusher', 'tactical_flanker', 'defensive_anchor', 'adaptive_hunter'];
      
      const wave: WaveDefinition = {
        id: i,
        enemyCount: baseEnemies,
        enemyTypes: [
          { type: 'soldier', count: Math.ceil(baseEnemies * 0.6), personality: personalities[i % 4] },
          { type: 'heavy', count: Math.floor(baseEnemies * 0.2), personality: 'defensive_anchor' },
          { type: 'scout', count: Math.floor(baseEnemies * 0.2), personality: 'aggressive_rusher' },
        ],
        spawnDelay: Math.max(0.3, 1.5 - i * 0.03),
        waveDelay: Math.max(5, 15 - i * 0.3),
      };
      
      // Boss waves every 5 rounds
      if (i % 5 === 0) {
        wave.enemyTypes.push({ type: 'boss', count: 1, personality: 'adaptive_hunter' });
      }
      
      waves.push(wave);
    }
    
    return waves;
  }

  private initCampaignMode(): void {
    // Would load mission data
    console.log('[SentinelProtocol] Campaign mode initialized');
  }

  private initTrainingMode(): void {
    // Create training targets
    this.createTrainingTargets();
    console.log('[SentinelProtocol] Training mode initialized');
  }

  private createTrainingTargets(): void {
    const targetMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      roughness: 0.8,
    });
    
    const positions = [
      new THREE.Vector3(-10, 1.5, -20),
      new THREE.Vector3(0, 1.5, -25),
      new THREE.Vector3(10, 1.5, -20),
      new THREE.Vector3(-15, 2.5, -15),
      new THREE.Vector3(15, 2.5, -15),
    ];
    
    positions.forEach(pos => {
      const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
      const target = new THREE.Mesh(geometry, targetMaterial);
      target.position.copy(pos);
      target.castShadow = true;
      this.engine.add(target);
      this.trainingTargets.push(target);
    });
  }

  private initArenaPvPMode(): void {
    // Would setup matchmaking and multiplayer
    console.log('[SentinelProtocol] Arena PvP mode initialized');
  }

  private initCustomMode(): void {
    console.log('[SentinelProtocol] Custom mode initialized');
  }

  // ============================================================================
  // UPDATE LOOP
  // ============================================================================

  protected update(deltaTime: number, input: InputState): void {
    // Update player movement
    this.updatePlayerMovement(deltaTime, input);
    
    // Update camera
    this.cameraController.setTarget(this.localPlayer.movement.position);
    this.cameraController.update(deltaTime, input);
    
    // Apply camera recoil
    const weapon = this.localPlayer.weapons[this.localPlayer.currentWeaponIndex];
    if (weapon) {
      this.cameraController.addRecoil(
        weapon.currentRecoil.y * deltaTime * 60,
        weapon.currentRecoil.x * deltaTime * 60
      );
    }
    
    // Update weapons
    this.updateWeapons(deltaTime, input);
    
    // Update projectiles
    this.updateProjectiles(deltaTime);
    
    // Update AI
    this.updateAI(deltaTime);
    
    // Update mode-specific logic
    this.updateGameMode(deltaTime);
    
    // Update HUD
    this.updateHUD(deltaTime);
    
    // Update score
    this.setScore({
      score: this.localPlayer.score,
      time: this.gameTime,
      kills: this.localPlayer.kills,
      deaths: this.localPlayer.deaths,
    });
  }

  protected fixedUpdate(fixedDeltaTime: number): void {
    // Physics handled by engine
  }

  // ============================================================================
  // PLAYER MOVEMENT
  // ============================================================================

  private updatePlayerMovement(deltaTime: number, input: InputState): void {
    const player = this.localPlayer;
    const stats = player.stats;
    const movement = player.movement;
    
    // Get camera directions
    const forward = this.cameraController.getForward();
    const right = this.cameraController.getRight();
    
    // Calculate base move speed
    let moveSpeed = MOVEMENT.walkSpeed;
    
    // Update movement state
    const isMoving = Math.abs(input.virtual.moveX) > 0.1 || Math.abs(input.virtual.moveY) > 0.1;
    const wantsSprint = input.virtual.sprint && input.virtual.moveY > 0.5;
    const wantsCrouch = input.virtual.crouch;
    const wantsJump = input.virtual.jumpPressed;
    
    // Stamina management
    if (wantsSprint && stats.stamina > 0 && movement.state !== 'sliding') {
      stats.stamina = Math.max(0, stats.stamina - MOVEMENT.staminaDrain * deltaTime);
      moveSpeed = MOVEMENT.sprintSpeed;
      movement.state = 'sprinting';
    } else if (wantsCrouch && movement.isGrounded) {
      moveSpeed = MOVEMENT.crouchSpeed;
      movement.state = 'crouching';
    } else if (isMoving) {
      movement.state = 'walking';
    } else {
      movement.state = 'idle';
    }
    
    // Stamina regeneration
    if (!wantsSprint || stats.stamina === 0) {
      stats.stamina = Math.min(stats.maxStamina, stats.stamina + MOVEMENT.staminaRegen * deltaTime);
    }
    
    // Sliding
    this.slideCooldownTimer = Math.max(0, this.slideCooldownTimer - deltaTime);
    
    if (wantsCrouch && wantsSprint && movement.isGrounded && this.slideCooldownTimer === 0 && isMoving) {
      // Initiate slide
      this.slideTimer = MOVEMENT.slideDuration;
      this.lastSlideDirection.copy(forward).multiplyScalar(input.virtual.moveY)
        .add(right.clone().multiplyScalar(input.virtual.moveX))
        .normalize();
      movement.state = 'sliding';
    }
    
    if (this.slideTimer > 0) {
      this.slideTimer -= deltaTime;
      movement.state = 'sliding';
      moveSpeed = MOVEMENT.slideSpeed * (this.slideTimer / MOVEMENT.slideDuration);
      
      if (this.slideTimer <= 0) {
        this.slideCooldownTimer = MOVEMENT.slideCooldown;
      }
    }
    
    // Calculate movement vector
    const moveDir = new THREE.Vector3();
    
    if (movement.state === 'sliding') {
      moveDir.copy(this.lastSlideDirection);
    } else {
      moveDir.addScaledVector(forward, input.virtual.moveY);
      moveDir.addScaledVector(right, input.virtual.moveX);
      moveDir.normalize();
    }
    
    // Apply speed
    const desiredMove = moveDir.multiplyScalar(moveSpeed * deltaTime);
    
    // Coyote time
    if (movement.isGrounded) {
      this.coyoteTimer = MOVEMENT.coyoteTime;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - deltaTime);
    }
    
    // Jump buffer
    if (wantsJump) {
      this.jumpBufferTimer = MOVEMENT.jumpBuffer;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - deltaTime);
    }
    
    // Jumping
    if (this.jumpBufferTimer > 0 && (movement.isGrounded || this.coyoteTimer > 0)) {
      movement.velocity.y = MOVEMENT.jumpForce;
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      movement.state = 'jumping';
      movement.lastJumpTime = this.gameTime;
    }
    
    // Gravity
    if (!movement.isGrounded) {
      movement.velocity.y -= MOVEMENT.gravity * deltaTime;
      
      // Air control
      desiredMove.multiplyScalar(MOVEMENT.airControl);
      
      if (movement.velocity.y < 0) {
        movement.state = 'falling';
      }
    }
    
    // Apply vertical velocity
    desiredMove.y = movement.velocity.y * deltaTime;
    
    // Move with physics
    if (player.characterController) {
      const result = this.engine.physics.moveCharacter(
        player.characterController,
        desiredMove,
        deltaTime
      );
      
      movement.position.copy(result.translation);
      movement.isGrounded = result.grounded;
      
      if (result.grounded && movement.velocity.y < 0) {
        movement.velocity.y = 0;
      }
    }
    
    this.wasGrounded = movement.isGrounded;
  }

  // ============================================================================
  // WEAPONS
  // ============================================================================

  private updateWeapons(deltaTime: number, input: InputState): void {
    const player = this.localPlayer;
    const weaponState = player.weapons[player.currentWeaponIndex];
    if (!weaponState) return;
    
    const weapon = weaponState.definition;
    
    // Weapon switching
    if (input.keysJustPressed.has('Digit1')) player.currentWeaponIndex = 0;
    if (input.keysJustPressed.has('Digit2') && player.weapons.length > 1) player.currentWeaponIndex = 1;
    if (input.keysJustPressed.has('Digit3') && player.weapons.length > 2) player.currentWeaponIndex = 2;
    
    // ADS
    weaponState.isAiming = input.virtual.aim;
    if (weaponState.isAiming) {
      weaponState.aimProgress = Math.min(1, weaponState.aimProgress + deltaTime / weapon.adsTime);
    } else {
      weaponState.aimProgress = Math.max(0, weaponState.aimProgress - deltaTime / (weapon.adsTime * 0.7));
    }
    
    // Reload
    if ((input.virtual.reloadPressed || weaponState.currentAmmo === 0) && !weaponState.isReloading) {
      if (weaponState.reserveAmmo > 0 && weaponState.currentAmmo < weapon.magazineSize) {
        weaponState.isReloading = true;
        weaponState.reloadProgress = 0;
      }
    }
    
    if (weaponState.isReloading) {
      weaponState.reloadProgress += deltaTime;
      
      if (weapon.reloadType === 'shell') {
        // Shell-by-shell reload
        if (weaponState.reloadProgress >= weapon.reloadTime) {
          weaponState.reloadProgress = 0;
          if (weaponState.reserveAmmo > 0 && weaponState.currentAmmo < weapon.magazineSize) {
            weaponState.currentAmmo++;
            weaponState.reserveAmmo--;
          }
          
          if (weaponState.currentAmmo >= weapon.magazineSize || weaponState.reserveAmmo <= 0) {
            weaponState.isReloading = false;
          }
        }
      } else {
        // Magazine reload
        if (weaponState.reloadProgress >= weapon.reloadTime) {
          const needed = weapon.magazineSize - weaponState.currentAmmo;
          const available = Math.min(needed, weaponState.reserveAmmo);
          weaponState.currentAmmo += available;
          weaponState.reserveAmmo -= available;
          weaponState.isReloading = false;
        }
      }
    }
    
    // Spread recovery
    const spreadRecovery = weapon.spreadRecoveryRate * deltaTime;
    weaponState.currentSpread = Math.max(weapon.baseSpread, weaponState.currentSpread - spreadRecovery);
    
    // Movement spread penalty
    if (player.movement.state === 'sprinting') {
      weaponState.currentSpread += weapon.moveSpreadPenalty * 2 * deltaTime;
    } else if (player.movement.state === 'walking') {
      weaponState.currentSpread += weapon.moveSpreadPenalty * deltaTime;
    }
    
    if (!player.movement.isGrounded) {
      weaponState.currentSpread += weapon.jumpSpreadPenalty * deltaTime;
    }
    
    // ADS spread bonus
    if (weaponState.isAiming) {
      const adsBonus = weapon.adsSpreadBonus * weaponState.aimProgress;
      weaponState.currentSpread = Math.max(
        weapon.baseSpread * (1 - adsBonus),
        weaponState.currentSpread * (1 - adsBonus * 0.5)
      );
    }
    
    // Cap spread
    weaponState.currentSpread = Math.min(weapon.maxSpread, weaponState.currentSpread);
    
    // Recoil recovery
    const recoilRecovery = weapon.recoilRecoveryRate * deltaTime;
    weaponState.currentRecoil.x *= Math.max(0, 1 - recoilRecovery);
    weaponState.currentRecoil.y *= Math.max(0, 1 - recoilRecovery);
    
    // Firing
    const canFire = !weaponState.isReloading && weaponState.currentAmmo > 0;
    const fireRate = 60 / weapon.fireRate; // Convert RPM to seconds
    const timeSinceLastFire = this.gameTime - weaponState.lastFireTime;
    
    let wantsFire = false;
    if (weapon.fireMode === 'auto') {
      wantsFire = input.virtual.fire;
    } else if (weapon.fireMode === 'semi') {
      wantsFire = input.virtual.firePressed;
    } else if (weapon.fireMode === 'burst') {
      wantsFire = input.virtual.firePressed;
    }
    
    if (canFire && wantsFire && timeSinceLastFire >= fireRate) {
      this.fireWeapon(player, weaponState);
    }
  }

  private fireWeapon(player: Player, weaponState: WeaponState): void {
    const weapon = weaponState.definition;
    
    // Consume ammo
    weaponState.currentAmmo--;
    weaponState.lastFireTime = this.gameTime;
    
    // Get fire origin and direction
    const origin = this.engine.camera.position.clone();
    const direction = this.cameraController.getLookDirection();
    
    // Fire projectiles (multiple for shotguns)
    const pelletCount = weapon.pelletCount || 1;
    
    for (let i = 0; i < pelletCount; i++) {
      // Apply spread
      const spreadDir = direction.clone();
      const spread = weaponState.currentSpread;
      spreadDir.x += (Math.random() - 0.5) * spread;
      spreadDir.y += (Math.random() - 0.5) * spread;
      spreadDir.z += (Math.random() - 0.5) * spread;
      spreadDir.normalize();
      
      this.createProjectile(
        origin.clone().add(spreadDir.clone().multiplyScalar(0.5)),
        spreadDir,
        weapon.bulletSpeed,
        weapon.baseDamage,
        player.id,
        weapon
      );
    }
    
    // Muzzle flash
    const muzzleFlash = this.getParticleSystem('muzzle_flash');
    if (muzzleFlash) {
      const flashPos = origin.clone().add(direction.clone().multiplyScalar(1));
      muzzleFlash.setPosition(flashPos);
      muzzleFlash.burst(Math.ceil(weapon.muzzleFlashSize * 15));
    }
    
    // Apply recoil
    weaponState.currentRecoil.y += weapon.recoilVertical;
    weaponState.currentRecoil.x += (Math.random() - 0.5) * weapon.recoilHorizontal * 2;
    
    // Add spread
    weaponState.currentSpread = Math.min(weapon.maxSpread, weaponState.currentSpread + weapon.recoilVertical * 0.5);
    
    // Camera shake
    this.cameraController.addShake(weapon.recoilVertical * 0.3, 0.08, 35);
    
    // Gamepad vibration
    this.vibrateGamepad(60, weapon.recoilVertical * 3, weapon.recoilVertical * 1.5);
  }

  // ============================================================================
  // PROJECTILES
  // ============================================================================

  private createProjectile(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    speed: number,
    damage: number,
    ownerId: string,
    weapon: WeaponDefinition
  ): void {
    const id = `proj_${this.projectileIdCounter++}`;
    
    // Create bullet mesh
    const geometry = new THREE.SphereGeometry(0.015, 4, 4);
    const material = new THREE.MeshBasicMaterial({
      color: ownerId === 'local' ? 0xffff44 : 0xff4444,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(origin);
    this.engine.add(mesh);
    
    // Create physics body
    const body = this.engine.physics.addSphere(
      mesh,
      0.015,
      'dynamic',
      {
        ccd: true,
        gravityScale: weapon.bulletDrop,
        collisionGroups: CollisionGroups.PROJECTILE,
      }
    );
    
    // Set velocity
    const velocity = direction.clone().multiplyScalar(speed);
    this.engine.physics.setLinearVelocity(body, velocity);
    
    this.projectiles.push({
      id,
      mesh,
      body,
      velocity,
      owner: ownerId,
      weapon,
      damage,
      penetration: weapon.penetration,
      lifetime: 4,
      hasHit: false,
      trailEnabled: Math.random() < weapon.tracerFrequency / 5,
    });
  }

  private updateProjectiles(deltaTime: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.lifetime -= deltaTime;
      
      if (projectile.lifetime <= 0 || projectile.hasHit) {
        this.removeProjectile(i);
        continue;
      }
      
      // Check hits
      const pos = projectile.mesh.position;
      
      // Check against players
      this.players.forEach((player, playerId) => {
        if (playerId === projectile.owner || !player.isAlive) return;
        
        const playerPos = player.movement.position.clone();
        playerPos.y += 1; // Center of body
        
        const distance = pos.distanceTo(playerPos);
        if (distance < 0.8) {
          // Hit!
          const isHeadshot = pos.y > playerPos.y + 0.6;
          const isLimbshot = Math.abs(pos.x - playerPos.x) > 0.3 || Math.abs(pos.z - playerPos.z) > 0.3;
          
          let damage = projectile.damage;
          if (isHeadshot) {
            damage *= projectile.weapon.headshotMultiplier;
          } else if (isLimbshot) {
            damage *= projectile.weapon.limbDamageMultiplier;
          }
          
          this.damagePlayer(player, damage, projectile.owner, isHeadshot, pos);
          projectile.hasHit = true;
          
          // Blood effect
          const blood = this.getParticleSystem('blood');
          if (blood) {
            blood.setPosition(pos);
            blood.burst(15);
          }
          
          // Hit marker for local player
          if (projectile.owner === 'local') {
            this.hitMarkerTime = 0.15;
            this.hudState.hitMarker = true;
          }
        }
      });
      
      // Check against environment (raycast check could be done here)
    }
  }

  private removeProjectile(index: number): void {
    const projectile = this.projectiles[index];
    this.engine.remove(projectile.mesh);
    this.engine.physics.removeBody(projectile.body);
    projectile.mesh.geometry.dispose();
    (projectile.mesh.material as THREE.Material).dispose();
    this.projectiles.splice(index, 1);
  }

  // ============================================================================
  // DAMAGE SYSTEM
  // ============================================================================

  private damagePlayer(
    player: Player,
    damage: number,
    attackerId: string,
    isHeadshot: boolean,
    hitPosition: THREE.Vector3
  ): void {
    // Armor absorption
    let actualDamage = damage;
    if (player.stats.armor > 0) {
      const armorAbsorb = Math.min(player.stats.armor, damage * 0.5);
      player.stats.armor -= armorAbsorb;
      actualDamage -= armorAbsorb;
    }
    
    player.stats.health -= actualDamage;
    
    // Record damage event
    const event: DamageEvent = {
      sourceId: attackerId,
      targetId: player.id,
      amount: actualDamage,
      type: 'bullet',
      position: hitPosition,
      isHeadshot,
      timestamp: this.gameTime,
    };
    this.matchState.damageEvents.push(event);
    
    // Handle death
    if (player.stats.health <= 0) {
      player.stats.health = 0;
      this.killPlayer(player, attackerId, isHeadshot);
    }
    
    // Damage feedback for local player
    if (player.id === 'local') {
      const attackerPos = this.players.get(attackerId)?.movement.position;
      if (attackerPos) {
        const direction = Math.atan2(
          attackerPos.x - player.movement.position.x,
          attackerPos.z - player.movement.position.z
        ) - player.movement.rotation.y;
        
        this.damageIndicators.push({
          direction,
          intensity: Math.min(1, actualDamage / 50),
          lifetime: 1.0,
        });
      }
      
      this.screenShake(Math.min(0.4, actualDamage / 100), 0.15);
      this.vibrateGamepad(100, 0.6, 0.4);
    }
    
    // AI damage callback
    this.aiDirector.recordPlayerEvent({
      type: 'damage',
      playerId: attackerId,
      targetId: player.id,
      amount: actualDamage,
      direction: hitPosition.clone().sub(player.movement.position),
      isPlayer: attackerId === 'local',
    });
  }

  private killPlayer(player: Player, killerId: string, isHeadshot: boolean): void {
    player.isAlive = false;
    player.deaths++;
    
    const killer = this.players.get(killerId);
    if (killer) {
      killer.kills++;
      killer.score += isHeadshot ? 150 : 100;
      
      // Kill confirm for local player
      if (killerId === 'local') {
        this.killConfirmTime = 0.3;
        this.hudState.killConfirmed = true;
      }
    }
    
    // Kill feed
    this.matchState.killFeed.unshift({
      killerId,
      killerName: killer?.name || 'Unknown',
      victimId: player.id,
      victimName: player.name,
      weaponId: killer?.weapons[killer.currentWeaponIndex]?.definition.id || 'unknown',
      isHeadshot,
      timestamp: this.gameTime,
    });
    
    // Keep only last 5 entries
    if (this.matchState.killFeed.length > 5) {
      this.matchState.killFeed.pop();
    }
    
    // AI events
    this.aiDirector.recordPlayerEvent({
      type: 'kill',
      playerId: killerId,
      targetId: player.id,
      isPlayer: killerId === 'local',
    });
    
    // Game over check for local player
    if (player.id === 'local') {
      this.end(false);
    }
    
    // Wave tracking
    if (player.team === 'bravo') {
      this.waveEnemiesRemaining--;
    }
  }

  // ============================================================================
  // AI UPDATE
  // ============================================================================

  private updateAI(deltaTime: number): void {
    const allPlayers = Array.from(this.players.values());
    
    const decisions = this.aiDirector.update(
      deltaTime,
      this.gameTime,
      allPlayers,
      this.coverPoints
    );
    
    // Apply AI decisions
    decisions.forEach((decision, playerId) => {
      const player = this.players.get(playerId);
      if (!player || !player.isAlive) return;
      
      this.applyAIDecision(player, decision, deltaTime);
    });
  }

  private applyAIDecision(player: Player, decision: AIDecision, deltaTime: number): void {
    // Movement
    if (decision.moveDirection.lengthSq() > 0.01) {
      const speed = decision.shouldSprint ? MOVEMENT.sprintSpeed : MOVEMENT.walkSpeed;
      const movement = decision.moveDirection.clone().multiplyScalar(speed * deltaTime);
      player.movement.position.add(movement);
    }
    
    // Look direction (for visual representation)
    if (decision.lookDirection.lengthSq() > 0.01) {
      player.movement.rotation.y = Math.atan2(decision.lookDirection.x, decision.lookDirection.z);
    }
    
    // Combat
    if (decision.shouldFire) {
      const weapon = player.weapons[player.currentWeaponIndex];
      if (weapon && weapon.currentAmmo > 0 && !weapon.isReloading) {
        this.aiFireWeapon(player, weapon, decision.lookDirection);
      }
    }
    
    if (decision.shouldReload) {
      const weapon = player.weapons[player.currentWeaponIndex];
      if (weapon && !weapon.isReloading && weapon.reserveAmmo > 0) {
        weapon.isReloading = true;
        weapon.reloadProgress = 0;
      }
    }
    
    // Update AI weapon reload
    player.weapons.forEach(weapon => {
      if (weapon.isReloading) {
        weapon.reloadProgress += deltaTime;
        if (weapon.reloadProgress >= weapon.definition.reloadTime) {
          const needed = weapon.definition.magazineSize - weapon.currentAmmo;
          const available = Math.min(needed, weapon.reserveAmmo);
          weapon.currentAmmo += available;
          weapon.reserveAmmo -= available;
          weapon.isReloading = false;
        }
      }
    });
  }

  private aiFireWeapon(player: Player, weaponState: WeaponState, direction: THREE.Vector3): void {
    const weapon = weaponState.definition;
    const fireRate = 60 / weapon.fireRate;
    
    if (this.gameTime - weaponState.lastFireTime < fireRate) return;
    
    weaponState.currentAmmo--;
    weaponState.lastFireTime = this.gameTime;
    
    // AI accuracy is built into the AI system, apply base spread
    const spreadDir = direction.clone();
    const spread = weapon.baseSpread * 1.5; // AI gets slightly more spread
    spreadDir.x += (Math.random() - 0.5) * spread;
    spreadDir.y += (Math.random() - 0.5) * spread;
    spreadDir.z += (Math.random() - 0.5) * spread;
    spreadDir.normalize();
    
    const origin = player.movement.position.clone();
    origin.y += 1.5; // Eye level
    
    this.createProjectile(origin, spreadDir, weapon.bulletSpeed, weapon.baseDamage, player.id, weapon);
  }

  // ============================================================================
  // GAME MODE UPDATES
  // ============================================================================

  private updateGameMode(deltaTime: number): void {
    switch (this.gameMode) {
      case 'coop_survival':
        this.updateSurvivalMode(deltaTime);
        break;
      case 'campaign':
        this.updateCampaignMode(deltaTime);
        break;
      case 'training':
        this.updateTrainingMode(deltaTime);
        break;
      case 'arena_pvp':
        this.updateArenaPvPMode(deltaTime);
        break;
    }
  }

  private updateSurvivalMode(deltaTime: number): void {
    if (!this.isWaveActive) {
      this.waveTimer -= deltaTime;
      
      if (this.waveTimer <= 0) {
        this.startNextWave();
      }
    } else {
      // Check wave completion
      const activeEnemies = Array.from(this.players.values())
        .filter(p => p.team === 'bravo' && p.isAlive)
        .length;
      
      if (activeEnemies === 0 && this.waveEnemiesRemaining <= 0) {
        this.isWaveActive = false;
        
        const waveDef = this.waveDefinitions[this.currentWave - 1];
        this.waveTimer = waveDef?.waveDelay || 10;
        
        // Wave complete bonus
        this.localPlayer.score += this.currentWave * 500;
      }
    }
  }

  private startNextWave(): void {
    this.currentWave++;
    this.isWaveActive = true;
    
    if (this.currentWave > this.waveDefinitions.length) {
      // Victory!
      this.end(true);
      return;
    }
    
    const waveDef = this.waveDefinitions[this.currentWave - 1];
    this.waveEnemiesRemaining = waveDef.enemyCount;
    
    // Spawn enemies
    let spawnIndex = 0;
    const bravoSpawns = this.spawnPoints.filter(s => s.team === 'bravo');
    
    waveDef.enemyTypes.forEach(enemyType => {
      for (let i = 0; i < enemyType.count; i++) {
        const spawnPoint = bravoSpawns[spawnIndex % bravoSpawns.length];
        const spawnPos = spawnPoint.position.clone();
        spawnPos.x += (Math.random() - 0.5) * 5;
        spawnPos.z += (Math.random() - 0.5) * 5;
        
        // Stagger spawns
        setTimeout(() => {
          if (this.state === 'playing') {
            this.spawnEnemy(spawnPos, enemyType.personality, enemyType.type);
          }
        }, spawnIndex * waveDef.spawnDelay * 1000);
        
        spawnIndex++;
      }
    });
    
    console.log(`[SentinelProtocol] Wave ${this.currentWave} started - ${waveDef.enemyCount} enemies`);
  }

  private spawnEnemy(position: THREE.Vector3, personality: AIPersonality, type: string): void {
    const id = `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create enemy player
    const enemy = this.createPlayer(id, `${type}_${this.currentWave}`, 'bravo', position);
    
    // Scale stats by wave
    const waveMultiplier = 1 + (this.currentWave - 1) * 0.15;
    enemy.stats.health *= waveMultiplier;
    enemy.stats.maxHealth = enemy.stats.health;
    
    // Equip based on type
    switch (type) {
      case 'soldier':
        this.equipWeapon(enemy, PHANTOM_AR);
        break;
      case 'heavy':
        enemy.stats.health *= 1.5;
        enemy.stats.maxHealth = enemy.stats.health;
        this.equipWeapon(enemy, ALL_WEAPONS.odin_lmg);
        break;
      case 'scout':
        this.equipWeapon(enemy, ALL_WEAPONS.viper_smg);
        break;
      case 'boss':
        enemy.stats.health *= 3;
        enemy.stats.maxHealth = enemy.stats.health;
        this.equipWeapon(enemy, ALL_WEAPONS.bulldog_762);
        break;
      default:
        this.equipWeapon(enemy, ALL_WEAPONS.spectre_9);
    }
    
    this.players.set(id, enemy);
    
    // Create AI controller
    const difficultyLevel = this.currentWave < 5 ? 'easy' : 
                          this.currentWave < 10 ? 'medium' :
                          this.currentWave < 20 ? 'hard' : 'expert';
    
    this.aiDirector.createAI(enemy, {
      personality,
      difficultyLevel: difficultyLevel as any,
      adaptToPlayer: true,
      teamCoordination: true,
    });
    
    // Create visual representation
    this.createEnemyMesh(enemy);
  }

  private createEnemyMesh(enemy: Player): void {
    const group = new THREE.Group();
    
    // Body
    const bodyGeo = new THREE.CapsuleGeometry(0.3, 1.0, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x660000,
      roughness: 0.7,
      metalness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xaa7766,
      roughness: 0.8,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.55;
    head.castShadow = true;
    group.add(head);
    
    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.08, 1.6, 0.15);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.08, 1.6, 0.15);
    group.add(rightEye);
    
    group.position.copy(enemy.movement.position);
    this.engine.add(group);
    this.levelMeshes.push(group);
    
    // Store mesh reference
    (enemy as any).mesh = group;
    
    // Update mesh position in update loop
    const updateMesh = () => {
      if (enemy.isAlive && (enemy as any).mesh) {
        (enemy as any).mesh.position.copy(enemy.movement.position);
        (enemy as any).mesh.rotation.y = enemy.movement.rotation.y;
      }
    };
    
    // Add to render callback
    this.engine.onUpdate((dt, et, input) => updateMesh());
  }

  private updateCampaignMode(deltaTime: number): void {
    // Would update mission objectives
  }

  private updateTrainingMode(deltaTime: number): void {
    // Update training targets
    this.trainingTargets.forEach(target => {
      target.rotation.y += deltaTime;
    });
  }

  private updateArenaPvPMode(deltaTime: number): void {
    // Would update PvP match state
    if (this.matchState.timeRemaining > 0) {
      this.matchState.timeRemaining -= deltaTime;
    }
  }

  // ============================================================================
  // HUD UPDATE
  // ============================================================================

  private updateHUD(deltaTime: number): void {
    const player = this.localPlayer;
    const weapon = player.weapons[player.currentWeaponIndex];
    
    this.hudState.health = player.stats.health;
    this.hudState.maxHealth = player.stats.maxHealth;
    this.hudState.armor = player.stats.armor;
    this.hudState.maxArmor = player.stats.maxArmor;
    this.hudState.stamina = player.stats.stamina;
    this.hudState.maxStamina = player.stats.maxStamina;
    
    if (weapon) {
      this.hudState.ammo = weapon.currentAmmo;
      this.hudState.maxAmmo = weapon.definition.magazineSize;
      this.hudState.reserveAmmo = weapon.reserveAmmo;
      this.hudState.weaponName = weapon.definition.name;
      this.hudState.isReloading = weapon.isReloading;
      this.hudState.reloadProgress = weapon.reloadProgress / weapon.definition.reloadTime;
      this.hudState.crosshairSpread = weapon.currentSpread / weapon.definition.maxSpread;
    }
    
    // Hit marker fade
    if (this.hitMarkerTime > 0) {
      this.hitMarkerTime -= deltaTime;
      if (this.hitMarkerTime <= 0) {
        this.hudState.hitMarker = false;
      }
    }
    
    // Kill confirm fade
    if (this.killConfirmTime > 0) {
      this.killConfirmTime -= deltaTime;
      if (this.killConfirmTime <= 0) {
        this.hudState.killConfirmed = false;
      }
    }
    
    // Damage indicators fade
    this.damageIndicators = this.damageIndicators.filter(di => {
      di.lifetime -= deltaTime;
      return di.lifetime > 0;
    });
    this.hudState.damageIndicators = [...this.damageIndicators];
    
    // Kill feed
    this.hudState.killfeed = this.matchState.killFeed.slice(0, 5);
    
    // Score
    this.hudState.score = this.matchState.scores;
    this.hudState.time = this.matchState.timeRemaining;
    this.hudState.round = this.currentWave;
  }

  // ============================================================================
  // PUBLIC GETTERS
  // ============================================================================

  public getHUDState(): HUDState {
    return { ...this.hudState };
  }

  public getGameMode(): GameMode {
    return this.gameMode;
  }

  public getCurrentWave(): number {
    return this.currentWave;
  }

  public getWaveTimer(): number {
    return this.waveTimer;
  }

  public isWaveInProgress(): boolean {
    return this.isWaveActive;
  }

  public getPlayerHealth(): number {
    return this.localPlayer?.stats.health ?? 100;
  }

  public getPlayerArmor(): number {
    return this.localPlayer?.stats.armor ?? 0;
  }

  public setGameMode(mode: GameMode): void {
    this.gameMode = mode;
  }

  public setGraphicsTier(tier: 0 | 1 | 2 | 3): void {
    this.graphicsTier = tier;
    const settings = GRAPHICS_TIERS[tier];
    
    // Apply settings to engine
    console.log(`[SentinelProtocol] Graphics tier set to ${tier}: ${settings.name}`);
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  protected cleanup(): void {
    // Remove projectiles
    while (this.projectiles.length > 0) {
      this.removeProjectile(0);
    }
    
    // Remove level meshes
    this.levelMeshes.forEach(mesh => {
      this.engine.remove(mesh);
      if (mesh instanceof THREE.Mesh) {
        mesh.geometry.dispose();
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose();
        }
      }
    });
    this.levelMeshes = [];
    
    // Dispose AI
    this.aiDirector.dispose();
    
    // Clear players
    this.players.clear();
    
    console.log('[SentinelProtocol] Cleanup complete');
  }

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  protected onGameStart(): void {
    this.requestPointerLock();
    this.matchState.phase = 'active';
  }

  protected onGamePause(): void {
    this.exitPointerLock();
  }

  protected onGameResume(): void {
    this.requestPointerLock();
  }

  protected onGameEnd(victory: boolean): void {
    this.exitPointerLock();
    this.matchState.phase = 'ended';
    console.log(`[SentinelProtocol] Game ended - ${victory ? 'VICTORY' : 'DEFEAT'}`);
    console.log(`Final Score: ${this.localPlayer.score} | Kills: ${this.localPlayer.kills} | Wave: ${this.currentWave}`);
  }
}

export default SentinelProtocolGame;
