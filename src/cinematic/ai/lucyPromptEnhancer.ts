// Lucy Cinematic Prompt Enhancer
// Transforms raw user prompts into detailed cinematic descriptions

import { getStylePreset } from './lucyStylePresets';

interface EnhancementOptions {
  stylePreset: string;
  duration: number;
  aspectRatio: string;
  includeAudio?: boolean;
  targetPlatform?: string;
}

interface EnhancedPrompt {
  enhanced: string;
  cameraDirection: string;
  lightingNotes: string;
  audioSuggestions: string;
  technicalSpecs: string;
}

// Cinematic grammar elements
const cameraMovements = [
  'slow dolly in',
  'smooth tracking shot',
  'orbital pan',
  'gentle crane up',
  'steady push forward',
  'elegant glide',
  'slow zoom',
  'parallax movement',
];

const lightingDescriptors = [
  'volumetric rays',
  'rim lighting accent',
  'soft diffused key light',
  'dramatic chiaroscuro',
  'golden hour warmth',
  'cool ambient fill',
  'practical lighting sources',
  'atmospheric haze',
];

const lensStyles = [
  'shallow depth of field',
  'anamorphic bokeh',
  'wide angle perspective',
  'telephoto compression',
  'macro detail shots',
  'split diopter focus',
];

const compositionRules = [
  'rule of thirds framing',
  'leading lines composition',
  'symmetrical balance',
  'negative space emphasis',
  'foreground interest',
  'layered depth planes',
];

const motionQualities = [
  'smooth fluid motion',
  'dynamic energy',
  'contemplative pacing',
  'rhythmic movement',
  'graceful flow',
  'purposeful trajectory',
];

const moodEnhancers = [
  'atmospheric depth',
  'emotional resonance',
  'visual poetry',
  'sensory immersion',
  'narrative tension',
  'aesthetic harmony',
];

// Select random element from array (deterministic based on prompt hash)
function selectFromArray<T>(arr: T[], seed: string, index: number = 0): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char + index;
    hash = hash & hash;
  }
  return arr[Math.abs(hash) % arr.length];
}

export function enhancePrompt(
  rawPrompt: string,
  options: EnhancementOptions
): EnhancedPrompt {
  const preset = getStylePreset(options.stylePreset);
  
  // Build camera direction
  const camera = selectFromArray(cameraMovements, rawPrompt, 1);
  const lens = selectFromArray(lensStyles, rawPrompt, 2);
  const composition = selectFromArray(compositionRules, rawPrompt, 3);
  
  const cameraDirection = `${camera}, ${lens}, ${composition}, ${preset.cameraDefaults}`;
  
  // Build lighting notes
  const lighting1 = selectFromArray(lightingDescriptors, rawPrompt, 4);
  const lighting2 = selectFromArray(lightingDescriptors, rawPrompt, 5);
  
  const lightingNotes = `${lighting1}, ${lighting2}, ${preset.lightingDefaults}`;
  
  // Build motion and mood
  const motion = selectFromArray(motionQualities, rawPrompt, 6);
  const mood = selectFromArray(moodEnhancers, rawPrompt, 7);
  
  // Technical specs based on aspect ratio
  const aspectSpecs: Record<string, string> = {
    '16:9': 'widescreen cinematic format, horizontal composition',
    '9:16': 'vertical mobile format, portrait composition, social media optimized',
    '1:1': 'square format, centered composition, instagram optimized',
    '4:5': 'portrait format, vertical emphasis, mobile friendly',
    '21:9': 'ultra-wide cinematic format, epic horizontal scope',
  };
  
  const technicalSpecs = `${aspectSpecs[options.aspectRatio] || aspectSpecs['16:9']}, ${options.duration} seconds duration, high quality render`;
  
  // Build audio suggestions
  const audioSuggestions = options.includeAudio
    ? `ambient soundscape, ${preset.moodKeywords.join(' ')} music, subtle sound design`
    : 'silent/music only';
  
  // Compose the enhanced prompt
  const enhancedParts = [
    rawPrompt,
    preset.promptInjection,
    cameraDirection,
    lightingNotes,
    motion,
    mood,
    preset.colorGrading,
    technicalSpecs,
  ];
  
  const enhanced = enhancedParts.join(', ');
  
  return {
    enhanced,
    cameraDirection,
    lightingNotes,
    audioSuggestions,
    technicalSpecs,
  };
}

// Quick enhance for simple use cases
export function quickEnhance(rawPrompt: string, stylePreset: string = 'cinematic'): string {
  const result = enhancePrompt(rawPrompt, {
    stylePreset,
    duration: 5,
    aspectRatio: '16:9',
  });
  return result.enhanced;
}

// Platform-specific enhancement
export function enhanceForPlatform(
  rawPrompt: string,
  platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'facebook'
): EnhancedPrompt {
  const platformConfigs: Record<string, EnhancementOptions> = {
    tiktok: { stylePreset: 'advertisement', duration: 15, aspectRatio: '9:16', targetPlatform: 'tiktok' },
    instagram: { stylePreset: 'luxury', duration: 30, aspectRatio: '9:16', targetPlatform: 'instagram' },
    youtube: { stylePreset: 'cinematic', duration: 60, aspectRatio: '16:9', targetPlatform: 'youtube' },
    twitter: { stylePreset: 'advertisement', duration: 15, aspectRatio: '16:9', targetPlatform: 'twitter' },
    facebook: { stylePreset: 'advertisement', duration: 30, aspectRatio: '9:16', targetPlatform: 'facebook' },
  };
  
  return enhancePrompt(rawPrompt, platformConfigs[platform] || platformConfigs.youtube);
}

// Ad-specific enhancement with hook and CTA
export function enhanceForAd(
  rawPrompt: string,
  hookText: string,
  ctaText: string
): EnhancedPrompt {
  const adPrompt = `${hookText} - ${rawPrompt} - ${ctaText}, attention grabbing, scroll stopping visual, high engagement composition`;
  
  return enhancePrompt(adPrompt, {
    stylePreset: 'advertisement',
    duration: 15,
    aspectRatio: '9:16',
    targetPlatform: 'ad',
  });
}
