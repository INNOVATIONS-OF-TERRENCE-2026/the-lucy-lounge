/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — TRACK & FIELD OLYMPICS                                       │
 * │                                                                             │
 * │ AAA-quality Olympic sports game with:                                      │
 * │ • Multiple athletic events                                                 │
 * │ • Physics-based gameplay                                                   │
 * │ • AI competitors                                                           │
 * │ • Record tracking                                                          │
 * │ • Multiplayer support                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  OrbitCameraController,
  ThirdPersonCameraController,
  ParticlePresets,
  CollisionGroups,
  type PhysicsBody,
  type InputState,
} from '../../engine3d';

// ============================================================================
// TYPES
// ============================================================================

type EventType = 
  | '100m-sprint'
  | 'long-jump'
  | 'high-jump'
  | 'javelin'
  | 'shot-put'
  | 'discus'
  | '110m-hurdles'
  | 'pole-vault';

interface EventConfig {
  id: EventType;
  name: string;
  description: string;
  worldRecord: number;
  unit: string;
  higherIsBetter: boolean;
}

interface Athlete {
  id: string;
  name: string;
  country: string;
  color: number;
  mesh: THREE.Group;
  body?: PhysicsBody;
  
  // Animation state
  animationTime: number;
  runCycle: number;
  
  // Event state
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isRunning: boolean;
  stamina: number;
  maxStamina: number;
  
  // Results
  result: number;
  isFinished: boolean;
  lane: number;
}

interface SprintState {
  distance: number;
  speed: number;
  maxSpeed: number;
  powerMeter: number;
  lastTapTime: number;
  tapCount: number;
}

interface JumpState {
  phase: 'approach' | 'takeoff' | 'flight' | 'landing' | 'finished';
  approachSpeed: number;
  takeoffAngle: number;
  takeoffPower: number;
  jumpDistance: number;
  jumpHeight: number;
}

interface ThrowState {
  phase: 'windup' | 'release' | 'flight' | 'landed';
  windupPower: number;
  releaseAngle: number;
  spinSpeed: number;
  distance: number;
  projectile?: THREE.Mesh;
  projectileBody?: PhysicsBody;
}

// ============================================================================
// EVENT CONFIGURATIONS
// ============================================================================

const EVENTS: Record<EventType, EventConfig> = {
  '100m-sprint': {
    id: '100m-sprint',
    name: '100m Sprint',
    description: 'Tap rapidly to run! Fastest time wins.',
    worldRecord: 9.58,
    unit: 's',
    higherIsBetter: false,
  },
  'long-jump': {
    id: 'long-jump',
    name: 'Long Jump',
    description: 'Build speed, then jump at the perfect angle!',
    worldRecord: 8.95,
    unit: 'm',
    higherIsBetter: true,
  },
  'high-jump': {
    id: 'high-jump',
    name: 'High Jump',
    description: 'Time your approach and clear the bar!',
    worldRecord: 2.45,
    unit: 'm',
    higherIsBetter: true,
  },
  'javelin': {
    id: 'javelin',
    name: 'Javelin Throw',
    description: 'Build power and release at the optimal angle!',
    worldRecord: 98.48,
    unit: 'm',
    higherIsBetter: true,
  },
  'shot-put': {
    id: 'shot-put',
    name: 'Shot Put',
    description: 'Spin and release the heavy shot!',
    worldRecord: 23.37,
    unit: 'm',
    higherIsBetter: true,
  },
  'discus': {
    id: 'discus',
    name: 'Discus Throw',
    description: 'Spin and release the discus with precision!',
    worldRecord: 74.08,
    unit: 'm',
    higherIsBetter: true,
  },
  '110m-hurdles': {
    id: '110m-hurdles',
    name: '110m Hurdles',
    description: 'Sprint and jump over hurdles!',
    worldRecord: 12.80,
    unit: 's',
    higherIsBetter: false,
  },
  'pole-vault': {
    id: 'pole-vault',
    name: 'Pole Vault',
    description: 'Run, plant, and vault over the bar!',
    worldRecord: 6.21,
    unit: 'm',
    higherIsBetter: true,
  },
};

// ============================================================================
// TRACK & FIELD GAME CLASS
// ============================================================================

export class TrackFieldGame extends Game3DBase {
  // Camera
  private cameraController!: ThirdPersonCameraController;
  
  // Current event
  private currentEvent: EventType = '100m-sprint';
  private eventConfig!: EventConfig;
  
  // Athletes
  private playerAthlete!: Athlete;
  private aiAthletes: Athlete[] = [];
  private allAthletes: Athlete[] = [];
  
  // Event state
  private sprintState!: SprintState;
  private jumpState!: JumpState;
  private throwState!: ThrowState;
  
  // Track/field geometry
  private trackMeshes: THREE.Mesh[] = [];
  
  // Race state
  private eventStarted: boolean = false;
  private eventFinished: boolean = false;
  private countdownTime: number = 0;
  private eventTime: number = 0;
  
  // Records
  private personalBests: Map<EventType, number> = new Map();

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        shadowMapSize: 2048,
        bloom: true,
        bloomStrength: 0.4,
        bloomThreshold: 0.9,
        fog: { color: 0x87ceeb, near: 100, far: 500 },
        ...config?.engineConfig,
      },
    });
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  protected async loadAssets(): Promise<void> {
    console.log('[TrackField] Loading assets...');
    console.log('[TrackField] Assets loaded');
  }

  protected initScene(): void {
    console.log('[TrackField] Initializing scene...');
    
    // Setup lighting
    this.setupLighting();
    
    // Create stadium
    this.createStadium();
    
    // Setup event
    this.eventConfig = EVENTS[this.currentEvent];
    this.setupEvent();
    
    // Create athletes
    this.createAthletes();
    
    // Setup camera
    this.cameraController = new ThirdPersonCameraController(this.engine.camera, {
      distance: 15,
      height: 5,
      minPitch: 0,
      maxPitch: 1.2,
    });
    
    // Create particle systems
    this.createParticleSystem('dust', ParticlePresets.dust());
    this.createParticleSystem('sparks', ParticlePresets.sparks());
    
    // Initialize state
    this.eventStarted = false;
    this.eventFinished = false;
    this.countdownTime = 4;
    this.eventTime = 0;
    
    // Create skybox
    this.createGradientSkybox(0x87ceeb, 0xffffff);
    
    console.log('[TrackField] Scene initialized');
  }

  private setupLighting(): void {
    // Bright daylight
    this.engine.addAmbientLight(0xffffff, 0.6);
    
    // Sun
    const sun = this.engine.addDirectionalLight(
      0xffffff,
      1.0,
      new THREE.Vector3(50, 100, 30),
      true
    );
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;
  }

  private createStadium(): void {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(300, 300);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.engine.add(ground);
    
    // Track (oval)
    this.createTrack();
    
    // Stadium stands (simplified)
    this.createStands();
  }

  private createTrack(): void {
    // Running track surface
    const trackGeometry = new THREE.RingGeometry(30, 50, 64);
    const trackMaterial = new THREE.MeshStandardMaterial({
      color: 0xcc4400,
      roughness: 0.7,
    });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0.01;
    track.receiveShadow = true;
    this.engine.add(track);
    this.trackMeshes.push(track);
    
    // Lane lines
    for (let i = 0; i < 8; i++) {
      const radius = 32 + i * 2.5;
      const lineGeometry = new THREE.RingGeometry(radius - 0.05, radius + 0.05, 64);
      const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.y = 0.02;
      this.engine.add(line);
    }
    
    // Straight section for 100m
    const straightGeometry = new THREE.PlaneGeometry(120, 20);
    const straightMaterial = new THREE.MeshStandardMaterial({
      color: 0xcc4400,
      roughness: 0.7,
    });
    const straight = new THREE.Mesh(straightGeometry, straightMaterial);
    straight.rotation.x = -Math.PI / 2;
    straight.position.set(0, 0.01, 60);
    straight.receiveShadow = true;
    this.engine.add(straight);
    this.trackMeshes.push(straight);
    
    // Start/finish lines
    const lineGeo = new THREE.PlaneGeometry(0.2, 20);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const startLine = new THREE.Mesh(lineGeo, lineMat);
    startLine.rotation.x = -Math.PI / 2;
    startLine.position.set(-50, 0.02, 60);
    this.engine.add(startLine);
    
    const finishLine = new THREE.Mesh(lineGeo, lineMat);
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.set(50, 0.02, 60);
    this.engine.add(finishLine);
  }

  private createStands(): void {
    const standMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.8,
    });
    
    // Simple bleacher geometry
    const positions = [
      { x: 0, z: -70, rotY: 0 },
      { x: 0, z: 130, rotY: Math.PI },
      { x: -80, z: 30, rotY: Math.PI / 2 },
      { x: 80, z: 30, rotY: -Math.PI / 2 },
    ];
    
    positions.forEach(({ x, z, rotY }) => {
      const standGeometry = new THREE.BoxGeometry(100, 20, 30);
      const stand = new THREE.Mesh(standGeometry, standMaterial);
      stand.position.set(x, 10, z);
      stand.rotation.y = rotY;
      stand.castShadow = true;
      stand.receiveShadow = true;
      this.engine.add(stand);
    });
  }

  private setupEvent(): void {
    switch (this.currentEvent) {
      case '100m-sprint':
      case '110m-hurdles':
        this.setupSprintEvent();
        break;
      case 'long-jump':
      case 'high-jump':
      case 'pole-vault':
        this.setupJumpEvent();
        break;
      case 'javelin':
      case 'shot-put':
      case 'discus':
        this.setupThrowEvent();
        break;
    }
  }

  private setupSprintEvent(): void {
    this.sprintState = {
      distance: 0,
      speed: 0,
      maxSpeed: 12,
      powerMeter: 0,
      lastTapTime: 0,
      tapCount: 0,
    };
    
    // Create hurdles for 110m hurdles
    if (this.currentEvent === '110m-hurdles') {
      this.createHurdles();
    }
  }

  private setupJumpEvent(): void {
    this.jumpState = {
      phase: 'approach',
      approachSpeed: 0,
      takeoffAngle: 45,
      takeoffPower: 0,
      jumpDistance: 0,
      jumpHeight: 0,
    };
    
    // Create jump pit
    this.createJumpPit();
    
    // Create high jump bar if needed
    if (this.currentEvent === 'high-jump' || this.currentEvent === 'pole-vault') {
      this.createHighJumpBar();
    }
  }

  private setupThrowEvent(): void {
    this.throwState = {
      phase: 'windup',
      windupPower: 0,
      releaseAngle: 45,
      spinSpeed: 0,
      distance: 0,
    };
    
    // Create throwing circle
    this.createThrowingCircle();
    
    // Create sector lines
    this.createSectorLines();
  }

  private createHurdles(): void {
    const hurdleMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
    });
    
    // 10 hurdles, first at 13.72m, then every 9.14m
    for (let i = 0; i < 10; i++) {
      const distance = 13.72 + i * 9.14;
      const x = -50 + distance;
      
      // Hurdle frame
      const frameGeometry = new THREE.BoxGeometry(3, 0.1, 0.1);
      const frame = new THREE.Mesh(frameGeometry, hurdleMaterial);
      frame.position.set(x, 1.067, 60); // 1.067m height for men's hurdles
      this.engine.add(frame);
      
      // Legs
      const legGeometry = new THREE.BoxGeometry(0.1, 1.067, 0.1);
      const leftLeg = new THREE.Mesh(legGeometry, hurdleMaterial);
      leftLeg.position.set(x - 1.4, 0.53, 60);
      this.engine.add(leftLeg);
      
      const rightLeg = new THREE.Mesh(legGeometry, hurdleMaterial);
      rightLeg.position.set(x + 1.4, 0.53, 60);
      this.engine.add(rightLeg);
    }
  }

  private createJumpPit(): void {
    // Sand pit
    const pitGeometry = new THREE.BoxGeometry(10, 0.3, 3);
    const pitMaterial = new THREE.MeshStandardMaterial({
      color: 0xf4d03f,
      roughness: 1,
    });
    const pit = new THREE.Mesh(pitGeometry, pitMaterial);
    pit.position.set(20, -0.1, 60);
    pit.receiveShadow = true;
    this.engine.add(pit);
    
    // Takeoff board
    const boardGeometry = new THREE.BoxGeometry(1.22, 0.1, 0.2);
    const boardMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.set(10, 0.05, 60);
    this.engine.add(board);
  }

  private createHighJumpBar(): void {
    const barMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      roughness: 0.3,
    });
    
    // Standards (uprights)
    const standardGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
    const standardMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.5,
    });
    
    const leftStandard = new THREE.Mesh(standardGeometry, standardMaterial);
    leftStandard.position.set(0, 1.5, 58);
    this.engine.add(leftStandard);
    
    const rightStandard = new THREE.Mesh(standardGeometry, standardMaterial);
    rightStandard.position.set(0, 1.5, 62);
    this.engine.add(rightStandard);
    
    // Bar
    const barGeometry = new THREE.CylinderGeometry(0.02, 0.02, 4, 8);
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.rotation.x = Math.PI / 2;
    bar.position.set(0, 2, 60);
    this.engine.add(bar);
    
    // Landing mat
    const matGeometry = new THREE.BoxGeometry(6, 1, 4);
    const matMaterial = new THREE.MeshStandardMaterial({
      color: 0x0066cc,
      roughness: 0.9,
    });
    const mat = new THREE.Mesh(matGeometry, matMaterial);
    mat.position.set(3, 0.5, 60);
    this.engine.add(mat);
  }

  private createThrowingCircle(): void {
    const circleGeometry = new THREE.RingGeometry(0, 2.135, 32);
    const circleMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.5,
    });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.rotation.x = -Math.PI / 2;
    circle.position.set(-30, 0.02, 60);
    this.engine.add(circle);
    
    // Toe board for shot put
    if (this.currentEvent === 'shot-put') {
      const boardGeometry = new THREE.BoxGeometry(1.22, 0.1, 0.1);
      const boardMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
      });
      const board = new THREE.Mesh(boardGeometry, boardMaterial);
      board.position.set(-27.865, 0.05, 60);
      this.engine.add(board);
    }
  }

  private createSectorLines(): void {
    // 34.92 degree sector for throws
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    for (let angle of [-17.46, 17.46]) {
      const rad = (angle * Math.PI) / 180;
      const length = 100;
      
      const lineGeometry = new THREE.PlaneGeometry(0.1, length);
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.rotation.z = rad;
      line.position.set(-30 + Math.sin(rad) * length / 2, 0.02, 60 + Math.cos(rad) * length / 2);
      this.engine.add(line);
    }
  }

  private createAthletes(): void {
    // Player
    this.playerAthlete = this.createAthlete('Player', 'USA', 0x0066cc, 0);
    this.allAthletes.push(this.playerAthlete);
    
    // AI athletes
    const aiData = [
      { name: 'Bolt', country: 'JAM', color: 0x00cc00 },
      { name: 'Powell', country: 'JAM', color: 0xffcc00 },
      { name: 'Gatlin', country: 'USA', color: 0xcc0000 },
      { name: 'Blake', country: 'JAM', color: 0xff6600 },
      { name: 'Coleman', country: 'USA', color: 0x9900cc },
      { name: 'Su', country: 'CHN', color: 0xcc0066 },
      { name: 'De Grasse', country: 'CAN', color: 0x006699 },
    ];
    
    aiData.forEach((data, index) => {
      const athlete = this.createAthlete(data.name, data.country, data.color, index + 1);
      this.aiAthletes.push(athlete);
      this.allAthletes.push(athlete);
    });
  }

  private createAthlete(name: string, country: string, color: number, lane: number): Athlete {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.25, 0.8, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xdeb887,
      roughness: 0.8,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.55;
    head.castShadow = true;
    group.add(head);
    
    // Position in lane
    const laneOffset = lane * 2.5;
    const startX = -50;
    const startZ = 52 + laneOffset;
    
    group.position.set(startX, 0, startZ);
    this.engine.add(group);
    
    return {
      id: `athlete_${lane}`,
      name,
      country,
      color,
      mesh: group,
      animationTime: 0,
      runCycle: 0,
      position: new THREE.Vector3(startX, 0, startZ),
      velocity: new THREE.Vector3(),
      isRunning: false,
      stamina: 100,
      maxStamina: 100,
      result: 0,
      isFinished: false,
      lane,
    };
  }

  // ============================================================================
  // UPDATE LOOP
  // ============================================================================

  protected update(deltaTime: number, input: InputState): void {
    // Countdown
    if (!this.eventStarted) {
      this.countdownTime -= deltaTime;
      if (this.countdownTime <= 0) {
        this.eventStarted = true;
      }
      return;
    }
    
    if (this.eventFinished) return;
    
    // Update event time
    this.eventTime += deltaTime;
    
    // Update based on event type
    switch (this.currentEvent) {
      case '100m-sprint':
      case '110m-hurdles':
        this.updateSprintEvent(deltaTime, input);
        break;
      case 'long-jump':
      case 'high-jump':
      case 'pole-vault':
        this.updateJumpEvent(deltaTime, input);
        break;
      case 'javelin':
      case 'shot-put':
      case 'discus':
        this.updateThrowEvent(deltaTime, input);
        break;
    }
    
    // Update AI athletes
    this.updateAIAthletes(deltaTime);
    
    // Update animations
    this.updateAnimations(deltaTime);
    
    // Update camera
    this.cameraController.setTarget(this.playerAthlete.mesh.position);
    this.cameraController.update(deltaTime, input);
    
    // Check event completion
    this.checkEventCompletion();
  }

  protected fixedUpdate(fixedDeltaTime: number): void {
    // Physics handled in update
  }

  private updateSprintEvent(deltaTime: number, input: InputState): void {
    const athlete = this.playerAthlete;
    const state = this.sprintState;
    
    // Tap to run - detect rapid key presses
    if (input.keysJustPressed.has('Space') || input.keysJustPressed.has('KeyA') || input.keysJustPressed.has('KeyD')) {
      const now = this.eventTime;
      const timeSinceLastTap = now - state.lastTapTime;
      
      if (timeSinceLastTap < 0.3) {
        state.tapCount++;
        // Build speed based on tap frequency
        const tapSpeed = 1 / timeSinceLastTap;
        state.powerMeter = Math.min(1, tapSpeed / 10);
      } else {
        state.tapCount = 1;
      }
      
      state.lastTapTime = now;
    }
    
    // Speed calculation
    const targetSpeed = state.powerMeter * state.maxSpeed;
    state.speed = THREE.MathUtils.lerp(state.speed, targetSpeed, deltaTime * 3);
    
    // Decay power meter
    state.powerMeter = Math.max(0, state.powerMeter - deltaTime * 2);
    
    // Move athlete
    athlete.position.x += state.speed * deltaTime;
    athlete.mesh.position.copy(athlete.position);
    athlete.isRunning = state.speed > 1;
    
    // Update distance
    state.distance = athlete.position.x + 50;
    
    // Check finish
    if (state.distance >= 100) {
      athlete.result = this.eventTime;
      athlete.isFinished = true;
    }
  }

  private updateJumpEvent(deltaTime: number, input: InputState): void {
    const athlete = this.playerAthlete;
    const state = this.jumpState;
    
    switch (state.phase) {
      case 'approach':
        // Build approach speed
        if (input.keys.has('Space') || input.keys.has('KeyW')) {
          state.approachSpeed = Math.min(10, state.approachSpeed + deltaTime * 5);
        }
        
        // Move forward
        athlete.position.x += state.approachSpeed * deltaTime;
        athlete.mesh.position.copy(athlete.position);
        athlete.isRunning = state.approachSpeed > 1;
        
        // Takeoff at board (x = 10)
        if (athlete.position.x >= 10 && input.keysJustPressed.has('Space')) {
          state.phase = 'takeoff';
          state.takeoffPower = state.approachSpeed / 10;
        }
        break;
        
      case 'takeoff':
        // Set angle with up/down
        if (input.keys.has('ArrowUp') || input.keys.has('KeyW')) {
          state.takeoffAngle = Math.min(60, state.takeoffAngle + deltaTime * 50);
        }
        if (input.keys.has('ArrowDown') || input.keys.has('KeyS')) {
          state.takeoffAngle = Math.max(20, state.takeoffAngle - deltaTime * 50);
        }
        
        // Release to jump
        if (input.keysJustReleased.has('Space')) {
          state.phase = 'flight';
          
          const angleRad = (state.takeoffAngle * Math.PI) / 180;
          const jumpVelocity = state.takeoffPower * 15;
          
          athlete.velocity.set(
            Math.cos(angleRad) * jumpVelocity,
            Math.sin(angleRad) * jumpVelocity,
            0
          );
        }
        break;
        
      case 'flight':
        // Apply gravity
        athlete.velocity.y -= 9.81 * deltaTime;
        
        // Move athlete
        athlete.position.add(athlete.velocity.clone().multiplyScalar(deltaTime));
        athlete.mesh.position.copy(athlete.position);
        
        // Check landing
        if (athlete.position.y <= 0 && athlete.velocity.y < 0) {
          athlete.position.y = 0;
          state.phase = 'landing';
          state.jumpDistance = athlete.position.x - 10; // Distance from board
        }
        break;
        
      case 'landing':
        athlete.result = state.jumpDistance;
        athlete.isFinished = true;
        state.phase = 'finished';
        break;
    }
  }

  private updateThrowEvent(deltaTime: number, input: InputState): void {
    const state = this.throwState;
    const athlete = this.playerAthlete;
    
    switch (state.phase) {
      case 'windup':
        // Build power with button hold
        if (input.keys.has('Space')) {
          state.windupPower = Math.min(1, state.windupPower + deltaTime);
          
          // Spin animation
          athlete.mesh.rotation.y += deltaTime * 5;
        }
        
        // Release to throw
        if (input.keysJustReleased.has('Space') && state.windupPower > 0.1) {
          state.phase = 'release';
        }
        break;
        
      case 'release':
        // Set angle with up/down
        state.releaseAngle = 45; // Could be adjustable
        
        // Create projectile
        this.createProjectile();
        state.phase = 'flight';
        break;
        
      case 'flight':
        if (state.projectile && state.projectileBody) {
          // Check if landed
          if (state.projectile.position.y <= 0) {
            state.phase = 'landed';
            state.distance = state.projectile.position.x + 30; // Distance from circle
          }
        }
        break;
        
      case 'landed':
        athlete.result = state.distance;
        athlete.isFinished = true;
        break;
    }
  }

  private createProjectile(): void {
    const state = this.throwState;
    let geometry: THREE.BufferGeometry;
    let size: THREE.Vector3;
    
    switch (this.currentEvent) {
      case 'javelin':
        geometry = new THREE.CylinderGeometry(0.02, 0.02, 2.6, 8);
        size = new THREE.Vector3(0.04, 2.6, 0.04);
        break;
      case 'shot-put':
        geometry = new THREE.SphereGeometry(0.06, 16, 16);
        size = new THREE.Vector3(0.12, 0.12, 0.12);
        break;
      case 'discus':
      default:
        geometry = new THREE.CylinderGeometry(0.11, 0.11, 0.044, 16);
        size = new THREE.Vector3(0.22, 0.044, 0.22);
        break;
    }
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.2,
    });
    
    const projectile = new THREE.Mesh(geometry, material);
    projectile.position.set(-28, 2, 60);
    
    if (this.currentEvent === 'javelin') {
      projectile.rotation.z = Math.PI / 2 - (state.releaseAngle * Math.PI) / 180;
    }
    
    this.engine.add(projectile);
    state.projectile = projectile;
    
    // Add physics
    const body = this.engine.physics.addSphere(
      projectile,
      0.1,
      'dynamic',
      { gravityScale: 1 }
    );
    
    // Set initial velocity
    const angleRad = (state.releaseAngle * Math.PI) / 180;
    const power = state.windupPower * 30;
    
    this.engine.physics.setLinearVelocity(body, new THREE.Vector3(
      Math.cos(angleRad) * power,
      Math.sin(angleRad) * power,
      0
    ));
    
    state.projectileBody = body;
  }

  private updateAIAthletes(deltaTime: number): void {
    this.aiAthletes.forEach((ai, index) => {
      if (ai.isFinished) return;
      
      // Simple AI - random performance
      const baseSpeed = 9 + Math.random() * 3;
      const variation = Math.sin(this.eventTime * (2 + index * 0.5)) * 0.5;
      
      ai.position.x += (baseSpeed + variation) * deltaTime;
      ai.mesh.position.copy(ai.position);
      ai.isRunning = true;
      
      // Check finish
      if (ai.position.x >= 50) {
        ai.result = this.eventTime + Math.random() * 0.5;
        ai.isFinished = true;
      }
    });
  }

  private updateAnimations(deltaTime: number): void {
    this.allAthletes.forEach(athlete => {
      if (athlete.isRunning) {
        athlete.runCycle += deltaTime * 15;
        
        // Simple bob animation
        const bob = Math.sin(athlete.runCycle) * 0.1;
        athlete.mesh.position.y = bob;
        
        // Lean forward
        athlete.mesh.rotation.x = 0.1;
      } else {
        athlete.mesh.rotation.x = 0;
      }
    });
  }

  private checkEventCompletion(): void {
    const allFinished = this.allAthletes.every(a => a.isFinished);
    
    if (allFinished || this.playerAthlete.isFinished) {
      this.eventFinished = true;
      
      // Sort results
      const sorted = [...this.allAthletes].sort((a, b) => {
        if (this.eventConfig.higherIsBetter) {
          return b.result - a.result;
        }
        return a.result - b.result;
      });
      
      // Assign positions
      sorted.forEach((athlete, index) => {
        // Position is index + 1
      });
      
      // Update personal best
      const currentBest = this.personalBests.get(this.currentEvent) ?? 
        (this.eventConfig.higherIsBetter ? 0 : Infinity);
      
      if (this.eventConfig.higherIsBetter) {
        if (this.playerAthlete.result > currentBest) {
          this.personalBests.set(this.currentEvent, this.playerAthlete.result);
        }
      } else {
        if (this.playerAthlete.result < currentBest) {
          this.personalBests.set(this.currentEvent, this.playerAthlete.result);
        }
      }
      
      // Set score
      this.addScore(Math.round(this.playerAthlete.result * 100));
      
      // End game
      const playerPosition = sorted.findIndex(a => a === this.playerAthlete) + 1;
      this.end(playerPosition <= 3);
    }
  }

  // ============================================================================
  // PUBLIC GETTERS FOR UI
  // ============================================================================

  public getCurrentEvent(): EventConfig {
    return this.eventConfig;
  }

  public getPlayerResult(): number {
    return this.playerAthlete?.result ?? 0;
  }

  public getEventTime(): number {
    return this.eventTime;
  }

  public getCountdown(): number {
    return Math.ceil(this.countdownTime);
  }

  public isEventStarted(): boolean {
    return this.eventStarted;
  }

  public getPowerMeter(): number {
    return this.sprintState?.powerMeter ?? 0;
  }

  public getSpeed(): number {
    return this.sprintState?.speed ?? 0;
  }

  public getDistance(): number {
    return this.sprintState?.distance ?? 0;
  }

  public getAthleteResults(): Array<{ name: string; country: string; result: number; isPlayer: boolean }> {
    return this.allAthletes
      .filter(a => a.isFinished)
      .sort((a, b) => this.eventConfig.higherIsBetter ? b.result - a.result : a.result - b.result)
      .map(a => ({
        name: a.name,
        country: a.country,
        result: a.result,
        isPlayer: a === this.playerAthlete,
      }));
  }

  public getPersonalBest(): number {
    return this.personalBests.get(this.currentEvent) ?? 0;
  }

  public getWorldRecord(): number {
    return this.eventConfig.worldRecord;
  }

  public setEvent(eventId: EventType): void {
    if (EVENTS[eventId]) {
      this.currentEvent = eventId;
    }
  }

  public getAvailableEvents(): EventConfig[] {
    return Object.values(EVENTS);
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  protected cleanup(): void {
    // Remove athletes
    this.allAthletes.forEach(athlete => {
      this.engine.remove(athlete.mesh);
      if (athlete.body) {
        this.engine.physics.removeBody(athlete.body);
      }
    });
    this.allAthletes = [];
    this.aiAthletes = [];
    
    // Remove projectile
    if (this.throwState?.projectile) {
      this.engine.remove(this.throwState.projectile);
      if (this.throwState.projectileBody) {
        this.engine.physics.removeBody(this.throwState.projectileBody);
      }
    }
    
    // Remove track meshes
    this.trackMeshes.forEach(mesh => {
      this.engine.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.trackMeshes = [];
    
    console.log('[TrackField] Cleanup complete');
  }
}

export default TrackFieldGame;
