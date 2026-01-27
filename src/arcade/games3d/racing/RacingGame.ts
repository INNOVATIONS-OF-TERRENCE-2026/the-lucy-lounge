/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — NEON RACER                                                   │
 * │                                                                             │
 * │ AAA-quality arcade racing game with:                                       │
 * │ • Realistic vehicle physics                                                │
 * │ • AI opponents with rubber-banding                                         │
 * │ • Boost system and drifting                                                │
 * │ • Multiple tracks and vehicles                                             │
 * │ • Split-screen multiplayer ready                                           │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  VehicleCameraController,
  ParticlePresets,
  CollisionGroups,
  type PhysicsBody,
  type InputState,
} from '../../engine3d';

// ============================================================================
// TYPES
// ============================================================================

interface VehicleConfig {
  id: string;
  name: string;
  maxSpeed: number;
  acceleration: number;
  braking: number;
  handling: number;
  driftFactor: number;
  boostPower: number;
  color: number;
}

interface Vehicle {
  config: VehicleConfig;
  mesh: THREE.Group;
  body: PhysicsBody;
  
  // State
  speed: number;
  steering: number;
  throttle: number;
  brake: number;
  boost: number;
  maxBoost: number;
  isBoostActive: boolean;
  isDrifting: boolean;
  driftAngle: number;
  
  // Race state
  currentLap: number;
  currentCheckpoint: number;
  lapTimes: number[];
  position: number;
  finished: boolean;
  
  // Physics helpers
  forward: THREE.Vector3;
  velocity: THREE.Vector3;
  angularVelocity: number;
}

interface AIDriver {
  vehicle: Vehicle;
  targetCheckpoint: number;
  steeringSmooth: number;
  aggressiveness: number;
  rubberBandFactor: number;
}

interface Checkpoint {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  width: number;
  isFinishLine: boolean;
}

interface TrackConfig {
  id: string;
  name: string;
  checkpoints: Checkpoint[];
  laps: number;
  spawnPositions: THREE.Vector3[];
  spawnRotations: number[];
}

// ============================================================================
// VEHICLE CONFIGURATIONS
// ============================================================================

const VEHICLES: Record<string, VehicleConfig> = {
  speedster: {
    id: 'speedster',
    name: 'Speedster X1',
    maxSpeed: 180,
    acceleration: 45,
    braking: 60,
    handling: 0.8,
    driftFactor: 0.7,
    boostPower: 1.5,
    color: 0xff3366,
  },
  thunder: {
    id: 'thunder',
    name: 'Thunder Bolt',
    maxSpeed: 200,
    acceleration: 35,
    braking: 50,
    handling: 0.6,
    driftFactor: 0.8,
    boostPower: 1.3,
    color: 0x3366ff,
  },
  phantom: {
    id: 'phantom',
    name: 'Phantom GT',
    maxSpeed: 170,
    acceleration: 55,
    braking: 70,
    handling: 0.9,
    driftFactor: 0.6,
    boostPower: 1.4,
    color: 0x33ff66,
  },
  fury: {
    id: 'fury',
    name: 'Night Fury',
    maxSpeed: 190,
    acceleration: 40,
    braking: 55,
    handling: 0.75,
    driftFactor: 0.75,
    boostPower: 1.6,
    color: 0xff6633,
  },
};

// ============================================================================
// TRACK CONFIGURATION
// ============================================================================

const createOvalTrack = (): TrackConfig => {
  const checkpoints: Checkpoint[] = [];
  const trackRadius = 80;
  const trackWidth = 20;
  const numCheckpoints = 16;
  
  for (let i = 0; i < numCheckpoints; i++) {
    const angle = (i / numCheckpoints) * Math.PI * 2;
    const nextAngle = ((i + 1) / numCheckpoints) * Math.PI * 2;
    
    const x = Math.cos(angle) * trackRadius;
    const z = Math.sin(angle) * trackRadius;
    
    const dirX = Math.cos(nextAngle) - Math.cos(angle);
    const dirZ = Math.sin(nextAngle) - Math.sin(angle);
    
    checkpoints.push({
      position: new THREE.Vector3(x, 0, z),
      direction: new THREE.Vector3(dirX, 0, dirZ).normalize(),
      width: trackWidth,
      isFinishLine: i === 0,
    });
  }
  
  return {
    id: 'oval',
    name: 'Neon Circuit',
    checkpoints,
    laps: 3,
    spawnPositions: [
      new THREE.Vector3(trackRadius, 0.5, -3),
      new THREE.Vector3(trackRadius, 0.5, 3),
      new THREE.Vector3(trackRadius - 5, 0.5, -3),
      new THREE.Vector3(trackRadius - 5, 0.5, 3),
    ],
    spawnRotations: [Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2],
  };
};

// ============================================================================
// RACING GAME CLASS
// ============================================================================

export class RacingGame extends Game3DBase {
  // Camera
  private cameraController!: VehicleCameraController;
  
  // Vehicles
  private playerVehicle!: Vehicle;
  private aiDrivers: AIDriver[] = [];
  private allVehicles: Vehicle[] = [];
  
  // Track
  private track!: TrackConfig;
  private trackMeshes: THREE.Mesh[] = [];
  private checkpointMeshes: THREE.Mesh[] = [];
  
  // Race state
  private raceStarted: boolean = false;
  private raceFinished: boolean = false;
  private countdownTime: number = 0;
  private raceTime: number = 0;
  private bestLapTime: number = Infinity;
  
  // Settings
  private numAIOpponents: number = 3;
  private selectedVehicle: string = 'speedster';

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        shadowMapSize: 2048,
        bloom: true,
        bloomStrength: 0.8,
        bloomThreshold: 0.7,
        fog: { color: 0x0a0a1a, near: 50, far: 300 },
        ...config?.engineConfig,
      },
    });
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  protected async loadAssets(): Promise<void> {
    console.log('[RacingGame] Loading assets...');
    // Procedural generation for now
    console.log('[RacingGame] Assets loaded');
  }

  protected initScene(): void {
    console.log('[RacingGame] Initializing scene...');
    
    // Setup lighting
    this.setupLighting();
    
    // Create track
    this.track = createOvalTrack();
    this.createTrack();
    
    // Create vehicles
    this.createPlayerVehicle();
    this.createAIVehicles();
    
    // Setup camera
    this.cameraController = new VehicleCameraController(this.engine.camera, {
      distance: 10,
      height: 4,
      lookAhead: 8,
      stiffness: 30,
      damping: 4,
      speedFovIncrease: 0.15,
      maxFov: 95,
    });
    
    // Create particle systems
    this.createParticleSystem('boost_trail', {
      ...ParticlePresets.trail(),
      startColor: new THREE.Color(0x00ffff),
      endColor: new THREE.Color(0x0066ff),
    });
    this.createParticleSystem('drift_smoke', ParticlePresets.smoke());
    this.createParticleSystem('sparks', ParticlePresets.sparks());
    
    // Initialize race state
    this.raceStarted = false;
    this.raceFinished = false;
    this.countdownTime = 4; // 3, 2, 1, GO!
    this.raceTime = 0;
    
    // Create skybox
    this.createGradientSkybox(0x000022, 0x110033);
    
    console.log('[RacingGame] Scene initialized');
  }

  private setupLighting(): void {
    // Ambient
    this.engine.addAmbientLight(0x222244, 0.4);
    
    // Main light
    this.engine.addDirectionalLight(
      0x6688ff,
      0.8,
      new THREE.Vector3(50, 100, 50),
      true
    );
    
    // Neon lights around track
    const colors = [0xff0066, 0x00ff66, 0x6600ff, 0xff6600];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 90;
      const z = Math.sin(angle) * 90;
      this.engine.addPointLight(
        colors[i % colors.length],
        2,
        new THREE.Vector3(x, 5, z),
        30,
        2
      );
    }
  }

  private createTrack(): void {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(300, 300);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x111122,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.engine.add(ground);
    
    // Track surface (ring)
    const trackRadius = 80;
    const trackWidth = 20;
    
    const trackGeometry = new THREE.RingGeometry(
      trackRadius - trackWidth / 2,
      trackRadius + trackWidth / 2,
      64
    );
    const trackMaterial = new THREE.MeshStandardMaterial({
      color: 0x333344,
      roughness: 0.6,
      metalness: 0.2,
    });
    const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.y = 0.01;
    trackMesh.receiveShadow = true;
    this.engine.add(trackMesh);
    this.trackMeshes.push(trackMesh);
    
    // Track borders (neon)
    this.createTrackBorder(trackRadius - trackWidth / 2 - 0.5, 0xff0066);
    this.createTrackBorder(trackRadius + trackWidth / 2 + 0.5, 0x00ffff);
    
    // Checkpoints visualization
    this.track.checkpoints.forEach((cp, index) => {
      if (cp.isFinishLine) {
        this.createFinishLine(cp);
      }
    });
    
    // Add barriers
    this.createBarriers();
  }

  private createTrackBorder(radius: number, color: number): void {
    const geometry = new THREE.TorusGeometry(radius, 0.3, 8, 64);
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.7,
    });
    const border = new THREE.Mesh(geometry, material);
    border.rotation.x = Math.PI / 2;
    border.position.y = 0.3;
    this.engine.add(border);
    this.trackMeshes.push(border);
  }

  private createFinishLine(checkpoint: Checkpoint): void {
    const geometry = new THREE.PlaneGeometry(checkpoint.width, 3);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.3,
    });
    const finishLine = new THREE.Mesh(geometry, material);
    finishLine.position.copy(checkpoint.position);
    finishLine.position.y = 0.02;
    finishLine.rotation.x = -Math.PI / 2;
    
    // Rotate to face track direction
    const angle = Math.atan2(checkpoint.direction.x, checkpoint.direction.z);
    finishLine.rotation.z = angle;
    
    this.engine.add(finishLine);
    this.checkpointMeshes.push(finishLine);
  }

  private createBarriers(): void {
    const barrierMaterial = new THREE.MeshStandardMaterial({
      color: 0x444466,
      roughness: 0.5,
      metalness: 0.5,
    });
    
    // Inner and outer barriers
    const radii = [55, 105];
    
    radii.forEach(radius => {
      for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const geometry = new THREE.BoxGeometry(3, 2, 8);
        const barrier = new THREE.Mesh(geometry, barrierMaterial);
        barrier.position.set(x, 1, z);
        barrier.rotation.y = angle + Math.PI / 2;
        barrier.castShadow = true;
        this.engine.add(barrier);
        
        // Add physics
        this.engine.physics.addBox(
          barrier,
          new THREE.Vector3(3, 2, 8),
          'static',
          { restitution: 0.5 }
        );
      }
    });
  }

  private createVehicleMesh(config: VehicleConfig): THREE.Group {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.BoxGeometry(2, 0.6, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.3,
      metalness: 0.7,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);
    
    // Cockpit
    const cockpitGeometry = new THREE.BoxGeometry(1.5, 0.5, 1.5);
    const cockpitMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.1,
      metalness: 0.9,
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0.9, -0.3);
    cockpit.castShadow = true;
    group.add(cockpit);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8,
      metalness: 0.2,
    });
    
    const wheelPositions = [
      [-1, 0.4, 1.3],
      [1, 0.4, 1.3],
      [-1, 0.4, -1.3],
      [1, 0.4, -1.3],
    ];
    
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(x, y, z);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      group.add(wheel);
    });
    
    // Neon underglow
    const glowGeometry = new THREE.PlaneGeometry(2.5, 4.5);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.3,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.05;
    group.add(glow);
    
    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });
    
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.6, 0.5, 2);
    group.add(leftHeadlight);
    
    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(0.6, 0.5, 2);
    group.add(rightHeadlight);
    
    // Tail lights
    const taillightMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    const leftTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
    leftTaillight.position.set(-0.6, 0.5, -2);
    group.add(leftTaillight);
    
    const rightTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
    rightTaillight.position.set(0.6, 0.5, -2);
    group.add(rightTaillight);
    
    return group;
  }

  private createVehicle(config: VehicleConfig, spawnIndex: number): Vehicle {
    const mesh = this.createVehicleMesh(config);
    const spawnPos = this.track.spawnPositions[spawnIndex] || new THREE.Vector3(0, 0.5, 0);
    const spawnRot = this.track.spawnRotations[spawnIndex] || 0;
    
    mesh.position.copy(spawnPos);
    mesh.rotation.y = spawnRot;
    this.engine.add(mesh);
    
    // Create physics body
    const body = this.engine.physics.addBox(
      mesh,
      new THREE.Vector3(2, 1, 4),
      'dynamic',
      {
        mass: 1000,
        linearDamping: 0.5,
        angularDamping: 0.8,
        collisionGroups: CollisionGroups.VEHICLE,
      }
    );
    
    return {
      config,
      mesh,
      body,
      speed: 0,
      steering: 0,
      throttle: 0,
      brake: 0,
      boost: 100,
      maxBoost: 100,
      isBoostActive: false,
      isDrifting: false,
      driftAngle: 0,
      currentLap: 0,
      currentCheckpoint: 0,
      lapTimes: [],
      position: spawnIndex + 1,
      finished: false,
      forward: new THREE.Vector3(0, 0, 1),
      velocity: new THREE.Vector3(),
      angularVelocity: 0,
    };
  }

  private createPlayerVehicle(): void {
    const config = VEHICLES[this.selectedVehicle] || VEHICLES.speedster;
    this.playerVehicle = this.createVehicle(config, 0);
    this.allVehicles.push(this.playerVehicle);
  }

  private createAIVehicles(): void {
    const vehicleIds = Object.keys(VEHICLES).filter(id => id !== this.selectedVehicle);
    
    for (let i = 0; i < this.numAIOpponents; i++) {
      const configId = vehicleIds[i % vehicleIds.length];
      const config = VEHICLES[configId];
      const vehicle = this.createVehicle(config, i + 1);
      
      const aiDriver: AIDriver = {
        vehicle,
        targetCheckpoint: 0,
        steeringSmooth: 0,
        aggressiveness: 0.7 + Math.random() * 0.3,
        rubberBandFactor: 1,
      };
      
      this.aiDrivers.push(aiDriver);
      this.allVehicles.push(vehicle);
    }
  }

  // ============================================================================
  // UPDATE LOOP
  // ============================================================================

  protected update(deltaTime: number, input: InputState): void {
    // Countdown
    if (!this.raceStarted) {
      this.countdownTime -= deltaTime;
      if (this.countdownTime <= 0) {
        this.raceStarted = true;
      }
      return;
    }
    
    if (this.raceFinished) return;
    
    // Update race time
    this.raceTime += deltaTime;
    
    // Update player vehicle
    this.updatePlayerVehicle(deltaTime, input);
    
    // Update AI vehicles
    this.updateAIVehicles(deltaTime);
    
    // Update all vehicle physics
    this.allVehicles.forEach(vehicle => {
      this.updateVehiclePhysics(vehicle, deltaTime);
      this.checkCheckpoints(vehicle);
    });
    
    // Update positions
    this.updateRacePositions();
    
    // Update camera
    this.cameraController.setTarget(this.playerVehicle.mesh.position);
    this.cameraController.setVehicleState(
      this.playerVehicle.forward,
      this.playerVehicle.velocity
    );
    this.cameraController.update(deltaTime, input);
    
    // Update particle effects
    this.updateEffects(deltaTime);
    
    // Check race completion
    if (this.playerVehicle.finished) {
      this.raceFinished = true;
      this.end(this.playerVehicle.position === 1);
    }
  }

  protected fixedUpdate(fixedDeltaTime: number): void {
    // Physics handled in update
  }

  private updatePlayerVehicle(deltaTime: number, input: InputState): void {
    const vehicle = this.playerVehicle;
    
    // Input
    vehicle.throttle = Math.max(0, input.virtual.moveY);
    vehicle.brake = Math.max(0, -input.virtual.moveY);
    vehicle.steering = -input.virtual.moveX;
    
    // Boost
    if (input.virtual.fire && vehicle.boost > 0) {
      vehicle.isBoostActive = true;
      vehicle.boost -= deltaTime * 30;
    } else {
      vehicle.isBoostActive = false;
      // Regenerate boost slowly
      vehicle.boost = Math.min(vehicle.maxBoost, vehicle.boost + deltaTime * 5);
    }
    
    // Drift detection
    vehicle.isDrifting = input.virtual.sprint && Math.abs(vehicle.steering) > 0.3;
  }

  private updateAIVehicles(deltaTime: number): void {
    this.aiDrivers.forEach(ai => {
      const vehicle = ai.vehicle;
      if (vehicle.finished) return;
      
      // Get target checkpoint
      const targetCP = this.track.checkpoints[ai.targetCheckpoint];
      const toTarget = targetCP.position.clone().sub(vehicle.mesh.position);
      toTarget.y = 0;
      
      // Calculate steering
      const targetAngle = Math.atan2(toTarget.x, toTarget.z);
      const currentAngle = vehicle.mesh.rotation.y;
      let angleDiff = targetAngle - currentAngle;
      
      // Normalize angle
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      
      // Smooth steering
      ai.steeringSmooth = THREE.MathUtils.lerp(
        ai.steeringSmooth,
        Math.max(-1, Math.min(1, angleDiff * 2)),
        deltaTime * 5
      );
      
      vehicle.steering = ai.steeringSmooth;
      
      // Throttle based on angle to target
      const angleAbs = Math.abs(angleDiff);
      vehicle.throttle = angleAbs < 0.5 ? 1 : 0.5;
      vehicle.brake = angleAbs > 1.5 ? 0.5 : 0;
      
      // Rubber banding - speed up if behind, slow down if ahead
      const playerLapProgress = this.playerVehicle.currentLap + 
        this.playerVehicle.currentCheckpoint / this.track.checkpoints.length;
      const aiLapProgress = vehicle.currentLap + 
        vehicle.currentCheckpoint / this.track.checkpoints.length;
      
      if (aiLapProgress < playerLapProgress - 0.5) {
        ai.rubberBandFactor = 1.2;
      } else if (aiLapProgress > playerLapProgress + 0.5) {
        ai.rubberBandFactor = 0.85;
      } else {
        ai.rubberBandFactor = 1;
      }
      
      // Boost when behind
      vehicle.isBoostActive = aiLapProgress < playerLapProgress - 0.3 && vehicle.boost > 30;
      if (vehicle.isBoostActive) {
        vehicle.boost -= deltaTime * 30;
      } else {
        vehicle.boost = Math.min(vehicle.maxBoost, vehicle.boost + deltaTime * 5);
      }
      
      // Update target checkpoint
      const distToTarget = toTarget.length();
      if (distToTarget < targetCP.width) {
        ai.targetCheckpoint = (ai.targetCheckpoint + 1) % this.track.checkpoints.length;
      }
    });
  }

  private updateVehiclePhysics(vehicle: Vehicle, deltaTime: number): void {
    const config = vehicle.config;
    
    // Get current forward direction
    vehicle.forward.set(0, 0, 1).applyQuaternion(vehicle.mesh.quaternion);
    
    // Calculate speed
    const currentVelocity = this.engine.physics.getLinearVelocity(vehicle.body);
    vehicle.velocity.copy(currentVelocity);
    vehicle.speed = vehicle.velocity.dot(vehicle.forward);
    
    // Acceleration
    let accelerationForce = 0;
    
    if (vehicle.throttle > 0) {
      const speedRatio = Math.abs(vehicle.speed) / config.maxSpeed;
      accelerationForce = config.acceleration * vehicle.throttle * (1 - speedRatio * 0.5);
    }
    
    if (vehicle.brake > 0) {
      accelerationForce = -config.braking * vehicle.brake;
    }
    
    // Boost
    if (vehicle.isBoostActive) {
      accelerationForce *= config.boostPower;
    }
    
    // AI rubber banding
    const aiDriver = this.aiDrivers.find(ai => ai.vehicle === vehicle);
    if (aiDriver) {
      accelerationForce *= aiDriver.rubberBandFactor;
    }
    
    // Apply acceleration
    const force = vehicle.forward.clone().multiplyScalar(accelerationForce * 50);
    this.engine.physics.applyForce(vehicle.body, force);
    
    // Steering
    if (Math.abs(vehicle.speed) > 1) {
      const steerAmount = vehicle.steering * config.handling;
      const steerForce = steerAmount * Math.sign(vehicle.speed) * 3;
      
      // Apply torque for rotation
      this.engine.physics.applyTorque(
        vehicle.body,
        new THREE.Vector3(0, steerForce * 1000, 0)
      );
      
      // Drift physics
      if (vehicle.isDrifting) {
        vehicle.driftAngle = THREE.MathUtils.lerp(
          vehicle.driftAngle,
          steerAmount * config.driftFactor * 0.5,
          deltaTime * 3
        );
      } else {
        vehicle.driftAngle = THREE.MathUtils.lerp(vehicle.driftAngle, 0, deltaTime * 5);
      }
    }
    
    // Lateral friction (grip)
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(vehicle.mesh.quaternion);
    const lateralSpeed = vehicle.velocity.dot(right);
    const gripFactor = vehicle.isDrifting ? 0.3 : 0.9;
    const lateralFriction = right.clone().multiplyScalar(-lateralSpeed * gripFactor * 50);
    this.engine.physics.applyForce(vehicle.body, lateralFriction);
    
    // Keep vehicle upright
    const up = new THREE.Vector3(0, 1, 0);
    const vehicleUp = new THREE.Vector3(0, 1, 0).applyQuaternion(vehicle.mesh.quaternion);
    const uprightTorque = up.clone().cross(vehicleUp).multiplyScalar(500);
    this.engine.physics.applyTorque(vehicle.body, uprightTorque);
  }

  private checkCheckpoints(vehicle: Vehicle): void {
    if (vehicle.finished) return;
    
    const nextCheckpoint = this.track.checkpoints[vehicle.currentCheckpoint];
    const toCheckpoint = nextCheckpoint.position.clone().sub(vehicle.mesh.position);
    toCheckpoint.y = 0;
    
    const distance = toCheckpoint.length();
    
    if (distance < nextCheckpoint.width) {
      vehicle.currentCheckpoint++;
      
      if (vehicle.currentCheckpoint >= this.track.checkpoints.length) {
        vehicle.currentCheckpoint = 0;
        vehicle.currentLap++;
        
        // Record lap time
        const lapTime = this.raceTime - (vehicle.lapTimes.reduce((a, b) => a + b, 0));
        vehicle.lapTimes.push(lapTime);
        
        if (vehicle === this.playerVehicle && lapTime < this.bestLapTime) {
          this.bestLapTime = lapTime;
        }
        
        // Check if race finished
        if (vehicle.currentLap >= this.track.laps) {
          vehicle.finished = true;
        }
      }
    }
  }

  private updateRacePositions(): void {
    // Sort by lap progress
    const sorted = [...this.allVehicles].sort((a, b) => {
      const progressA = a.currentLap * 1000 + a.currentCheckpoint;
      const progressB = b.currentLap * 1000 + b.currentCheckpoint;
      return progressB - progressA;
    });
    
    sorted.forEach((vehicle, index) => {
      vehicle.position = index + 1;
    });
  }

  private updateEffects(deltaTime: number): void {
    // Boost trail
    const boostTrail = this.getParticleSystem('boost_trail');
    if (boostTrail && this.playerVehicle.isBoostActive) {
      const trailPos = this.playerVehicle.mesh.position.clone();
      trailPos.add(this.playerVehicle.forward.clone().multiplyScalar(-2));
      boostTrail.setPosition(trailPos);
      boostTrail.play();
    } else {
      boostTrail?.stop();
    }
    
    // Drift smoke
    const driftSmoke = this.getParticleSystem('drift_smoke');
    if (driftSmoke && this.playerVehicle.isDrifting && Math.abs(this.playerVehicle.speed) > 20) {
      const smokePos = this.playerVehicle.mesh.position.clone();
      smokePos.y = 0.1;
      driftSmoke.setPosition(smokePos);
      driftSmoke.play();
    } else {
      driftSmoke?.stop();
    }
  }

  // ============================================================================
  // PUBLIC GETTERS FOR UI
  // ============================================================================

  public getPlayerSpeed(): number {
    return Math.abs(this.playerVehicle?.speed ?? 0);
  }

  public getPlayerBoost(): number {
    return this.playerVehicle?.boost ?? 0;
  }

  public getMaxBoost(): number {
    return this.playerVehicle?.maxBoost ?? 100;
  }

  public getCurrentLap(): number {
    return (this.playerVehicle?.currentLap ?? 0) + 1;
  }

  public getTotalLaps(): number {
    return this.track?.laps ?? 3;
  }

  public getPosition(): number {
    return this.playerVehicle?.position ?? 1;
  }

  public getTotalRacers(): number {
    return this.allVehicles.length;
  }

  public getRaceTime(): number {
    return this.raceTime;
  }

  public getBestLapTime(): number {
    return this.bestLapTime === Infinity ? 0 : this.bestLapTime;
  }

  public getLastLapTime(): number {
    const times = this.playerVehicle?.lapTimes ?? [];
    return times[times.length - 1] ?? 0;
  }

  public getCountdown(): number {
    return Math.ceil(this.countdownTime);
  }

  public isRaceStarted(): boolean {
    return this.raceStarted;
  }

  public isBoostActive(): boolean {
    return this.playerVehicle?.isBoostActive ?? false;
  }

  public isDrifting(): boolean {
    return this.playerVehicle?.isDrifting ?? false;
  }

  public setSelectedVehicle(vehicleId: string): void {
    if (VEHICLES[vehicleId]) {
      this.selectedVehicle = vehicleId;
    }
  }

  public getAvailableVehicles(): VehicleConfig[] {
    return Object.values(VEHICLES);
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  protected cleanup(): void {
    // Remove vehicles
    this.allVehicles.forEach(vehicle => {
      this.engine.remove(vehicle.mesh);
      this.engine.physics.removeBody(vehicle.body);
    });
    this.allVehicles = [];
    this.aiDrivers = [];
    
    // Remove track meshes
    this.trackMeshes.forEach(mesh => {
      this.engine.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.trackMeshes = [];
    
    // Remove checkpoint meshes
    this.checkpointMeshes.forEach(mesh => {
      this.engine.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.checkpointMeshes = [];
    
    console.log('[RacingGame] Cleanup complete');
  }
}

export default RacingGame;
