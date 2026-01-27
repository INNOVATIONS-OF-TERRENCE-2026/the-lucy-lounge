/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — INPUT MANAGER                                                │
 * │                                                                             │
 * │ Gamepad-first input system with keyboard/mouse/touch support               │
 * │ Unified input abstraction for all control schemes                          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

export interface GamepadState {
  connected: boolean;
  id: string;
  // Axes (normalized -1 to 1)
  leftStickX: number;
  leftStickY: number;
  rightStickX: number;
  rightStickY: number;
  leftTrigger: number;
  rightTrigger: number;
  // Buttons (pressed state)
  a: boolean;
  b: boolean;
  x: boolean;
  y: boolean;
  leftBumper: boolean;
  rightBumper: boolean;
  back: boolean;
  start: boolean;
  leftStickButton: boolean;
  rightStickButton: boolean;
  dpadUp: boolean;
  dpadDown: boolean;
  dpadLeft: boolean;
  dpadRight: boolean;
  home: boolean;
  // Raw button values (for pressure sensitivity)
  buttons: number[];
  axes: number[];
}

export interface MouseState {
  x: number;
  y: number;
  normalizedX: number; // -1 to 1
  normalizedY: number; // -1 to 1
  deltaX: number;
  deltaY: number;
  leftButton: boolean;
  rightButton: boolean;
  middleButton: boolean;
  wheelDelta: number;
  locked: boolean;
}

export interface TouchState {
  active: boolean;
  touches: Array<{
    id: number;
    x: number;
    y: number;
    normalizedX: number;
    normalizedY: number;
    force: number;
  }>;
  pinchDistance: number;
  pinchDelta: number;
}

export interface InputState {
  // Keyboard
  keys: Set<string>;
  keysJustPressed: Set<string>;
  keysJustReleased: Set<string>;
  
  // Mouse
  mouse: MouseState;
  
  // Touch
  touch: TouchState;
  
  // Gamepad (primary)
  gamepad: GamepadState | null;
  
  // All connected gamepads
  gamepads: GamepadState[];
  
  // Unified virtual inputs (abstracted across all input methods)
  virtual: VirtualInputState;
}

export interface VirtualInputState {
  // Movement (from left stick, WASD, or touch joystick)
  moveX: number;
  moveY: number;
  
  // Look (from right stick, mouse delta, or touch)
  lookX: number;
  lookY: number;
  
  // Actions (mapped from various inputs)
  jump: boolean;
  jumpPressed: boolean;
  fire: boolean;
  firePressed: boolean;
  aim: boolean;
  reload: boolean;
  reloadPressed: boolean;
  interact: boolean;
  interactPressed: boolean;
  sprint: boolean;
  crouch: boolean;
  crouchPressed: boolean;
  pause: boolean;
  pausePressed: boolean;
  
  // D-pad / menu navigation
  menuUp: boolean;
  menuDown: boolean;
  menuLeft: boolean;
  menuRight: boolean;
  menuConfirm: boolean;
  menuBack: boolean;
}

// Default key bindings
const DEFAULT_BINDINGS = {
  moveForward: ['KeyW', 'ArrowUp'],
  moveBackward: ['KeyS', 'ArrowDown'],
  moveLeft: ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  jump: ['Space'],
  fire: ['Mouse0'],
  aim: ['Mouse2'],
  reload: ['KeyR'],
  interact: ['KeyE', 'KeyF'],
  sprint: ['ShiftLeft', 'ShiftRight'],
  crouch: ['ControlLeft', 'KeyC'],
  pause: ['Escape', 'KeyP'],
};

export class InputManager {
  private element: HTMLElement;
  private isActive: boolean = false;
  
  // Raw input states
  private keysDown: Set<string> = new Set();
  private keysPressed: Set<string> = new Set();
  private keysReleased: Set<string> = new Set();
  
  private mouseState: MouseState = {
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
    deltaX: 0,
    deltaY: 0,
    leftButton: false,
    rightButton: false,
    middleButton: false,
    wheelDelta: 0,
    locked: false,
  };
  
  private touchState: TouchState = {
    active: false,
    touches: [],
    pinchDistance: 0,
    pinchDelta: 0,
  };
  
  private lastPinchDistance: number = 0;
  
  // Gamepad state
  private gamepadStates: GamepadState[] = [];
  private gamepadDeadzone: number = 0.15;
  
  // Previous frame state (for detecting just pressed/released)
  private prevVirtual: Partial<VirtualInputState> = {};
  
  // Bindings
  private bindings = { ...DEFAULT_BINDINGS };
  
  // Mouse sensitivity
  private mouseSensitivity: number = 0.002;

  constructor(element: HTMLElement) {
    this.element = element;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    
    // Mouse
    this.element.addEventListener('mousedown', this.onMouseDown);
    this.element.addEventListener('mouseup', this.onMouseUp);
    this.element.addEventListener('mousemove', this.onMouseMove);
    this.element.addEventListener('wheel', this.onWheel, { passive: false });
    this.element.addEventListener('contextmenu', this.onContextMenu);
    
    // Pointer lock
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    
    // Touch
    this.element.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.onTouchEnd);
    this.element.addEventListener('touchcancel', this.onTouchEnd);
    
    // Gamepad
    window.addEventListener('gamepadconnected', this.onGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);
  }

  // ============================================================================
  // KEYBOARD HANDLERS
  // ============================================================================

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.isActive) return;
    
    const code = e.code;
    
    if (!this.keysDown.has(code)) {
      this.keysPressed.add(code);
    }
    
    this.keysDown.add(code);
    
    // Prevent default for game keys
    if (this.isGameKey(code)) {
      e.preventDefault();
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    if (!this.isActive) return;
    
    const code = e.code;
    this.keysDown.delete(code);
    this.keysReleased.add(code);
  };

  private isGameKey(code: string): boolean {
    const allBindings = Object.values(this.bindings).flat();
    return allBindings.includes(code) || code.startsWith('Arrow');
  }

  // ============================================================================
  // MOUSE HANDLERS
  // ============================================================================

  private onMouseDown = (e: MouseEvent): void => {
    if (!this.isActive) return;
    
    switch (e.button) {
      case 0:
        this.mouseState.leftButton = true;
        this.keysPressed.add('Mouse0');
        this.keysDown.add('Mouse0');
        break;
      case 1:
        this.mouseState.middleButton = true;
        this.keysPressed.add('Mouse1');
        this.keysDown.add('Mouse1');
        break;
      case 2:
        this.mouseState.rightButton = true;
        this.keysPressed.add('Mouse2');
        this.keysDown.add('Mouse2');
        break;
    }
  };

  private onMouseUp = (e: MouseEvent): void => {
    if (!this.isActive) return;
    
    switch (e.button) {
      case 0:
        this.mouseState.leftButton = false;
        this.keysReleased.add('Mouse0');
        this.keysDown.delete('Mouse0');
        break;
      case 1:
        this.mouseState.middleButton = false;
        this.keysReleased.add('Mouse1');
        this.keysDown.delete('Mouse1');
        break;
      case 2:
        this.mouseState.rightButton = false;
        this.keysReleased.add('Mouse2');
        this.keysDown.delete('Mouse2');
        break;
    }
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.isActive) return;
    
    const rect = this.element.getBoundingClientRect();
    
    this.mouseState.x = e.clientX - rect.left;
    this.mouseState.y = e.clientY - rect.top;
    this.mouseState.normalizedX = (this.mouseState.x / rect.width) * 2 - 1;
    this.mouseState.normalizedY = -((this.mouseState.y / rect.height) * 2 - 1);
    
    if (this.mouseState.locked) {
      this.mouseState.deltaX += e.movementX;
      this.mouseState.deltaY += e.movementY;
    }
  };

  private onWheel = (e: WheelEvent): void => {
    if (!this.isActive) return;
    
    e.preventDefault();
    this.mouseState.wheelDelta += Math.sign(e.deltaY);
  };

  private onContextMenu = (e: MouseEvent): void => {
    if (this.isActive) {
      e.preventDefault();
    }
  };

  private onPointerLockChange = (): void => {
    this.mouseState.locked = document.pointerLockElement === this.element;
  };

  // ============================================================================
  // TOUCH HANDLERS
  // ============================================================================

  private onTouchStart = (e: TouchEvent): void => {
    if (!this.isActive) return;
    
    e.preventDefault();
    this.updateTouches(e.touches);
    this.touchState.active = true;
  };

  private onTouchMove = (e: TouchEvent): void => {
    if (!this.isActive) return;
    
    e.preventDefault();
    this.updateTouches(e.touches);
  };

  private onTouchEnd = (e: TouchEvent): void => {
    if (!this.isActive) return;
    
    this.updateTouches(e.touches);
    this.touchState.active = e.touches.length > 0;
  };

  private updateTouches(touches: TouchList): void {
    const rect = this.element.getBoundingClientRect();
    
    this.touchState.touches = Array.from(touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      normalizedX: ((touch.clientX - rect.left) / rect.width) * 2 - 1,
      normalizedY: -(((touch.clientY - rect.top) / rect.height) * 2 - 1),
      force: touch.force || 1,
    }));
    
    // Calculate pinch
    if (this.touchState.touches.length >= 2) {
      const t1 = this.touchState.touches[0];
      const t2 = this.touchState.touches[1];
      const distance = Math.hypot(t2.x - t1.x, t2.y - t1.y);
      
      this.touchState.pinchDelta = distance - this.lastPinchDistance;
      this.touchState.pinchDistance = distance;
      this.lastPinchDistance = distance;
    } else {
      this.lastPinchDistance = 0;
      this.touchState.pinchDelta = 0;
    }
  }

  // ============================================================================
  // GAMEPAD HANDLERS
  // ============================================================================

  private onGamepadConnected = (e: GamepadEvent): void => {
    console.log(`[InputManager] Gamepad connected: ${e.gamepad.id}`);
  };

  private onGamepadDisconnected = (e: GamepadEvent): void => {
    console.log(`[InputManager] Gamepad disconnected: ${e.gamepad.id}`);
  };

  private pollGamepads(): void {
    const gamepads = navigator.getGamepads();
    this.gamepadStates = [];
    
    for (const gp of gamepads) {
      if (!gp) continue;
      
      const state: GamepadState = {
        connected: gp.connected,
        id: gp.id,
        
        // Axes with deadzone
        leftStickX: this.applyDeadzone(gp.axes[0] || 0),
        leftStickY: this.applyDeadzone(gp.axes[1] || 0),
        rightStickX: this.applyDeadzone(gp.axes[2] || 0),
        rightStickY: this.applyDeadzone(gp.axes[3] || 0),
        leftTrigger: gp.buttons[6]?.value || 0,
        rightTrigger: gp.buttons[7]?.value || 0,
        
        // Buttons (standard gamepad mapping)
        a: gp.buttons[0]?.pressed || false,
        b: gp.buttons[1]?.pressed || false,
        x: gp.buttons[2]?.pressed || false,
        y: gp.buttons[3]?.pressed || false,
        leftBumper: gp.buttons[4]?.pressed || false,
        rightBumper: gp.buttons[5]?.pressed || false,
        back: gp.buttons[8]?.pressed || false,
        start: gp.buttons[9]?.pressed || false,
        leftStickButton: gp.buttons[10]?.pressed || false,
        rightStickButton: gp.buttons[11]?.pressed || false,
        dpadUp: gp.buttons[12]?.pressed || false,
        dpadDown: gp.buttons[13]?.pressed || false,
        dpadLeft: gp.buttons[14]?.pressed || false,
        dpadRight: gp.buttons[15]?.pressed || false,
        home: gp.buttons[16]?.pressed || false,
        
        // Raw values
        buttons: gp.buttons.map(b => b.value),
        axes: [...gp.axes],
      };
      
      this.gamepadStates.push(state);
    }
  }

  private applyDeadzone(value: number): number {
    if (Math.abs(value) < this.gamepadDeadzone) return 0;
    
    // Rescale to full range after deadzone
    const sign = Math.sign(value);
    const magnitude = Math.abs(value);
    return sign * ((magnitude - this.gamepadDeadzone) / (1 - this.gamepadDeadzone));
  }

  // ============================================================================
  // VIRTUAL INPUT MAPPING
  // ============================================================================

  private computeVirtualInputs(): VirtualInputState {
    const gp = this.gamepadStates[0] || null;
    
    // Movement
    let moveX = 0;
    let moveY = 0;
    
    // Keyboard WASD
    if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) moveY += 1;
    if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) moveY -= 1;
    if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) moveX -= 1;
    if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) moveX += 1;
    
    // Gamepad left stick (takes priority if significant input)
    if (gp && (Math.abs(gp.leftStickX) > 0.1 || Math.abs(gp.leftStickY) > 0.1)) {
      moveX = gp.leftStickX;
      moveY = -gp.leftStickY; // Invert Y
    }
    
    // Normalize diagonal movement
    const moveMag = Math.hypot(moveX, moveY);
    if (moveMag > 1) {
      moveX /= moveMag;
      moveY /= moveMag;
    }
    
    // Look
    let lookX = 0;
    let lookY = 0;
    
    // Mouse (when locked)
    if (this.mouseState.locked) {
      lookX = this.mouseState.deltaX * this.mouseSensitivity;
      lookY = this.mouseState.deltaY * this.mouseSensitivity;
    }
    
    // Gamepad right stick
    if (gp) {
      lookX += gp.rightStickX * 0.05;
      lookY += gp.rightStickY * 0.05;
    }
    
    // Actions
    const jump = this.isKeyDown('Space') || (gp?.a ?? false);
    const fire = this.mouseState.leftButton || (gp?.rightTrigger ?? 0) > 0.5;
    const aim = this.mouseState.rightButton || (gp?.leftTrigger ?? 0) > 0.5;
    const reload = this.isKeyDown('KeyR') || (gp?.x ?? false);
    const interact = this.isKeyDown('KeyE') || this.isKeyDown('KeyF') || (gp?.y ?? false);
    const sprint = this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight') || (gp?.leftStickButton ?? false);
    const crouch = this.isKeyDown('ControlLeft') || this.isKeyDown('KeyC') || (gp?.b ?? false);
    const pause = this.isKeyDown('Escape') || (gp?.start ?? false);
    
    // Menu navigation
    const menuUp = this.isKeyDown('ArrowUp') || (gp?.dpadUp ?? false);
    const menuDown = this.isKeyDown('ArrowDown') || (gp?.dpadDown ?? false);
    const menuLeft = this.isKeyDown('ArrowLeft') || (gp?.dpadLeft ?? false);
    const menuRight = this.isKeyDown('ArrowRight') || (gp?.dpadRight ?? false);
    const menuConfirm = this.isKeyDown('Enter') || this.isKeyDown('Space') || (gp?.a ?? false);
    const menuBack = this.isKeyDown('Escape') || this.isKeyDown('Backspace') || (gp?.b ?? false);
    
    return {
      moveX,
      moveY,
      lookX,
      lookY,
      jump,
      jumpPressed: jump && !this.prevVirtual.jump,
      fire,
      firePressed: fire && !this.prevVirtual.fire,
      aim,
      reload,
      reloadPressed: reload && !this.prevVirtual.reload,
      interact,
      interactPressed: interact && !this.prevVirtual.interact,
      sprint,
      crouch,
      crouchPressed: crouch && !this.prevVirtual.crouch,
      pause,
      pausePressed: pause && !this.prevVirtual.pause,
      menuUp,
      menuDown,
      menuLeft,
      menuRight,
      menuConfirm,
      menuBack,
    };
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  public start(): void {
    this.isActive = true;
  }

  public stop(): void {
    this.isActive = false;
    this.keysDown.clear();
    this.keysPressed.clear();
    this.keysReleased.clear();
  }

  public update(): void {
    // Poll gamepads (must be done each frame)
    this.pollGamepads();
  }

  public getState(): InputState {
    const virtual = this.computeVirtualInputs();
    
    const state: InputState = {
      keys: new Set(this.keysDown),
      keysJustPressed: new Set(this.keysPressed),
      keysJustReleased: new Set(this.keysReleased),
      mouse: { ...this.mouseState },
      touch: { ...this.touchState, touches: [...this.touchState.touches] },
      gamepad: this.gamepadStates[0] || null,
      gamepads: [...this.gamepadStates],
      virtual,
    };
    
    // Clear per-frame state
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mouseState.deltaX = 0;
    this.mouseState.deltaY = 0;
    this.mouseState.wheelDelta = 0;
    
    // Store previous virtual state
    this.prevVirtual = { ...virtual };
    
    return state;
  }

  public isKeyDown(code: string): boolean {
    return this.keysDown.has(code);
  }

  public isKeyPressed(code: string): boolean {
    return this.keysPressed.has(code);
  }

  public isKeyReleased(code: string): boolean {
    return this.keysReleased.has(code);
  }

  public requestPointerLock(): void {
    this.element.requestPointerLock();
  }

  public exitPointerLock(): void {
    document.exitPointerLock();
  }

  public setMouseSensitivity(sensitivity: number): void {
    this.mouseSensitivity = sensitivity;
  }

  public setGamepadDeadzone(deadzone: number): void {
    this.gamepadDeadzone = Math.max(0, Math.min(0.5, deadzone));
  }

  public vibrate(duration: number = 200, strongMagnitude: number = 0.5, weakMagnitude: number = 0.5): void {
    const gamepads = navigator.getGamepads();
    for (const gp of gamepads) {
      if (gp?.vibrationActuator) {
        (gp.vibrationActuator as any).playEffect?.('dual-rumble', {
          duration,
          strongMagnitude,
          weakMagnitude,
        });
      }
    }
  }

  public dispose(): void {
    this.stop();
    
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    
    this.element.removeEventListener('mousedown', this.onMouseDown);
    this.element.removeEventListener('mouseup', this.onMouseUp);
    this.element.removeEventListener('mousemove', this.onMouseMove);
    this.element.removeEventListener('wheel', this.onWheel);
    this.element.removeEventListener('contextmenu', this.onContextMenu);
    
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    
    this.element.removeEventListener('touchstart', this.onTouchStart);
    this.element.removeEventListener('touchmove', this.onTouchMove);
    this.element.removeEventListener('touchend', this.onTouchEnd);
    this.element.removeEventListener('touchcancel', this.onTouchEnd);
    
    window.removeEventListener('gamepadconnected', this.onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
  }
}

export default InputManager;
