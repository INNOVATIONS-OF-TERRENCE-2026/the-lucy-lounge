/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — CAMERA CONTROLLERS                                           │
 * │                                                                             │
 * │ FPS, Third-Person, Orbit, and Vehicle camera systems                       │
 * │ Smooth interpolation, collision detection, shake effects                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import type { InputState } from './InputManager';
import type { PhysicsWorld, RaycastResult } from './PhysicsWorld';

export interface CameraShake {
  intensity: number;
  duration: number;
  frequency: number;
  elapsed: number;
}

// ============================================================================
// BASE CAMERA CONTROLLER
// ============================================================================

export abstract class BaseCameraController {
  protected camera: THREE.PerspectiveCamera;
  protected target: THREE.Vector3 = new THREE.Vector3();
  protected enabled: boolean = true;
  
  // Shake effect
  protected shake: CameraShake | null = null;
  protected shakeOffset: THREE.Vector3 = new THREE.Vector3();
  
  // Smoothing
  protected smoothing: number = 0.1;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  public abstract update(deltaTime: number, input: InputState): void;

  public setTarget(target: THREE.Vector3): void {
    this.target.copy(target);
  }

  public getTarget(): THREE.Vector3 {
    return this.target.clone();
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setSmoothing(value: number): void {
    this.smoothing = Math.max(0, Math.min(1, value));
  }

  public addShake(intensity: number, duration: number, frequency: number = 20): void {
    this.shake = { intensity, duration, frequency, elapsed: 0 };
  }

  protected updateShake(deltaTime: number): void {
    if (!this.shake) return;
    
    this.shake.elapsed += deltaTime;
    
    if (this.shake.elapsed >= this.shake.duration) {
      this.shake = null;
      this.shakeOffset.set(0, 0, 0);
      return;
    }
    
    const progress = this.shake.elapsed / this.shake.duration;
    const decay = 1 - progress;
    const intensity = this.shake.intensity * decay;
    
    const time = this.shake.elapsed * this.shake.frequency;
    this.shakeOffset.set(
      Math.sin(time * 1.1) * intensity,
      Math.sin(time * 1.3) * intensity,
      Math.sin(time * 0.9) * intensity * 0.5
    );
  }

  protected applyShake(): void {
    if (this.shake) {
      this.camera.position.add(this.shakeOffset);
    }
  }

  public dispose(): void {
    this.enabled = false;
  }
}

// ============================================================================
// FIRST-PERSON CAMERA
// ============================================================================

export interface FPSCameraConfig {
  height?: number;
  sensitivity?: number;
  minPitch?: number;
  maxPitch?: number;
  bobEnabled?: boolean;
  bobSpeed?: number;
  bobAmount?: number;
}

export class FPSCameraController extends BaseCameraController {
  private yaw: number = 0;
  private pitch: number = 0;
  private height: number;
  private sensitivity: number;
  private minPitch: number;
  private maxPitch: number;
  
  // Head bob
  private bobEnabled: boolean;
  private bobSpeed: number;
  private bobAmount: number;
  private bobTime: number = 0;
  private isMoving: boolean = false;

  constructor(camera: THREE.PerspectiveCamera, config: FPSCameraConfig = {}) {
    super(camera);
    
    this.height = config.height ?? 1.7;
    this.sensitivity = config.sensitivity ?? 0.002;
    this.minPitch = config.minPitch ?? -Math.PI / 2 + 0.1;
    this.maxPitch = config.maxPitch ?? Math.PI / 2 - 0.1;
    this.bobEnabled = config.bobEnabled ?? true;
    this.bobSpeed = config.bobSpeed ?? 10;
    this.bobAmount = config.bobAmount ?? 0.05;
  }

  public update(deltaTime: number, input: InputState): void {
    if (!this.enabled) return;
    
    // Update rotation from input
    this.yaw -= input.virtual.lookX;
    this.pitch -= input.virtual.lookY;
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
    
    // Calculate camera rotation
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
    
    // Update position
    this.camera.position.copy(this.target);
    this.camera.position.y += this.height;
    
    // Head bob
    this.isMoving = Math.abs(input.virtual.moveX) > 0.1 || Math.abs(input.virtual.moveY) > 0.1;
    
    if (this.bobEnabled && this.isMoving) {
      this.bobTime += deltaTime * this.bobSpeed;
      const bobY = Math.sin(this.bobTime) * this.bobAmount;
      const bobX = Math.cos(this.bobTime * 0.5) * this.bobAmount * 0.5;
      this.camera.position.y += bobY;
      this.camera.position.x += bobX * Math.sin(this.yaw);
      this.camera.position.z += bobX * Math.cos(this.yaw);
    }
    
    // Apply shake
    this.updateShake(deltaTime);
    this.applyShake();
  }

  public getForward(): THREE.Vector3 {
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.camera.quaternion);
    forward.y = 0;
    forward.normalize();
    return forward;
  }

  public getRight(): THREE.Vector3 {
    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(this.camera.quaternion);
    right.y = 0;
    right.normalize();
    return right;
  }

  public getLookDirection(): THREE.Vector3 {
    const dir = new THREE.Vector3(0, 0, -1);
    dir.applyQuaternion(this.camera.quaternion);
    return dir;
  }

  public setRotation(yaw: number, pitch: number): void {
    this.yaw = yaw;
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, pitch));
  }

  public getYaw(): number {
    return this.yaw;
  }

  public getPitch(): number {
    return this.pitch;
  }

  public setSensitivity(sensitivity: number): void {
    this.sensitivity = sensitivity;
  }
}

// ============================================================================
// THIRD-PERSON CAMERA
// ============================================================================

export interface ThirdPersonCameraConfig {
  distance?: number;
  minDistance?: number;
  maxDistance?: number;
  height?: number;
  sensitivity?: number;
  minPitch?: number;
  maxPitch?: number;
  collisionEnabled?: boolean;
  collisionPadding?: number;
}

export class ThirdPersonCameraController extends BaseCameraController {
  private distance: number;
  private minDistance: number;
  private maxDistance: number;
  private height: number;
  private sensitivity: number;
  private minPitch: number;
  private maxPitch: number;
  
  private yaw: number = 0;
  private pitch: number = 0.3;
  
  private currentDistance: number;
  private idealPosition: THREE.Vector3 = new THREE.Vector3();
  private currentPosition: THREE.Vector3 = new THREE.Vector3();
  
  // Collision
  private collisionEnabled: boolean;
  private collisionPadding: number;
  private physics: PhysicsWorld | null = null;

  constructor(camera: THREE.PerspectiveCamera, config: ThirdPersonCameraConfig = {}) {
    super(camera);
    
    this.distance = config.distance ?? 5;
    this.minDistance = config.minDistance ?? 2;
    this.maxDistance = config.maxDistance ?? 15;
    this.height = config.height ?? 1.5;
    this.sensitivity = config.sensitivity ?? 0.003;
    this.minPitch = config.minPitch ?? -0.5;
    this.maxPitch = config.maxPitch ?? 1.2;
    this.collisionEnabled = config.collisionEnabled ?? true;
    this.collisionPadding = config.collisionPadding ?? 0.3;
    
    this.currentDistance = this.distance;
    this.currentPosition.copy(camera.position);
  }

  public setPhysics(physics: PhysicsWorld): void {
    this.physics = physics;
  }

  public update(deltaTime: number, input: InputState): void {
    if (!this.enabled) return;
    
    // Update rotation from input
    this.yaw -= input.virtual.lookX;
    this.pitch -= input.virtual.lookY;
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
    
    // Zoom with mouse wheel
    if (input.mouse.wheelDelta !== 0) {
      this.distance = Math.max(
        this.minDistance,
        Math.min(this.maxDistance, this.distance + input.mouse.wheelDelta)
      );
    }
    
    // Calculate ideal camera position
    const targetPos = this.target.clone();
    targetPos.y += this.height;
    
    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    ).multiplyScalar(this.distance);
    
    this.idealPosition.copy(targetPos).add(offset);
    
    // Collision detection
    let actualDistance = this.distance;
    
    if (this.collisionEnabled && this.physics?.isInitialized()) {
      const direction = this.idealPosition.clone().sub(targetPos).normalize();
      const result = this.physics.raycast(targetPos, direction, this.distance);
      
      if (result.hit && result.distance !== undefined) {
        actualDistance = Math.max(this.minDistance, result.distance - this.collisionPadding);
      }
    }
    
    // Smooth distance
    this.currentDistance = THREE.MathUtils.lerp(
      this.currentDistance,
      actualDistance,
      1 - Math.pow(0.01, deltaTime)
    );
    
    // Recalculate position with actual distance
    const actualOffset = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    ).multiplyScalar(this.currentDistance);
    
    const targetPosition = targetPos.clone().add(actualOffset);
    
    // Smooth camera movement
    this.currentPosition.lerp(targetPosition, 1 - Math.pow(0.001, deltaTime));
    
    // Apply position and look at target
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(targetPos);
    
    // Apply shake
    this.updateShake(deltaTime);
    this.applyShake();
  }

  public setDistance(distance: number): void {
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, distance));
  }

  public getDistance(): number {
    return this.currentDistance;
  }

  public setRotation(yaw: number, pitch: number): void {
    this.yaw = yaw;
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, pitch));
  }
}

// ============================================================================
// ORBIT CAMERA
// ============================================================================

export interface OrbitCameraConfig {
  distance?: number;
  minDistance?: number;
  maxDistance?: number;
  rotateSpeed?: number;
  zoomSpeed?: number;
  panSpeed?: number;
  enableDamping?: boolean;
  dampingFactor?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

export class OrbitCameraController extends BaseCameraController {
  private spherical: THREE.Spherical = new THREE.Spherical();
  private sphericalDelta: THREE.Spherical = new THREE.Spherical();
  private panOffset: THREE.Vector3 = new THREE.Vector3();
  
  private rotateSpeed: number;
  private zoomSpeed: number;
  private panSpeed: number;
  private enableDamping: boolean;
  private dampingFactor: number;
  private minDistance: number;
  private maxDistance: number;
  private minPolarAngle: number;
  private maxPolarAngle: number;
  private autoRotate: boolean;
  private autoRotateSpeed: number;
  
  private isDragging: boolean = false;
  private isPanning: boolean = false;

  constructor(camera: THREE.PerspectiveCamera, config: OrbitCameraConfig = {}) {
    super(camera);
    
    this.rotateSpeed = config.rotateSpeed ?? 1.0;
    this.zoomSpeed = config.zoomSpeed ?? 1.0;
    this.panSpeed = config.panSpeed ?? 1.0;
    this.enableDamping = config.enableDamping ?? true;
    this.dampingFactor = config.dampingFactor ?? 0.05;
    this.minDistance = config.minDistance ?? 1;
    this.maxDistance = config.maxDistance ?? 100;
    this.minPolarAngle = config.minPolarAngle ?? 0.1;
    this.maxPolarAngle = config.maxPolarAngle ?? Math.PI - 0.1;
    this.autoRotate = config.autoRotate ?? false;
    this.autoRotateSpeed = config.autoRotateSpeed ?? 2.0;
    
    // Initialize spherical from current camera position
    const offset = camera.position.clone().sub(this.target);
    this.spherical.setFromVector3(offset);
    this.spherical.radius = config.distance ?? offset.length();
  }

  public update(deltaTime: number, input: InputState): void {
    if (!this.enabled) return;
    
    // Auto rotate
    if (this.autoRotate && !this.isDragging) {
      this.sphericalDelta.theta -= this.autoRotateSpeed * deltaTime;
    }
    
    // Handle mouse input
    if (input.mouse.leftButton && !input.mouse.rightButton) {
      // Rotate
      this.sphericalDelta.theta -= input.mouse.deltaX * 0.01 * this.rotateSpeed;
      this.sphericalDelta.phi -= input.mouse.deltaY * 0.01 * this.rotateSpeed;
      this.isDragging = true;
    } else if (input.mouse.rightButton || (input.mouse.leftButton && input.keys.has('ShiftLeft'))) {
      // Pan
      const panX = input.mouse.deltaX * 0.01 * this.panSpeed;
      const panY = input.mouse.deltaY * 0.01 * this.panSpeed;
      
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      
      right.setFromMatrixColumn(this.camera.matrix, 0);
      up.setFromMatrixColumn(this.camera.matrix, 1);
      
      this.panOffset.addScaledVector(right, -panX * this.spherical.radius);
      this.panOffset.addScaledVector(up, panY * this.spherical.radius);
      
      this.isPanning = true;
    } else {
      this.isDragging = false;
      this.isPanning = false;
    }
    
    // Zoom
    if (input.mouse.wheelDelta !== 0) {
      const zoomScale = Math.pow(0.95, Math.abs(input.mouse.wheelDelta) * this.zoomSpeed);
      if (input.mouse.wheelDelta > 0) {
        this.spherical.radius *= zoomScale;
      } else {
        this.spherical.radius /= zoomScale;
      }
    }
    
    // Gamepad support
    if (input.gamepad) {
      this.sphericalDelta.theta -= input.gamepad.rightStickX * 0.05 * this.rotateSpeed;
      this.sphericalDelta.phi -= input.gamepad.rightStickY * 0.05 * this.rotateSpeed;
      
      // Zoom with triggers
      const zoomDelta = input.gamepad.rightTrigger - input.gamepad.leftTrigger;
      if (Math.abs(zoomDelta) > 0.1) {
        this.spherical.radius *= 1 + zoomDelta * 0.02 * this.zoomSpeed;
      }
    }
    
    // Apply deltas
    this.spherical.theta += this.sphericalDelta.theta;
    this.spherical.phi += this.sphericalDelta.phi;
    
    // Clamp
    this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));
    this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
    
    // Apply pan
    this.target.add(this.panOffset);
    
    // Calculate camera position
    const offset = new THREE.Vector3().setFromSpherical(this.spherical);
    this.camera.position.copy(this.target).add(offset);
    this.camera.lookAt(this.target);
    
    // Damping
    if (this.enableDamping) {
      this.sphericalDelta.theta *= (1 - this.dampingFactor);
      this.sphericalDelta.phi *= (1 - this.dampingFactor);
      this.panOffset.multiplyScalar(1 - this.dampingFactor);
    } else {
      this.sphericalDelta.set(0, 0, 0);
      this.panOffset.set(0, 0, 0);
    }
    
    // Apply shake
    this.updateShake(deltaTime);
    this.applyShake();
  }

  public setAutoRotate(enabled: boolean): void {
    this.autoRotate = enabled;
  }

  public setDistance(distance: number): void {
    this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, distance));
  }
}

// ============================================================================
// VEHICLE CAMERA (Racing games)
// ============================================================================

export interface VehicleCameraConfig {
  distance?: number;
  height?: number;
  lookAhead?: number;
  stiffness?: number;
  damping?: number;
  speedFovIncrease?: number;
  maxFov?: number;
}

export class VehicleCameraController extends BaseCameraController {
  private distance: number;
  private height: number;
  private lookAhead: number;
  private stiffness: number;
  private damping: number;
  private speedFovIncrease: number;
  private maxFov: number;
  private baseFov: number;
  
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private currentPosition: THREE.Vector3 = new THREE.Vector3();
  private currentLookAt: THREE.Vector3 = new THREE.Vector3();
  
  private vehicleVelocity: THREE.Vector3 = new THREE.Vector3();
  private vehicleForward: THREE.Vector3 = new THREE.Vector3(0, 0, 1);

  constructor(camera: THREE.PerspectiveCamera, config: VehicleCameraConfig = {}) {
    super(camera);
    
    this.distance = config.distance ?? 8;
    this.height = config.height ?? 3;
    this.lookAhead = config.lookAhead ?? 5;
    this.stiffness = config.stiffness ?? 50;
    this.damping = config.damping ?? 5;
    this.speedFovIncrease = config.speedFovIncrease ?? 0.1;
    this.maxFov = config.maxFov ?? 100;
    this.baseFov = camera.fov;
    
    this.currentPosition.copy(camera.position);
    this.currentLookAt.copy(this.target);
  }

  public setVehicleState(forward: THREE.Vector3, velocity: THREE.Vector3): void {
    this.vehicleForward.copy(forward);
    this.vehicleVelocity.copy(velocity);
  }

  public update(deltaTime: number, input: InputState): void {
    if (!this.enabled) return;
    
    // Calculate ideal camera position behind vehicle
    const idealOffset = this.vehicleForward.clone()
      .multiplyScalar(-this.distance)
      .add(new THREE.Vector3(0, this.height, 0));
    
    const idealPosition = this.target.clone().add(idealOffset);
    
    // Calculate look-at point ahead of vehicle
    const speed = this.vehicleVelocity.length();
    const lookAheadDistance = this.lookAhead * Math.min(1, speed / 50);
    const idealLookAt = this.target.clone()
      .add(this.vehicleForward.clone().multiplyScalar(lookAheadDistance));
    
    // Spring physics for camera position
    const displacement = idealPosition.clone().sub(this.currentPosition);
    const springForce = displacement.multiplyScalar(this.stiffness);
    const dampingForce = this.velocity.clone().multiplyScalar(-this.damping);
    
    const acceleration = springForce.add(dampingForce);
    this.velocity.add(acceleration.multiplyScalar(deltaTime));
    this.currentPosition.add(this.velocity.clone().multiplyScalar(deltaTime));
    
    // Smooth look-at
    this.currentLookAt.lerp(idealLookAt, 1 - Math.pow(0.001, deltaTime));
    
    // Apply to camera
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
    
    // Speed-based FOV
    const speedFactor = Math.min(1, speed / 100);
    const targetFov = this.baseFov + speedFactor * this.speedFovIncrease * this.baseFov;
    this.camera.fov = THREE.MathUtils.lerp(
      this.camera.fov,
      Math.min(this.maxFov, targetFov),
      deltaTime * 5
    );
    this.camera.updateProjectionMatrix();
    
    // Apply shake
    this.updateShake(deltaTime);
    this.applyShake();
  }

  public setDistance(distance: number): void {
    this.distance = distance;
  }

  public setHeight(height: number): void {
    this.height = height;
  }
}

export default {
  FPSCameraController,
  ThirdPersonCameraController,
  OrbitCameraController,
  VehicleCameraController,
};
