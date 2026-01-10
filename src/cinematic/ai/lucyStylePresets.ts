// Lucy Cinematic Style Presets
// Deterministic prompt injection blocks for different visual styles

import type { StylePreset } from '../types/cinematic.types';

export const stylePresets: Record<string, StylePreset> = {
  cinematic: {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Hollywood-grade film aesthetic with dramatic lighting',
    promptInjection: 'cinematic lighting, film grain, anamorphic lens flare, professional color grading, 35mm film aesthetic, shallow depth of field, dramatic shadows',
    cameraDefaults: 'wide angle, dolly movement, slow pan',
    lightingDefaults: 'golden hour lighting, volumetric rays, rim lighting',
    colorGrading: 'teal and orange, high contrast, rich blacks',
    moodKeywords: ['epic', 'dramatic', 'professional', 'film'],
  },
  
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon-drenched futuristic cityscape aesthetic',
    promptInjection: 'neon lights, rain-slicked streets, holographic advertisements, futuristic city, blade runner aesthetic, magenta and cyan lighting, high tech low life',
    cameraDefaults: 'low angle, dutch tilt, tracking shot',
    lightingDefaults: 'neon glow, reflective surfaces, fog atmosphere',
    colorGrading: 'deep blues, hot pink, electric cyan, crushed blacks',
    moodKeywords: ['futuristic', 'noir', 'gritty', 'neon'],
  },
  
  luxury: {
    id: 'luxury',
    name: 'Luxury',
    description: 'High-end premium brand aesthetic',
    promptInjection: 'luxury lifestyle, elegant composition, premium materials, gold accents, sophisticated lighting, minimalist design, opulent atmosphere',
    cameraDefaults: 'smooth glide, slow zoom, orbital movement',
    lightingDefaults: 'soft diffused lighting, highlight specular, warm ambient',
    colorGrading: 'rich golds, deep blacks, warm neutrals, creamy highlights',
    moodKeywords: ['premium', 'elegant', 'sophisticated', 'wealthy'],
  },
  
  anime: {
    id: 'anime',
    name: 'Anime',
    description: 'Japanese animation inspired aesthetic',
    promptInjection: 'anime style, vibrant colors, dynamic action lines, expressive characters, cel shading, Japanese animation aesthetic, dramatic poses',
    cameraDefaults: 'dynamic angles, speed lines, zoom burst',
    lightingDefaults: 'flat lighting with dramatic shadows, backlit silhouettes',
    colorGrading: 'saturated colors, clean whites, bold primaries',
    moodKeywords: ['dynamic', 'expressive', 'colorful', 'energetic'],
  },
  
  cartoon: {
    id: 'cartoon',
    name: 'Cartoon',
    description: 'Stylized animated look with bold shapes',
    promptInjection: 'cartoon style, bold outlines, exaggerated proportions, playful design, bright colors, smooth animation, family friendly aesthetic',
    cameraDefaults: 'bouncy movement, comedic timing, whip pan',
    lightingDefaults: 'bright even lighting, soft shadows, cheerful atmosphere',
    colorGrading: 'bright saturated colors, playful palette, clean whites',
    moodKeywords: ['fun', 'playful', 'friendly', 'colorful'],
  },
  
  realism: {
    id: 'realism',
    name: 'Photorealistic',
    description: 'Ultra-realistic visual fidelity',
    promptInjection: 'photorealistic, hyper detailed, 8K resolution, physically accurate lighting, natural textures, lifelike rendering, real world accuracy',
    cameraDefaults: 'natural camera movement, documentary style, handheld',
    lightingDefaults: 'natural lighting, global illumination, realistic shadows',
    colorGrading: 'natural colors, film-accurate tones, subtle grading',
    moodKeywords: ['realistic', 'authentic', 'natural', 'detailed'],
  },
  
  advertisement: {
    id: 'advertisement',
    name: 'Advertisement',
    description: 'Commercial-grade product and brand visuals',
    promptInjection: 'commercial quality, product showcase, clean composition, professional studio lighting, brand-friendly aesthetic, high production value, call to action ready',
    cameraDefaults: 'smooth orbit, hero reveal, product focus',
    lightingDefaults: 'studio lighting, key light with fill, product highlights',
    colorGrading: 'clean and punchy, brand-appropriate colors, vibrant',
    moodKeywords: ['commercial', 'professional', 'selling', 'engaging'],
  },
  
  horror: {
    id: 'horror',
    name: 'Horror',
    description: 'Dark and unsettling atmospheric visuals',
    promptInjection: 'horror atmosphere, dark shadows, unsettling composition, eerie lighting, ominous mood, psychological tension, creepy aesthetic',
    cameraDefaults: 'slow creeping movement, static tension, sudden cuts',
    lightingDefaults: 'low key lighting, harsh shadows, dim ambient',
    colorGrading: 'desaturated, cold blues, sickly greens, deep blacks',
    moodKeywords: ['scary', 'dark', 'tense', 'unsettling'],
  },
  
  documentary: {
    id: 'documentary',
    name: 'Documentary',
    description: 'Authentic and informative visual style',
    promptInjection: 'documentary style, authentic footage, natural lighting, journalistic approach, real-world setting, informative composition, genuine atmosphere',
    cameraDefaults: 'handheld, observational, natural framing',
    lightingDefaults: 'available light, natural environment, practical sources',
    colorGrading: 'natural tones, subtle processing, authentic colors',
    moodKeywords: ['authentic', 'real', 'informative', 'natural'],
  },
  
  scifi: {
    id: 'scifi',
    name: 'Sci-Fi',
    description: 'Futuristic science fiction aesthetic',
    promptInjection: 'science fiction, futuristic technology, space aesthetic, advanced civilization, sleek design, holographic interfaces, otherworldly environment',
    cameraDefaults: 'sweeping wide shots, scale emphasis, smooth tracking',
    lightingDefaults: 'cool technological lighting, ambient glow, lens flares',
    colorGrading: 'cool blues, chrome highlights, deep space blacks',
    moodKeywords: ['futuristic', 'technological', 'space', 'advanced'],
  },
};

export const getStylePreset = (presetId: string): StylePreset => {
  return stylePresets[presetId] || stylePresets.cinematic;
};

export const getAllPresets = (): StylePreset[] => {
  return Object.values(stylePresets);
};

export const getPresetsByMood = (mood: string): StylePreset[] => {
  const lowerMood = mood.toLowerCase();
  return Object.values(stylePresets).filter(preset => 
    preset.moodKeywords.some(keyword => 
      keyword.toLowerCase().includes(lowerMood) || lowerMood.includes(keyword.toLowerCase())
    )
  );
};
