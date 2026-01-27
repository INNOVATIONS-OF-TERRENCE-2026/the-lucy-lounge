/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — PHYSICS WORLD                                                │
 * │                                                                             │
 * │ Rapier 3D physics engine integration                                       │
 * │ Rigid bodies, colliders, raycasting, character controllers                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export interface RigidBodyDesc {
  type: 'dynamic' | 'static' | 'kinematic';
  position?: THREE.Vector3;
  rotation?: THREE.Quaternion;
  mass?: number;
  linearDamping?: number;
  angularDamping?: number;
  gravityScale?: number;
  canSleep?: boolean;
  ccd?: boolean; // Continuous collision detection
}

export interface ColliderDesc {
  shape: 'box' | 'sphere' | 'capsule' | 'cylinder' | 'cone' | 'trimesh' | 'convex';
  // Shape parameters
  halfExtents?: THREE.Vector3; // For box
  radius?: number; // For sphere, capsule, cylinder, cone
  halfHeight?: number; // For capsule, cylinder, cone
  vertices?: Float32Array; // For trimesh, convex
  indices?: Uint32Array; // For trimesh
  // Physics properties
  friction?: number;
  restitution?: number;
  density?: number;
  isSensor?: boolean;
  // Collision groups
  collisionGroups?: number;
  solverGroups?: number;
}

export interface PhysicsBody {
  rigidBody: RAPIER.RigidBody;
  collider: RAPIER.Collider;
  mesh?: THREE.Object3D;
}

export interface RaycastResult {
  hit: boolean;
  point?: THREE.Vector3;
  normal?: THREE.Vector3;
  distance?: number;
  body?: PhysicsBody;
}

export interface CharacterController {
  controller: RAPIER.KinematicCharacterController;
  collider: RAPIER.Collider;
  rigidBody: RAPIER.RigidBody;
}

// Collision groups
export const CollisionGroups = {
  DEFAULT: 0x0001,
  PLAYER: 0x0002,
  ENEMY: 0x0004,
  PROJECTILE: 0x0008,
  VEHICLE: 0x0010,
  TERRAIN: 0x0020,
  TRIGGER: 0x0040,
  DEBRIS: 0x0080,
  ALL: 0xFFFF,
};

export class PhysicsWorld {
  private world: RAPIER.World | null = null;
  private initialized: boolean = false;
  private bodies: Map<number, PhysicsBody> = new Map();
  private characterControllers: Map<number, CharacterController> = new Map();
  private eventQueue: RAPIER.EventQueue | null = null;
  
  // Collision callbacks
  private collisionCallbacks: Map<number, (other: PhysicsBody, started: boolean) => void> = new Map();
  private sensorCallbacks: Map<number, (other: PhysicsBody, entered: boolean) => void> = new Map();

  public async init(gravity: THREE.Vector3 = new THREE.Vector3(0, -9.81, 0)): Promise<void> {
    if (this.initialized) return;
    
    await RAPIER.init();
    
    this.world = new RAPIER.World({ x: gravity.x, y: gravity.y, z: gravity.z });
    this.eventQueue = new RAPIER.EventQueue(true);
    this.initialized = true;
    
    console.log('[PhysicsWorld] Rapier initialized');
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public step(deltaTime: number): void {
    if (!this.world || !this.eventQueue) return;
    
    this.world.step(this.eventQueue);
    
    // Sync physics bodies to meshes
    this.bodies.forEach((body) => {
      if (body.mesh && body.rigidBody.bodyType() !== RAPIER.RigidBodyType.Fixed) {
        const position = body.rigidBody.translation();
        const rotation = body.rigidBody.rotation();
        
        body.mesh.position.set(position.x, position.y, position.z);
        body.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
      }
    });
    
    // Process collision events
    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      const body1 = this.getBodyByColliderHandle(handle1);
      const body2 = this.getBodyByColliderHandle(handle2);
      
      if (body1 && body2) {
        const callback1 = this.collisionCallbacks.get(handle1);
        const callback2 = this.collisionCallbacks.get(handle2);
        
        callback1?.(body2, started);
        callback2?.(body1, started);
      }
    });
    
    // Process sensor events
    this.eventQueue.drainContactForceEvents((event) => {
      // Handle contact force events if needed
    });
  }

  private getBodyByColliderHandle(handle: number): PhysicsBody | undefined {
    for (const body of this.bodies.values()) {
      if (body.collider.handle === handle) {
        return body;
      }
    }
    return undefined;
  }

  // ============================================================================
  // RIGID BODY CREATION
  // ============================================================================

  public createRigidBody(desc: RigidBodyDesc): RAPIER.RigidBody {
    if (!this.world) throw new Error('Physics world not initialized');
    
    let bodyDesc: RAPIER.RigidBodyDesc;
    
    switch (desc.type) {
      case 'dynamic':
        bodyDesc = RAPIER.RigidBodyDesc.dynamic();
        break;
      case 'static':
        bodyDesc = RAPIER.RigidBodyDesc.fixed();
        break;
      case 'kinematic':
        bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
        break;
    }
    
    if (desc.position) {
      bodyDesc.setTranslation(desc.position.x, desc.position.y, desc.position.z);
    }
    
    if (desc.rotation) {
      bodyDesc.setRotation({ x: desc.rotation.x, y: desc.rotation.y, z: desc.rotation.z, w: desc.rotation.w });
    }
    
    if (desc.linearDamping !== undefined) {
      bodyDesc.setLinearDamping(desc.linearDamping);
    }
    
    if (desc.angularDamping !== undefined) {
      bodyDesc.setAngularDamping(desc.angularDamping);
    }
    
    if (desc.gravityScale !== undefined) {
      bodyDesc.setGravityScale(desc.gravityScale);
    }
    
    if (desc.canSleep !== undefined) {
      bodyDesc.setCanSleep(desc.canSleep);
    }
    
    if (desc.ccd) {
      bodyDesc.setCcdEnabled(true);
    }
    
    return this.world.createRigidBody(bodyDesc);
  }

  public createCollider(rigidBody: RAPIER.RigidBody, desc: ColliderDesc): RAPIER.Collider {
    if (!this.world) throw new Error('Physics world not initialized');
    
    let colliderDesc: RAPIER.ColliderDesc;
    
    switch (desc.shape) {
      case 'box':
        const he = desc.halfExtents || new THREE.Vector3(0.5, 0.5, 0.5);
        colliderDesc = RAPIER.ColliderDesc.cuboid(he.x, he.y, he.z);
        break;
        
      case 'sphere':
        colliderDesc = RAPIER.ColliderDesc.ball(desc.radius || 0.5);
        break;
        
      case 'capsule':
        colliderDesc = RAPIER.ColliderDesc.capsule(desc.halfHeight || 0.5, desc.radius || 0.25);
        break;
        
      case 'cylinder':
        colliderDesc = RAPIER.ColliderDesc.cylinder(desc.halfHeight || 0.5, desc.radius || 0.5);
        break;
        
      case 'cone':
        colliderDesc = RAPIER.ColliderDesc.cone(desc.halfHeight || 0.5, desc.radius || 0.5);
        break;
        
      case 'trimesh':
        if (!desc.vertices || !desc.indices) {
          throw new Error('Trimesh requires vertices and indices');
        }
        colliderDesc = RAPIER.ColliderDesc.trimesh(desc.vertices, desc.indices);
        break;
        
      case 'convex':
        if (!desc.vertices) {
          throw new Error('Convex hull requires vertices');
        }
        colliderDesc = RAPIER.ColliderDesc.convexHull(desc.vertices)!;
        break;
        
      default:
        throw new Error(`Unknown collider shape: ${desc.shape}`);
    }
    
    if (desc.friction !== undefined) {
      colliderDesc.setFriction(desc.friction);
    }
    
    if (desc.restitution !== undefined) {
      colliderDesc.setRestitution(desc.restitution);
    }
    
    if (desc.density !== undefined) {
      colliderDesc.setDensity(desc.density);
    }
    
    if (desc.isSensor) {
      colliderDesc.setSensor(true);
    }
    
    if (desc.collisionGroups !== undefined) {
      colliderDesc.setCollisionGroups(desc.collisionGroups);
    }
    
    if (desc.solverGroups !== undefined) {
      colliderDesc.setSolverGroups(desc.solverGroups);
    }
    
    return this.world.createCollider(colliderDesc, rigidBody);
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  public addBox(
    mesh: THREE.Object3D,
    size: THREE.Vector3,
    type: 'dynamic' | 'static' | 'kinematic' = 'dynamic',
    options: Partial<RigidBodyDesc & ColliderDesc> = {}
  ): PhysicsBody {
    const rigidBody = this.createRigidBody({
      type,
      position: mesh.position.clone(),
      rotation: mesh.quaternion.clone(),
      ...options,
    });
    
    const collider = this.createCollider(rigidBody, {
      shape: 'box',
      halfExtents: size.clone().multiplyScalar(0.5),
      ...options,
    });
    
    const body: PhysicsBody = { rigidBody, collider, mesh };
    this.bodies.set(rigidBody.handle, body);
    
    return body;
  }

  public addSphere(
    mesh: THREE.Object3D,
    radius: number,
    type: 'dynamic' | 'static' | 'kinematic' = 'dynamic',
    options: Partial<RigidBodyDesc & ColliderDesc> = {}
  ): PhysicsBody {
    const rigidBody = this.createRigidBody({
      type,
      position: mesh.position.clone(),
      rotation: mesh.quaternion.clone(),
      ...options,
    });
    
    const collider = this.createCollider(rigidBody, {
      shape: 'sphere',
      radius,
      ...options,
    });
    
    const body: PhysicsBody = { rigidBody, collider, mesh };
    this.bodies.set(rigidBody.handle, body);
    
    return body;
  }

  public addCapsule(
    mesh: THREE.Object3D,
    halfHeight: number,
    radius: number,
    type: 'dynamic' | 'static' | 'kinematic' = 'dynamic',
    options: Partial<RigidBodyDesc & ColliderDesc> = {}
  ): PhysicsBody {
    const rigidBody = this.createRigidBody({
      type,
      position: mesh.position.clone(),
      rotation: mesh.quaternion.clone(),
      ...options,
    });
    
    const collider = this.createCollider(rigidBody, {
      shape: 'capsule',
      halfHeight,
      radius,
      ...options,
    });
    
    const body: PhysicsBody = { rigidBody, collider, mesh };
    this.bodies.set(rigidBody.handle, body);
    
    return body;
  }

  public addTrimesh(
    mesh: THREE.Mesh,
    options: Partial<RigidBodyDesc & ColliderDesc> = {}
  ): PhysicsBody {
    const geometry = mesh.geometry;
    const position = geometry.getAttribute('position');
    const index = geometry.getIndex();
    
    const vertices = new Float32Array(position.array);
    const indices = index ? new Uint32Array(index.array) : undefined;
    
    // Apply mesh world transform to vertices
    const matrix = mesh.matrixWorld;
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < vertices.length; i += 3) {
      vertex.set(vertices[i], vertices[i + 1], vertices[i + 2]);
      vertex.applyMatrix4(matrix);
      vertices[i] = vertex.x;
      vertices[i + 1] = vertex.y;
      vertices[i + 2] = vertex.z;
    }
    
    const rigidBody = this.createRigidBody({
      type: 'static',
      ...options,
    });
    
    const collider = this.createCollider(rigidBody, {
      shape: 'trimesh',
      vertices,
      indices,
      ...options,
    });
    
    const body: PhysicsBody = { rigidBody, collider, mesh };
    this.bodies.set(rigidBody.handle, body);
    
    return body;
  }

  // ============================================================================
  // CHARACTER CONTROLLER
  // ============================================================================

  public createCharacterController(
    position: THREE.Vector3,
    height: number = 1.8,
    radius: number = 0.3,
    options: {
      offset?: number;
      maxSlopeClimbAngle?: number;
      minSlopeSlideAngle?: number;
      autostep?: { maxHeight: number; minWidth: number; includeDynamicBodies: boolean };
      snapToGround?: number;
    } = {}
  ): CharacterController {
    if (!this.world) throw new Error('Physics world not initialized');
    
    const controller = this.world.createCharacterController(options.offset || 0.01);
    
    if (options.maxSlopeClimbAngle !== undefined) {
      controller.setMaxSlopeClimbAngle(options.maxSlopeClimbAngle);
    }
    
    if (options.minSlopeSlideAngle !== undefined) {
      controller.setMinSlopeSlideAngle(options.minSlopeSlideAngle);
    }
    
    if (options.autostep) {
      controller.enableAutostep(
        options.autostep.maxHeight,
        options.autostep.minWidth,
        options.autostep.includeDynamicBodies
      );
    }
    
    if (options.snapToGround !== undefined) {
      controller.enableSnapToGround(options.snapToGround);
    }
    
    // Create kinematic body for the character
    const rigidBody = this.createRigidBody({
      type: 'kinematic',
      position,
    });
    
    const halfHeight = (height - radius * 2) / 2;
    const collider = this.createCollider(rigidBody, {
      shape: 'capsule',
      halfHeight,
      radius,
      collisionGroups: CollisionGroups.PLAYER,
    });
    
    const cc: CharacterController = { controller, collider, rigidBody };
    this.characterControllers.set(rigidBody.handle, cc);
    
    return cc;
  }

  public moveCharacter(
    cc: CharacterController,
    desiredMovement: THREE.Vector3,
    deltaTime: number
  ): { grounded: boolean; translation: THREE.Vector3 } {
    if (!this.world) throw new Error('Physics world not initialized');
    
    cc.controller.computeColliderMovement(
      cc.collider,
      { x: desiredMovement.x, y: desiredMovement.y, z: desiredMovement.z },
      undefined,
      undefined
    );
    
    const movement = cc.controller.computedMovement();
    const grounded = cc.controller.computedGrounded();
    
    const currentPos = cc.rigidBody.translation();
    cc.rigidBody.setNextKinematicTranslation({
      x: currentPos.x + movement.x,
      y: currentPos.y + movement.y,
      z: currentPos.z + movement.z,
    });
    
    return {
      grounded,
      translation: new THREE.Vector3(
        currentPos.x + movement.x,
        currentPos.y + movement.y,
        currentPos.z + movement.z
      ),
    };
  }

  // ============================================================================
  // RAYCASTING
  // ============================================================================

  public raycast(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance: number = 1000,
    filterGroups?: number
  ): RaycastResult {
    if (!this.world) return { hit: false };
    
    const ray = new RAPIER.Ray(
      { x: origin.x, y: origin.y, z: origin.z },
      { x: direction.x, y: direction.y, z: direction.z }
    );
    
    const hit = this.world.castRay(
      ray,
      maxDistance,
      true,
      undefined,
      filterGroups
    );
    
    if (hit) {
      const point = ray.pointAt(hit.timeOfImpact);
      const collider = hit.collider;
      const body = this.getBodyByColliderHandle(collider.handle);
      
      return {
        hit: true,
        point: new THREE.Vector3(point.x, point.y, point.z),
        normal: new THREE.Vector3(hit.normal.x, hit.normal.y, hit.normal.z),
        distance: hit.timeOfImpact,
        body,
      };
    }
    
    return { hit: false };
  }

  public raycastAll(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance: number = 1000,
    filterGroups?: number
  ): RaycastResult[] {
    if (!this.world) return [];
    
    const results: RaycastResult[] = [];
    
    const ray = new RAPIER.Ray(
      { x: origin.x, y: origin.y, z: origin.z },
      { x: direction.x, y: direction.y, z: direction.z }
    );
    
    this.world.intersectionsWithRay(
      ray,
      maxDistance,
      true,
      (hit) => {
        const point = ray.pointAt(hit.timeOfImpact);
        const body = this.getBodyByColliderHandle(hit.collider.handle);
        
        results.push({
          hit: true,
          point: new THREE.Vector3(point.x, point.y, point.z),
          normal: new THREE.Vector3(hit.normal.x, hit.normal.y, hit.normal.z),
          distance: hit.timeOfImpact,
          body,
        });
        
        return true; // Continue searching
      },
      filterGroups
    );
    
    return results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  // ============================================================================
  // FORCE APPLICATION
  // ============================================================================

  public applyForce(body: PhysicsBody, force: THREE.Vector3): void {
    body.rigidBody.addForce({ x: force.x, y: force.y, z: force.z }, true);
  }

  public applyImpulse(body: PhysicsBody, impulse: THREE.Vector3): void {
    body.rigidBody.applyImpulse({ x: impulse.x, y: impulse.y, z: impulse.z }, true);
  }

  public applyTorque(body: PhysicsBody, torque: THREE.Vector3): void {
    body.rigidBody.addTorque({ x: torque.x, y: torque.y, z: torque.z }, true);
  }

  public applyTorqueImpulse(body: PhysicsBody, impulse: THREE.Vector3): void {
    body.rigidBody.applyTorqueImpulse({ x: impulse.x, y: impulse.y, z: impulse.z }, true);
  }

  public setLinearVelocity(body: PhysicsBody, velocity: THREE.Vector3): void {
    body.rigidBody.setLinvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true);
  }

  public setAngularVelocity(body: PhysicsBody, velocity: THREE.Vector3): void {
    body.rigidBody.setAngvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true);
  }

  public getLinearVelocity(body: PhysicsBody): THREE.Vector3 {
    const v = body.rigidBody.linvel();
    return new THREE.Vector3(v.x, v.y, v.z);
  }

  public getAngularVelocity(body: PhysicsBody): THREE.Vector3 {
    const v = body.rigidBody.angvel();
    return new THREE.Vector3(v.x, v.y, v.z);
  }

  // ============================================================================
  // COLLISION CALLBACKS
  // ============================================================================

  public onCollision(
    body: PhysicsBody,
    callback: (other: PhysicsBody, started: boolean) => void
  ): void {
    this.collisionCallbacks.set(body.collider.handle, callback);
    body.collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
  }

  public onSensor(
    body: PhysicsBody,
    callback: (other: PhysicsBody, entered: boolean) => void
  ): void {
    this.sensorCallbacks.set(body.collider.handle, callback);
  }

  // ============================================================================
  // BODY MANAGEMENT
  // ============================================================================

  public removeBody(body: PhysicsBody): void {
    if (!this.world) return;
    
    this.bodies.delete(body.rigidBody.handle);
    this.collisionCallbacks.delete(body.collider.handle);
    this.sensorCallbacks.delete(body.collider.handle);
    
    this.world.removeCollider(body.collider, true);
    this.world.removeRigidBody(body.rigidBody);
  }

  public getBody(handle: number): PhysicsBody | undefined {
    return this.bodies.get(handle);
  }

  public getAllBodies(): PhysicsBody[] {
    return Array.from(this.bodies.values());
  }

  // ============================================================================
  // WORLD SETTINGS
  // ============================================================================

  public setGravity(gravity: THREE.Vector3): void {
    if (this.world) {
      this.world.gravity = { x: gravity.x, y: gravity.y, z: gravity.z };
    }
  }

  public getGravity(): THREE.Vector3 {
    if (this.world) {
      const g = this.world.gravity;
      return new THREE.Vector3(g.x, g.y, g.z);
    }
    return new THREE.Vector3(0, -9.81, 0);
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  public clear(): void {
    this.bodies.forEach((body) => {
      if (this.world) {
        this.world.removeCollider(body.collider, true);
        this.world.removeRigidBody(body.rigidBody);
      }
    });
    
    this.characterControllers.forEach((cc) => {
      if (this.world) {
        this.world.removeCollider(cc.collider, true);
        this.world.removeRigidBody(cc.rigidBody);
      }
    });
    
    this.bodies.clear();
    this.characterControllers.clear();
    this.collisionCallbacks.clear();
    this.sensorCallbacks.clear();
  }

  public dispose(): void {
    this.clear();
    this.world = null;
    this.eventQueue = null;
    this.initialized = false;
  }
}

export default PhysicsWorld;
