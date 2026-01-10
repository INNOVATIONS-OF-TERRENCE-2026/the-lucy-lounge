// Lucy Shot Director
// Converts prompts into detailed shot lists for multi-scene productions

import type { CinematicShot } from '../types/cinematic.types';
import { getStylePreset } from './lucyStylePresets';

interface DirectorOptions {
  totalDuration: number;
  stylePreset: string;
  shotCount?: number;
  pacing?: 'slow' | 'medium' | 'fast';
}

interface ShotPlan {
  shots: CinematicShot[];
  totalDuration: number;
  transitionSummary: string;
  directorNotes: string;
}

// Camera shot types
const shotTypes = [
  { name: 'Establishing Wide', camera: 'wide angle', movement: 'slow pan', ideal: 'opening' },
  { name: 'Medium Shot', camera: 'medium lens', movement: 'steady', ideal: 'dialogue' },
  { name: 'Close Up', camera: 'telephoto', movement: 'subtle drift', ideal: 'emotion' },
  { name: 'Detail Insert', camera: 'macro', movement: 'static', ideal: 'detail' },
  { name: 'Over Shoulder', camera: 'medium', movement: 'follow', ideal: 'perspective' },
  { name: 'Tracking Shot', camera: 'wide to medium', movement: 'dolly', ideal: 'action' },
  { name: 'Crane Shot', camera: 'wide', movement: 'crane up', ideal: 'reveal' },
  { name: 'POV Shot', camera: 'handheld', movement: 'first person', ideal: 'immersion' },
];

// Transition types
const transitions = [
  { name: 'Cut', duration: 0, style: 'direct cut to next shot' },
  { name: 'Dissolve', duration: 0.5, style: 'gentle crossfade' },
  { name: 'Fade', duration: 1, style: 'fade through black' },
  { name: 'Wipe', duration: 0.3, style: 'directional wipe' },
  { name: 'Zoom Match', duration: 0.5, style: 'zoom into match cut' },
  { name: 'Push', duration: 0.3, style: 'push transition' },
];

// Pacing configurations
const pacingConfigs = {
  slow: { minShotDuration: 4, maxShotDuration: 8, preferredTransition: 'Dissolve' },
  medium: { minShotDuration: 2, maxShotDuration: 5, preferredTransition: 'Cut' },
  fast: { minShotDuration: 1, maxShotDuration: 3, preferredTransition: 'Cut' },
};

// Generate unique ID
function generateShotId(): string {
  return `shot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Parse prompt for key scenes/moments
function extractSceneMoments(prompt: string): string[] {
  // Split by natural language cues
  const delimiters = /(?:,\s*then\s+|,\s*and\s+|,\s*followed\s+by\s+|,\s*next\s+|,\s*finally\s+|,\s+)/gi;
  const parts = prompt.split(delimiters).filter(p => p.trim().length > 5);
  
  if (parts.length < 2) {
    // If no natural splits, create narrative structure
    return [
      `Opening: ${prompt}`,
      `Development: ${prompt} with dynamic movement`,
      `Climax: ${prompt} at peak moment`,
      `Resolution: ${prompt} conclusion`,
    ];
  }
  
  return parts.map((p, i) => p.trim());
}

// Calculate shot durations based on total time and pacing
function distributeDurations(
  shotCount: number,
  totalDuration: number,
  pacing: 'slow' | 'medium' | 'fast'
): number[] {
  const config = pacingConfigs[pacing];
  const durations: number[] = [];
  let remaining = totalDuration;
  
  for (let i = 0; i < shotCount; i++) {
    const isLast = i === shotCount - 1;
    if (isLast) {
      durations.push(Math.max(config.minShotDuration, remaining));
    } else {
      const maxPossible = Math.min(config.maxShotDuration, remaining - (shotCount - i - 1) * config.minShotDuration);
      const minPossible = config.minShotDuration;
      const duration = minPossible + Math.random() * (maxPossible - minPossible);
      const rounded = Math.round(duration * 10) / 10;
      durations.push(rounded);
      remaining -= rounded;
    }
  }
  
  return durations;
}

// Select appropriate shot type based on position and content
function selectShotType(index: number, total: number, content: string): typeof shotTypes[0] {
  // Opening shot
  if (index === 0) {
    return shotTypes.find(s => s.ideal === 'opening') || shotTypes[0];
  }
  // Closing shot
  if (index === total - 1) {
    return shotTypes.find(s => s.ideal === 'reveal') || shotTypes[6];
  }
  // Middle shots - vary based on content keywords
  const hasEmotion = /feel|emotion|heart|soul|passion/i.test(content);
  const hasAction = /run|move|chase|fight|dance|jump/i.test(content);
  const hasDetail = /detail|close|texture|intricate/i.test(content);
  
  if (hasEmotion) return shotTypes.find(s => s.ideal === 'emotion') || shotTypes[2];
  if (hasAction) return shotTypes.find(s => s.ideal === 'action') || shotTypes[5];
  if (hasDetail) return shotTypes.find(s => s.ideal === 'detail') || shotTypes[3];
  
  // Default to medium shot for middle content
  return shotTypes[1];
}

// Select transition based on pacing and shot relationship
function selectTransition(
  currentIndex: number,
  total: number,
  pacing: 'slow' | 'medium' | 'fast'
): typeof transitions[0] {
  const config = pacingConfigs[pacing];
  const preferred = transitions.find(t => t.name === config.preferredTransition);
  
  // Last shot doesn't need a transition
  if (currentIndex === total - 1) {
    return { name: 'End', duration: 0, style: 'final shot - no transition' };
  }
  
  // Use dissolve for slower, emotional transitions mid-sequence
  if (pacing === 'slow' && currentIndex > 0 && currentIndex < total - 2) {
    return transitions[1]; // Dissolve
  }
  
  return preferred || transitions[0];
}

export function createShotPlan(
  prompt: string,
  options: DirectorOptions
): ShotPlan {
  const preset = getStylePreset(options.stylePreset);
  const pacing = options.pacing || 'medium';
  
  // Extract scene moments from prompt
  const moments = extractSceneMoments(prompt);
  const shotCount = options.shotCount || Math.min(moments.length, Math.ceil(options.totalDuration / pacingConfigs[pacing].minShotDuration));
  
  // Distribute durations
  const durations = distributeDurations(shotCount, options.totalDuration, pacing);
  
  // Build shots
  const shots: CinematicShot[] = [];
  
  for (let i = 0; i < shotCount; i++) {
    const moment = moments[i % moments.length];
    const shotType = selectShotType(i, shotCount, moment);
    const transition = selectTransition(i, shotCount, pacing);
    
    const shot: CinematicShot = {
      id: generateShotId(),
      name: `${shotType.name} ${i + 1}`,
      prompt: `${moment}, ${preset.promptInjection}`,
      duration: durations[i],
      camera: shotType.camera,
      movement: shotType.movement,
      transition: transition.name,
      notes: `${shotType.ideal} moment - ${transition.style}`,
    };
    
    shots.push(shot);
  }
  
  // Calculate actual total
  const actualTotal = shots.reduce((sum, s) => sum + s.duration, 0);
  
  // Build summary
  const transitionSummary = shots.map(s => s.transition).join(' → ');
  
  const directorNotes = `
Style: ${preset.name}
Pacing: ${pacing}
Total Duration: ${actualTotal}s across ${shots.length} shots
Camera Style: ${preset.cameraDefaults}
Lighting: ${preset.lightingDefaults}
Color: ${preset.colorGrading}
  `.trim();
  
  return {
    shots,
    totalDuration: actualTotal,
    transitionSummary,
    directorNotes,
  };
}

// Quick single-shot generation
export function createSingleShot(
  prompt: string,
  duration: number,
  stylePreset: string = 'cinematic'
): CinematicShot {
  const preset = getStylePreset(stylePreset);
  const shotType = shotTypes[Math.floor(Math.random() * shotTypes.length)];
  
  return {
    id: generateShotId(),
    name: 'Hero Shot',
    prompt: `${prompt}, ${preset.promptInjection}`,
    duration,
    camera: shotType.camera,
    movement: shotType.movement,
    transition: 'End',
    notes: preset.cameraDefaults,
  };
}

// Arcade cutscene specific shot plans
export function createCutsceneShotPlan(
  type: 'intro' | 'victory' | 'defeat',
  gameName: string,
  duration: number
): ShotPlan {
  const templates = {
    intro: `Epic opening sequence for ${gameName}, title reveal, dramatic build up, game atmosphere established`,
    victory: `Triumphant celebration for ${gameName}, winner revealed, glory moment, confetti and celebration`,
    defeat: `Dramatic defeat sequence for ${gameName}, somber mood, reflection moment, try again motivation`,
  };
  
  const styles = {
    intro: 'cinematic',
    victory: 'anime',
    defeat: 'documentary',
  };
  
  return createShotPlan(templates[type], {
    totalDuration: duration,
    stylePreset: styles[type],
    pacing: type === 'intro' ? 'slow' : 'medium',
  });
}
