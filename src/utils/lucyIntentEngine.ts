/* =========================================================
   Lucy Intent Engine
   Purpose: Detect image-generation intent from human language
   Runs: Client-safe (NO secrets)
   ========================================================= */

export type LucyIntent =
  | { type: "image"; confidence: number; refinedPrompt: string }
  | { type: "chat"; confidence: number };

const IMAGE_VERBS = [
  "draw",
  "generate",
  "create",
  "make",
  "design",
  "render",
  "paint",
  "illustrate",
  "show me",
  "imagine",
  "visualize",
  "picture",
  "build an image of",
  "create an image of",
  "generate an image of",
];

const IMAGE_NOUNS = [
  "image",
  "picture",
  "photo",
  "art",
  "illustration",
  "render",
  "scene",
  "portrait",
  "wallpaper",
  "logo",
  "cover",
  "thumbnail",
  "diagram",
  "infographic",
];

const STYLE_TOKENS = [
  "photorealistic",
  "cinematic",
  "4k",
  "8k",
  "ultra realistic",
  "anime",
  "oil painting",
  "watercolor",
  "digital art",
  "concept art",
  "studio lighting",
  "depth of field",
  "bokeh",
  "wide angle",
];

const QUICK_COMMANDS = [
  "image:",
  "img:",
  "/image",
  "/img",
  "/generate",
  "/draw",
];

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function scoreIntent(input: string): number {
  let score = 0;
  const text = normalize(input);

  IMAGE_VERBS.forEach(v => text.includes(v) && (score += 0.25));
  IMAGE_NOUNS.forEach(n => text.includes(n) && (score += 0.2));
  STYLE_TOKENS.forEach(s => text.includes(s) && (score += 0.15));
  QUICK_COMMANDS.forEach(c => text.startsWith(c) && (score += 0.6));

  if (text.length < 40) score += 0.15; // humans often keep image prompts short
  if (text.includes(",")) score += 0.1; // descriptive clauses

  return Math.min(score, 1);
}

function refinePrompt(input: string): string {
  return input
    .replace(/^\/(image|img|generate|draw)\s*/i, "")
    .replace(/^image:\s*/i, "")
    .trim();
}

export function lucyIntentEngine(input: string): LucyIntent {
  const confidence = scoreIntent(input);

  if (confidence >= 0.55) {
    return {
      type: "image",
      confidence,
      refinedPrompt: refinePrompt(input),
    };
  }

  return {
    type: "chat",
    confidence: 1 - confidence,
  };
}
