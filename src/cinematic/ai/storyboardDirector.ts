/**
 * PHASE 3 — Lucy Cinema: Truth-Based Storyboard Director
 * 
 * This is the CANONICAL storyboard generation system for Lucy Cinema.
 * 
 * TRUTH CONTRACT:
 * - Lucy Cinema produces STORYBOARDS, not video
 * - Each output is a KEYFRAME, not a video frame
 * - Motion lives in STRUCTURED METADATA, not rendered pixels
 * - Audio is used to REINFORCE CONTINUITY, not synced to video
 * - UI labels must say "Cinematic storyboard preview" or "Keyframe-based cinematic sequence"
 * - NO false video generation claims
 * 
 * Shot Planning:
 * - Minimum 5 shots, maximum 12 shots per sequence
 * - Each shot includes: description, camera position, camera movement,
 *   subject continuity, lighting continuity, motion intent, duration, audio cue
 * - Transitions between shots enforce visual continuity
 */

// ─── Cinematic Types (local definitions — canonical source in vision engine) ──

export type CameraMovement =
  | "static" | "pan_left" | "pan_right" | "tilt_up" | "tilt_down"
  | "dolly_forward" | "dolly_back" | "zoom_in" | "zoom_out"
  | "orbit_left" | "orbit_right" | "crane_up" | "crane_down"
  | "tracking" | "slow_zoom" | "push_in" | "pull_back"
  | "handheld" | "steadicam";

export type CameraPosition =
  | "wide_establishing" | "medium" | "close_up" | "extreme_close_up"
  | "over_the_shoulder" | "low_angle" | "high_angle" | "birds_eye"
  | "dutch_angle" | "point_of_view";

export type TransitionType =
  | "cut" | "dissolve" | "fade_to_black" | "fade_from_black"
  | "crossfade" | "wipe" | "match_cut";

export interface CinematicShot {
  shotNumber: number;
  description: string;
  cameraMotion: string;
  duration: number;
  aspectRatio: string;
  mood: string;
  imagePrompt: string;
  imageUrl?: string;
  generating?: boolean;
  cameraPosition: CameraPosition;
  cameraMovementType: CameraMovement;
  subjectContinuity: string;
  lightingContinuity: string;
  motionIntent: string;
  transitionToNext: TransitionType;
  environment: string;
  audioCue?: string;
}

export interface CinematicStoryboard {
  title: string;
  logline: string;
  shots: CinematicShot[];
  overallMood: string;
  colorPalette: string;
  audioDirection: string;
}

export interface CinemaSequence {
  storyboard: CinematicStoryboard;
  motionTimeline: unknown[];
  audioTimeline: unknown[];
  totalDurationSec: number;
  outputLabel: string;
  schemaVersion: number;
}

// ─── Shot Director ────────────────────────────────────────────────

/** Shot pacing templates */
export type PacingStyle = 'slow' | 'medium' | 'fast' | 'dramatic';

interface ShotTemplate {
  cameraPosition: CameraPosition;
  cameraMovementType: CameraMovement;
  transitionToNext: TransitionType;
  baseDuration: number; // seconds
  purpose: string;
}

/** Classic cinematic shot sequence patterns */
const SHOT_PATTERNS: Record<PacingStyle, ShotTemplate[]> = {
  slow: [
    { cameraPosition: 'wide_establishing', cameraMovementType: 'slow_zoom', transitionToNext: 'dissolve', baseDuration: 5, purpose: 'Establishing the world' },
    { cameraPosition: 'medium', cameraMovementType: 'dolly_forward', transitionToNext: 'dissolve', baseDuration: 4, purpose: 'Approaching the subject' },
    { cameraPosition: 'close_up', cameraMovementType: 'static', transitionToNext: 'dissolve', baseDuration: 4, purpose: 'Intimate detail' },
    { cameraPosition: 'over_the_shoulder', cameraMovementType: 'pan_left', transitionToNext: 'dissolve', baseDuration: 4, purpose: 'Perspective reveal' },
    { cameraPosition: 'wide_establishing', cameraMovementType: 'crane_up', transitionToNext: 'fade_to_black', baseDuration: 5, purpose: 'Final contextual pull' },
  ],
  medium: [
    { cameraPosition: 'wide_establishing', cameraMovementType: 'tracking', transitionToNext: 'cut', baseDuration: 4, purpose: 'World introduction' },
    { cameraPosition: 'medium', cameraMovementType: 'steadicam', transitionToNext: 'cut', baseDuration: 3, purpose: 'Following the action' },
    { cameraPosition: 'close_up', cameraMovementType: 'push_in', transitionToNext: 'cut', baseDuration: 3, purpose: 'Emotional beat' },
    { cameraPosition: 'low_angle', cameraMovementType: 'tilt_up', transitionToNext: 'cut', baseDuration: 3, purpose: 'Power/scale emphasis' },
    { cameraPosition: 'medium', cameraMovementType: 'pan_right', transitionToNext: 'cut', baseDuration: 3, purpose: 'Action continuation' },
    { cameraPosition: 'wide_establishing', cameraMovementType: 'pull_back', transitionToNext: 'fade_to_black', baseDuration: 4, purpose: 'Resolution' },
  ],
  fast: [
    { cameraPosition: 'medium', cameraMovementType: 'handheld', transitionToNext: 'cut', baseDuration: 2, purpose: 'Immediate action' },
    { cameraPosition: 'close_up', cameraMovementType: 'push_in', transitionToNext: 'cut', baseDuration: 2, purpose: 'Quick beat' },
    { cameraPosition: 'low_angle', cameraMovementType: 'tracking', transitionToNext: 'cut', baseDuration: 2, purpose: 'Dynamic angle' },
    { cameraPosition: 'dutch_angle', cameraMovementType: 'handheld', transitionToNext: 'cut', baseDuration: 2, purpose: 'Tension' },
    { cameraPosition: 'extreme_close_up', cameraMovementType: 'static', transitionToNext: 'cut', baseDuration: 2, purpose: 'Impact' },
    { cameraPosition: 'point_of_view', cameraMovementType: 'steadicam', transitionToNext: 'cut', baseDuration: 2, purpose: 'Immersion' },
    { cameraPosition: 'wide_establishing', cameraMovementType: 'crane_up', transitionToNext: 'fade_to_black', baseDuration: 3, purpose: 'Aftermath' },
  ],
  dramatic: [
    { cameraPosition: 'birds_eye', cameraMovementType: 'slow_zoom', transitionToNext: 'dissolve', baseDuration: 5, purpose: 'God\'s eye opening' },
    { cameraPosition: 'wide_establishing', cameraMovementType: 'crane_down', transitionToNext: 'dissolve', baseDuration: 4, purpose: 'Descending into the scene' },
    { cameraPosition: 'medium', cameraMovementType: 'orbit_left', transitionToNext: 'dissolve', baseDuration: 4, purpose: 'Circling the subject' },
    { cameraPosition: 'extreme_close_up', cameraMovementType: 'static', transitionToNext: 'match_cut', baseDuration: 3, purpose: 'Critical detail' },
    { cameraPosition: 'close_up', cameraMovementType: 'pull_back', transitionToNext: 'crossfade', baseDuration: 4, purpose: 'Emotional reveal' },
    { cameraPosition: 'high_angle', cameraMovementType: 'crane_up', transitionToNext: 'dissolve', baseDuration: 4, purpose: 'Scale and consequence' },
    { cameraPosition: 'wide_establishing', cameraMovementType: 'slow_zoom', transitionToNext: 'fade_to_black', baseDuration: 5, purpose: 'Cinematic close' },
  ],
};

// ─── Pacing Detection ─────────────────────────────────────────────

const PACING_PATTERNS: Record<PacingStyle, RegExp[]> = {
  fast: [
    /\b(chase|fight|explosion|crash|rush|race|sprint|attack|battle|escape|chaos)\b/i,
    /\b(action|thriller|intense|fast|quick|rapid|urgent)\b/i,
  ],
  dramatic: [
    /\b(reveal|secret|betrayal|sacrifice|death|loss|discovery|twist|epic)\b/i,
    /\b(drama|dramatic|emotional|profound|tragic|powerful|climax)\b/i,
  ],
  slow: [
    /\b(peaceful|serene|calm|quiet|gentle|meditat|contemplat|sunset|sunrise|dawn|dusk)\b/i,
    /\b(ambient|atmospheric|dreamy|ethereal|tranquil|still)\b/i,
  ],
  medium: [],
};

export function detectPacing(prompt: string): PacingStyle {
  for (const pacing of ['fast', 'dramatic', 'slow'] as PacingStyle[]) {
    if (PACING_PATTERNS[pacing].some(p => p.test(prompt))) {
      return pacing;
    }
  }
  return 'medium';
}

// ─── Mood Detection ───────────────────────────────────────────────

const MOOD_MAP: Record<string, RegExp> = {
  mysterious: /\b(mystery|secret|hidden|fog|shadow|enigma|unknown)\b/i,
  joyful: /\b(happy|joy|celebrate|bright|sunshine|laugh|cheerful|festival)\b/i,
  tense: /\b(danger|threat|suspense|tense|nervous|fear|anxiety)\b/i,
  romantic: /\b(love|romance|kiss|heart|passion|tender|intimate)\b/i,
  melancholic: /\b(sad|lonely|rain|grey|loss|memory|nostalgia|wistful)\b/i,
  epic: /\b(grand|vast|mountain|ocean|cosmos|universe|ancient|legendary)\b/i,
  whimsical: /\b(fantasy|magic|fairy|dream|enchant|wonder|playful)\b/i,
  dark: /\b(dark|night|horror|grim|sinister|ominous|haunted)\b/i,
  cinematic: /./i, // Default fallback
};

export function detectMood(prompt: string): string {
  for (const [mood, pattern] of Object.entries(MOOD_MAP)) {
    if (mood !== 'cinematic' && pattern.test(prompt)) {
      return mood;
    }
  }
  return 'cinematic';
}

// ─── Storyboard Builder ───────────────────────────────────────────

export interface StoryboardConfig {
  prompt: string;
  aspectRatio?: string;
  pacingOverride?: PacingStyle;
  minShots?: number;
  maxShots?: number;
  /** Reference assets for creative context */
  referenceContext?: string;
}

/**
 * Build a cinematic storyboard from a text prompt.
 * This is the CLIENT-SIDE fallback when the edge function is unavailable.
 * The edge function version will produce richer descriptions using the AI model.
 */
export function buildClientStoryboard(config: StoryboardConfig): CinematicStoryboard {
  const {
    prompt,
    aspectRatio = '16:9',
    pacingOverride,
    minShots = 5,
    maxShots = 8,
    referenceContext,
  } = config;

  const pacing = pacingOverride || detectPacing(prompt);
  const mood = detectMood(prompt);
  const templates = SHOT_PATTERNS[pacing];

  // Ensure we have at least minShots
  const shotCount = Math.max(minShots, Math.min(maxShots, templates.length));
  const selectedTemplates = templates.slice(0, shotCount);

  const shots: CinematicShot[] = selectedTemplates.map((template, i) => ({
    shotNumber: i + 1,
    description: `${template.purpose}: ${prompt}`,
    cameraMotion: template.cameraMovementType.replace(/_/g, ' '),
    duration: template.baseDuration,
    aspectRatio,
    mood,
    imagePrompt: buildImagePrompt(prompt, template, mood, aspectRatio, i, referenceContext),
    cameraPosition: template.cameraPosition,
    cameraMovementType: template.cameraMovementType,
    subjectContinuity: `Maintain primary subject from prompt: "${prompt.slice(0, 80)}"`,
    lightingContinuity: inferLighting(prompt, mood),
    motionIntent: template.purpose,
    transitionToNext: template.transitionToNext,
    environment: inferEnvironment(prompt),
    audioCue: inferAudioCue(template.purpose, mood),
  }));

  return {
    title: generateTitle(prompt),
    logline: `A cinematic exploration: ${prompt.slice(0, 120)}`,
    shots,
    overallMood: mood,
    colorPalette: inferColorPalette(mood),
    audioDirection: `${mood} cinematic score with environmental ambience`,
  };
}

// ─── Helper Functions ─────────────────────────────────────────────

function buildImagePrompt(
  userPrompt: string,
  template: ShotTemplate,
  mood: string,
  aspectRatio: string,
  shotIndex: number,
  referenceContext?: string,
): string {
  const parts = [
    userPrompt,
    `Camera: ${template.cameraPosition.replace(/_/g, ' ')} shot.`,
    `Movement: ${template.cameraMovementType.replace(/_/g, ' ')}.`,
    `Mood: ${mood}.`,
    `Purpose: ${template.purpose}.`,
    `Cinematic quality, professional lighting, depth of field.`,
    `Aspect ratio: ${aspectRatio}.`,
  ];

  if (referenceContext) {
    parts.push(referenceContext);
  }

  return parts.join(' ');
}

function inferLighting(prompt: string, mood: string): string {
  if (/sunset|golden.?hour|warm/i.test(prompt)) return 'Golden hour warm lighting';
  if (/night|dark|moon/i.test(prompt)) return 'Low-key moonlit atmosphere';
  if (/studio|portrait/i.test(prompt)) return 'Studio three-point lighting';
  if (/neon|cyber|future/i.test(prompt)) return 'Neon-lit volumetric atmosphere';

  const moodLighting: Record<string, string> = {
    mysterious: 'Low-key chiaroscuro with rim lighting',
    joyful: 'Bright natural daylight with soft fill',
    tense: 'Hard shadows with high contrast',
    romantic: 'Soft golden backlight with bokeh',
    melancholic: 'Overcast diffused light with cool tones',
    epic: 'Dramatic god rays with atmospheric haze',
    whimsical: 'Dappled light through foliage',
    dark: 'Deep shadows with single practical source',
    cinematic: 'Three-point cinematic setup with motivated practicals',
  };

  return moodLighting[mood] || moodLighting.cinematic;
}

function inferEnvironment(prompt: string): string {
  if (/city|urban|street|building/i.test(prompt)) return 'Urban cityscape environment';
  if (/forest|tree|nature|jungle/i.test(prompt)) return 'Natural forest environment';
  if (/ocean|sea|beach|water/i.test(prompt)) return 'Coastal/ocean environment';
  if (/space|star|planet|cosmos/i.test(prompt)) return 'Outer space environment';
  if (/desert|sand|dune/i.test(prompt)) return 'Desert landscape environment';
  if (/mountain|peak|summit/i.test(prompt)) return 'Mountain environment';
  if (/interior|room|house|office/i.test(prompt)) return 'Interior environment';
  return 'Environment derived from scene context';
}

function inferAudioCue(purpose: string, mood: string): string {
  if (purpose.includes('Establishing')) return `Ambient ${mood} score begins softly`;
  if (purpose.includes('Emotional') || purpose.includes('Intimate')) return 'Piano or strings swell';
  if (purpose.includes('Impact') || purpose.includes('Critical')) return 'Sharp percussive hit';
  if (purpose.includes('Resolution') || purpose.includes('close')) return 'Score resolves to tonic';
  if (purpose.includes('Action') || purpose.includes('Dynamic')) return 'Rhythmic percussive build';
  return `${mood} ambient underscore`;
}

function inferColorPalette(mood: string): string {
  const palettes: Record<string, string> = {
    mysterious: 'Deep blues, purples, silver accents',
    joyful: 'Warm yellows, oranges, sky blues',
    tense: 'Desaturated grays, cold whites, red accents',
    romantic: 'Soft pinks, warm golds, ivory',
    melancholic: 'Muted blues, grays, faded greens',
    epic: 'Rich golds, deep navy, crimson',
    whimsical: 'Pastel rainbow, soft greens, lavender',
    dark: 'Black, deep red, cold steel blue',
    cinematic: 'Teal and orange, balanced warm/cool',
  };
  return palettes[mood] || palettes.cinematic;
}

function generateTitle(prompt: string): string {
  // Extract first meaningful phrase
  const words = prompt.split(/\s+/).slice(0, 6);
  if (words.length <= 3) return prompt;
  return words.join(' ') + '...';
}

// ─── Output Labels (TRUTH CONTRACT) ──────────────────────────────

/** These are the ONLY acceptable output labels for Lucy Cinema */
export const CINEMA_OUTPUT_LABELS = {
  storyboard: 'Cinematic storyboard preview' as const,
  sequence: 'Keyframe-based cinematic sequence' as const,
  disclaimer: 'Storyboard-first keyframe generation · Not real video — cinematic storyboard playback' as const,
} as const;

export type CinemaOutputLabel = typeof CINEMA_OUTPUT_LABELS[keyof typeof CINEMA_OUTPUT_LABELS];
