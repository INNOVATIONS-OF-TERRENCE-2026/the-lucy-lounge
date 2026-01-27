/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — ART DIRECTION BIBLE                                          │
 * │                                                                             │
 * │ Formal visual identity system for console-quality web gaming               │
 * │                                                                             │
 * │ SECTIONS:                                                                  │
 * │ • Color Palettes                                                           │
 * │ • Lighting Moods                                                           │
 * │ • UI Motion Principles                                                     │
 * │ • Sound Design Rules                                                       │
 * │ • Genre-Specific Styles                                                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';

// ============================================================================
// COLOR PALETTES
// ============================================================================

export interface ColorPalette {
  name: string;
  primary: number;
  secondary: number;
  accent: number;
  background: number;
  foreground: number;
  success: number;
  warning: number;
  danger: number;
  neutral: number;
  highlight: number;
}

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  // Lucy Arcade Brand Colors
  lucyBrand: {
    name: 'Lucy Brand',
    primary: 0x06b6d4,    // Cyan-500
    secondary: 0x8b5cf6,  // Violet-500
    accent: 0xf43f5e,     // Rose-500
    background: 0x0f172a, // Slate-900
    foreground: 0xf8fafc, // Slate-50
    success: 0x22c55e,    // Green-500
    warning: 0xf59e0b,    // Amber-500
    danger: 0xef4444,     // Red-500
    neutral: 0x64748b,    // Slate-500
    highlight: 0xfbbf24,  // Amber-400
  },
  
  // FPS / Tactical
  tactical: {
    name: 'Tactical Operations',
    primary: 0x3b82f6,    // Blue-500
    secondary: 0x1e293b,  // Slate-800
    accent: 0xf97316,     // Orange-500
    background: 0x0a0f1a, // Deep navy
    foreground: 0xe2e8f0, // Slate-200
    success: 0x10b981,    // Emerald-500
    warning: 0xfbbf24,    // Amber-400
    danger: 0xdc2626,     // Red-600
    neutral: 0x475569,    // Slate-600
    highlight: 0x60a5fa,  // Blue-400
  },
  
  // Racing / Speed
  neonSpeed: {
    name: 'Neon Speed',
    primary: 0xff00ff,    // Magenta
    secondary: 0x00ffff,  // Cyan
    accent: 0xffff00,     // Yellow
    background: 0x0a0a0a, // Near black
    foreground: 0xffffff, // White
    success: 0x00ff00,    // Green
    warning: 0xff8800,    // Orange
    danger: 0xff0044,     // Hot pink
    neutral: 0x444444,    // Dark gray
    highlight: 0xff00aa,  // Pink
  },
  
  // Sports / Athletic
  athletic: {
    name: 'Athletic Arena',
    primary: 0x16a34a,    // Green-600
    secondary: 0x0369a1,  // Sky-700
    accent: 0xfbbf24,     // Amber-400
    background: 0x1c1917, // Stone-900
    foreground: 0xfafaf9, // Stone-50
    success: 0x22c55e,    // Green-500
    warning: 0xf59e0b,    // Amber-500
    danger: 0xef4444,     // Red-500
    neutral: 0x78716c,    // Stone-500
    highlight: 0xfcd34d,  // Amber-300
  },
  
  // Horror / Dark
  darkHorror: {
    name: 'Dark Horror',
    primary: 0x7f1d1d,    // Red-900
    secondary: 0x1f2937,  // Gray-800
    accent: 0xfbbf24,     // Amber-400
    background: 0x030303, // Almost black
    foreground: 0x9ca3af, // Gray-400
    success: 0x065f46,    // Emerald-800
    warning: 0xb45309,    // Amber-700
    danger: 0xb91c1c,     // Red-700
    neutral: 0x374151,    // Gray-700
    highlight: 0xfcd34d,  // Amber-300
  },
  
  // Sci-Fi / Futuristic
  sciFi: {
    name: 'Sci-Fi Future',
    primary: 0x0ea5e9,    // Sky-500
    secondary: 0x7c3aed,  // Violet-600
    accent: 0x10b981,     // Emerald-500
    background: 0x020617, // Slate-950
    foreground: 0xf1f5f9, // Slate-100
    success: 0x14b8a6,    // Teal-500
    warning: 0xf59e0b,    // Amber-500
    danger: 0xf43f5e,     // Rose-500
    neutral: 0x334155,    // Slate-700
    highlight: 0x38bdf8,  // Sky-400
  },
};

// ============================================================================
// LIGHTING MOODS
// ============================================================================

export interface LightingMood {
  name: string;
  ambientColor: number;
  ambientIntensity: number;
  mainLightColor: number;
  mainLightIntensity: number;
  mainLightDirection: THREE.Vector3;
  fillLightColor: number;
  fillLightIntensity: number;
  shadowIntensity: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  exposure: number;
  saturation: number;
  contrast: number;
}

export const LIGHTING_MOODS: Record<string, LightingMood> = {
  // Bright daylight for sports games
  daylight: {
    name: 'Daylight',
    ambientColor: 0x87ceeb,
    ambientIntensity: 0.5,
    mainLightColor: 0xfffaf0,
    mainLightIntensity: 1.2,
    mainLightDirection: new THREE.Vector3(50, 80, 30),
    fillLightColor: 0x8ec8e8,
    fillLightIntensity: 0.4,
    shadowIntensity: 0.6,
    fogColor: 0xc8dce8,
    fogNear: 50,
    fogFar: 200,
    exposure: 1.0,
    saturation: 1.1,
    contrast: 1.0,
  },
  
  // Night tactical for FPS
  nightTactical: {
    name: 'Night Tactical',
    ambientColor: 0x1a1a2e,
    ambientIntensity: 0.25,
    mainLightColor: 0x6080aa,
    mainLightIntensity: 0.7,
    mainLightDirection: new THREE.Vector3(30, 60, 20),
    fillLightColor: 0x303050,
    fillLightIntensity: 0.2,
    shadowIntensity: 0.85,
    fogColor: 0x0a0f1a,
    fogNear: 15,
    fogFar: 100,
    exposure: 0.9,
    saturation: 0.85,
    contrast: 1.2,
  },
  
  // Neon night for racing
  neonNight: {
    name: 'Neon Night',
    ambientColor: 0x0a0a0a,
    ambientIntensity: 0.15,
    mainLightColor: 0x4040ff,
    mainLightIntensity: 0.5,
    mainLightDirection: new THREE.Vector3(0, 50, 0),
    fillLightColor: 0xff00ff,
    fillLightIntensity: 0.3,
    shadowIntensity: 0.95,
    fogColor: 0x050510,
    fogNear: 10,
    fogFar: 80,
    exposure: 1.1,
    saturation: 1.4,
    contrast: 1.3,
  },
  
  // Golden hour for dramatic scenes
  goldenHour: {
    name: 'Golden Hour',
    ambientColor: 0xffd5a0,
    ambientIntensity: 0.4,
    mainLightColor: 0xff9040,
    mainLightIntensity: 1.0,
    mainLightDirection: new THREE.Vector3(80, 20, 30),
    fillLightColor: 0x6080c0,
    fillLightIntensity: 0.25,
    shadowIntensity: 0.7,
    fogColor: 0xffd090,
    fogNear: 30,
    fogFar: 150,
    exposure: 1.0,
    saturation: 1.2,
    contrast: 1.05,
  },
  
  // Indoor arena
  indoorArena: {
    name: 'Indoor Arena',
    ambientColor: 0x606060,
    ambientIntensity: 0.5,
    mainLightColor: 0xffffff,
    mainLightIntensity: 0.8,
    mainLightDirection: new THREE.Vector3(0, 100, 0),
    fillLightColor: 0xffffff,
    fillLightIntensity: 0.4,
    shadowIntensity: 0.5,
    fogColor: 0x303030,
    fogNear: 50,
    fogFar: 150,
    exposure: 1.0,
    saturation: 1.0,
    contrast: 1.0,
  },
  
  // Space environment
  deepSpace: {
    name: 'Deep Space',
    ambientColor: 0x050510,
    ambientIntensity: 0.1,
    mainLightColor: 0xffffff,
    mainLightIntensity: 1.5,
    mainLightDirection: new THREE.Vector3(100, 50, 0),
    fillLightColor: 0x2020ff,
    fillLightIntensity: 0.15,
    shadowIntensity: 1.0,
    fogColor: 0x000000,
    fogNear: 100,
    fogFar: 1000,
    exposure: 1.2,
    saturation: 0.9,
    contrast: 1.4,
  },
};

// ============================================================================
// UI MOTION PRINCIPLES
// ============================================================================

export interface MotionConfig {
  // Timing functions
  easeInOut: string;
  easeOut: string;
  easeIn: string;
  spring: string;
  bounce: string;
  
  // Duration scales (ms)
  instant: number;
  fast: number;
  normal: number;
  slow: number;
  dramatic: number;
  
  // Distance scales (px)
  micro: number;
  small: number;
  medium: number;
  large: number;
  
  // Stagger delays (ms)
  staggerBase: number;
  staggerIncrement: number;
}

export const MOTION_CONFIG: MotionConfig = {
  // Timing functions (CSS/JS compatible)
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // Duration scales
  instant: 50,
  fast: 150,
  normal: 300,
  slow: 500,
  dramatic: 800,
  
  // Distance scales
  micro: 4,
  small: 8,
  medium: 16,
  large: 32,
  
  // Stagger delays
  staggerBase: 50,
  staggerIncrement: 30,
};

// UI Animation presets
export const UI_ANIMATIONS = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: MOTION_CONFIG.normal,
    easing: MOTION_CONFIG.easeOut,
  },
  
  slideUp: {
    from: { opacity: 0, transform: `translateY(${MOTION_CONFIG.medium}px)` },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: MOTION_CONFIG.normal,
    easing: MOTION_CONFIG.easeOut,
  },
  
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: MOTION_CONFIG.fast,
    easing: MOTION_CONFIG.spring,
  },
  
  popIn: {
    from: { opacity: 0, transform: 'scale(0.5)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: MOTION_CONFIG.normal,
    easing: MOTION_CONFIG.bounce,
  },
  
  hitMarker: {
    from: { opacity: 1, transform: 'scale(1)' },
    to: { opacity: 0, transform: 'scale(1.5)' },
    duration: MOTION_CONFIG.fast,
    easing: MOTION_CONFIG.easeOut,
  },
  
  damageFlash: {
    from: { backgroundColor: 'rgba(255, 0, 0, 0.3)' },
    to: { backgroundColor: 'rgba(255, 0, 0, 0)' },
    duration: MOTION_CONFIG.normal,
    easing: MOTION_CONFIG.easeOut,
  },
};

// ============================================================================
// SOUND DESIGN RULES
// ============================================================================

export interface SoundCategory {
  name: string;
  baseVolume: number;
  priority: number;
  maxConcurrent: number;
  spatialize: boolean;
  falloffDistance: number;
  attenuationModel: 'linear' | 'inverse' | 'exponential';
}

export const SOUND_CATEGORIES: Record<string, SoundCategory> = {
  // Highest priority - always heard
  ui: {
    name: 'UI',
    baseVolume: 0.8,
    priority: 10,
    maxConcurrent: 5,
    spatialize: false,
    falloffDistance: 0,
    attenuationModel: 'linear',
  },
  
  // Player actions - very important
  player: {
    name: 'Player',
    baseVolume: 1.0,
    priority: 9,
    maxConcurrent: 8,
    spatialize: true,
    falloffDistance: 30,
    attenuationModel: 'inverse',
  },
  
  // Weapons - high priority
  weapon: {
    name: 'Weapons',
    baseVolume: 0.9,
    priority: 8,
    maxConcurrent: 10,
    spatialize: true,
    falloffDistance: 50,
    attenuationModel: 'inverse',
  },
  
  // Enemy sounds - medium-high
  enemy: {
    name: 'Enemy',
    baseVolume: 0.85,
    priority: 7,
    maxConcurrent: 15,
    spatialize: true,
    falloffDistance: 40,
    attenuationModel: 'inverse',
  },
  
  // Impacts and effects
  impact: {
    name: 'Impact',
    baseVolume: 0.8,
    priority: 6,
    maxConcurrent: 20,
    spatialize: true,
    falloffDistance: 35,
    attenuationModel: 'exponential',
  },
  
  // Environment - lower priority
  environment: {
    name: 'Environment',
    baseVolume: 0.6,
    priority: 4,
    maxConcurrent: 10,
    spatialize: true,
    falloffDistance: 60,
    attenuationModel: 'linear',
  },
  
  // Ambient sounds - lowest priority
  ambient: {
    name: 'Ambient',
    baseVolume: 0.4,
    priority: 2,
    maxConcurrent: 5,
    spatialize: false,
    falloffDistance: 0,
    attenuationModel: 'linear',
  },
  
  // Music
  music: {
    name: 'Music',
    baseVolume: 0.5,
    priority: 1,
    maxConcurrent: 2,
    spatialize: false,
    falloffDistance: 0,
    attenuationModel: 'linear',
  },
};

// ============================================================================
// GENRE-SPECIFIC STYLES
// ============================================================================

export interface GenreStyle {
  name: string;
  palette: string;
  lighting: string;
  cameraFOV: number;
  cameraPosition: 'first_person' | 'third_person' | 'top_down' | 'isometric' | 'side';
  motionBlur: boolean;
  depthOfField: boolean;
  chromaticAberration: boolean;
  bloomIntensity: number;
  particleDensity: number;
  uiStyle: 'minimal' | 'tactical' | 'arcade' | 'sport' | 'horror';
}

export const GENRE_STYLES: Record<string, GenreStyle> = {
  fps: {
    name: 'First-Person Shooter',
    palette: 'tactical',
    lighting: 'nightTactical',
    cameraFOV: 80,
    cameraPosition: 'first_person',
    motionBlur: true,
    depthOfField: false,
    chromaticAberration: true,
    bloomIntensity: 0.4,
    particleDensity: 1.0,
    uiStyle: 'tactical',
  },
  
  racing: {
    name: 'Racing',
    palette: 'neonSpeed',
    lighting: 'neonNight',
    cameraFOV: 90,
    cameraPosition: 'third_person',
    motionBlur: true,
    depthOfField: false,
    chromaticAberration: true,
    bloomIntensity: 0.8,
    particleDensity: 1.2,
    uiStyle: 'arcade',
  },
  
  sports: {
    name: 'Sports',
    palette: 'athletic',
    lighting: 'daylight',
    cameraFOV: 70,
    cameraPosition: 'third_person',
    motionBlur: false,
    depthOfField: true,
    chromaticAberration: false,
    bloomIntensity: 0.3,
    particleDensity: 0.8,
    uiStyle: 'sport',
  },
  
  action: {
    name: 'Action',
    palette: 'lucyBrand',
    lighting: 'goldenHour',
    cameraFOV: 75,
    cameraPosition: 'third_person',
    motionBlur: true,
    depthOfField: false,
    chromaticAberration: true,
    bloomIntensity: 0.5,
    particleDensity: 1.0,
    uiStyle: 'arcade',
  },
  
  strategy: {
    name: 'Strategy',
    palette: 'sciFi',
    lighting: 'indoorArena',
    cameraFOV: 60,
    cameraPosition: 'isometric',
    motionBlur: false,
    depthOfField: false,
    chromaticAberration: false,
    bloomIntensity: 0.2,
    particleDensity: 0.5,
    uiStyle: 'minimal',
  },
  
  space: {
    name: 'Space',
    palette: 'sciFi',
    lighting: 'deepSpace',
    cameraFOV: 85,
    cameraPosition: 'third_person',
    motionBlur: true,
    depthOfField: false,
    chromaticAberration: true,
    bloomIntensity: 1.0,
    particleDensity: 1.5,
    uiStyle: 'tactical',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getColorAsHex(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}

export function getColorAsRGB(color: number): { r: number; g: number; b: number } {
  return {
    r: (color >> 16) & 255,
    g: (color >> 8) & 255,
    b: color & 255,
  };
}

export function applyLightingMood(
  scene: THREE.Scene,
  mood: LightingMood
): { ambient: THREE.AmbientLight; main: THREE.DirectionalLight; fill: THREE.DirectionalLight } {
  // Create ambient light
  const ambient = new THREE.AmbientLight(mood.ambientColor, mood.ambientIntensity);
  scene.add(ambient);
  
  // Create main directional light
  const main = new THREE.DirectionalLight(mood.mainLightColor, mood.mainLightIntensity);
  main.position.copy(mood.mainLightDirection);
  main.castShadow = true;
  scene.add(main);
  
  // Create fill light
  const fill = new THREE.DirectionalLight(mood.fillLightColor, mood.fillLightIntensity);
  fill.position.set(-mood.mainLightDirection.x, mood.mainLightDirection.y * 0.5, -mood.mainLightDirection.z);
  scene.add(fill);
  
  // Apply fog
  scene.fog = new THREE.Fog(mood.fogColor, mood.fogNear, mood.fogFar);
  
  return { ambient, main, fill };
}

export function getPaletteForGenre(genre: string): ColorPalette {
  const style = GENRE_STYLES[genre] || GENRE_STYLES.action;
  return COLOR_PALETTES[style.palette] || COLOR_PALETTES.lucyBrand;
}

export function getLightingForGenre(genre: string): LightingMood {
  const style = GENRE_STYLES[genre] || GENRE_STYLES.action;
  return LIGHTING_MOODS[style.lighting] || LIGHTING_MOODS.daylight;
}

export default {
  COLOR_PALETTES,
  LIGHTING_MOODS,
  MOTION_CONFIG,
  UI_ANIMATIONS,
  SOUND_CATEGORIES,
  GENRE_STYLES,
};
