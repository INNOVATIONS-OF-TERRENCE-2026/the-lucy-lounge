// src/utils/lucyImageIntent.ts

const IMAGE_VERBS = [
  "draw", "create", "generate", "make", "design", "illustrate",
  "show me", "render", "paint", "imagine", "visualize", "build",
  "give me an image", "picture of", "photo of", "art of"
];

const IMAGE_NOUN_HINTS = [
  "image", "picture", "photo", "artwork", "illustration",
  "poster", "logo", "diagram", "infographic", "scene",
  "background", "wallpaper", "character", "portrait"
];

const STYLE_HINTS = [
  "realistic", "photorealistic", "cinematic", "anime", "3d",
  "isometric", "cyberpunk", "futuristic", "fantasy", "oil painting",
  "watercolor", "sketch", "minimalist", "kawaii", "dark", "moody"
];

export interface ImageIntentResult {
  isImage: boolean;
  prompt: string;
  confidence: number;
}

export function detectLucyImageIntent(input: string): ImageIntentResult {
  const text = input.toLowerCase().trim();

  let score = 0;

  IMAGE_VERBS.forEach(v => {
    if (text.startsWith(v) || text.includes(v)) score += 2;
  });

  IMAGE_NOUN_HINTS.forEach(n => {
    if (text.includes(n)) score += 1.5;
  });

  STYLE_HINTS.forEach(s => {
    if (text.includes(s)) score += 1;
  });

  // Very short fast prompts like: "cyberpunk girl", "ai robot portrait"
  if (text.split(" ").length <= 6) score += 1.5;

  return {
    isImage: score >= 3,
    prompt: input,
    confidence: Math.min(score / 6, 1),
  };
}
