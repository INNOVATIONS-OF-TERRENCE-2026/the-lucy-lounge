// src/utils/lucyIntentRouter.ts

/**
 * Lucy Image Intent Router
 * ------------------------
 * God-tier deterministic intent detection for image generation.
 * Designed to understand how real humans actually speak.
 * No ML. No latency. No ambiguity.
 */

export function isImagePrompt(message: string): boolean {
  if (!message) return false;

  const text = message.toLowerCase().trim();

  // Hard exits for very short non-image messages
  if (text.length < 3) return false;

  /**
   * Explicit image generation commands
   */
  const explicitTriggers = [
    "create an image",
    "generate an image",
    "make an image",
    "draw an image",
    "render an image",
    "design an image",
    "illustration of",
    "image of",
    "picture of",
    "photo of",
    "art of",
  ];

  /**
   * Casual / fast human language
   */
  const casualTriggers = [
    "make me a pic",
    "make a pic",
    "generate pic",
    "generate image",
    "create pic",
    "draw this",
    "draw that",
    "can you draw",
    "can you make",
    "can you generate",
    "show me",
    "let me see",
    "i wanna see",
    "i want to see",
    "i want a picture",
    "i want an image",
  ];

  /**
   * Creative / artistic language
   */
  const artisticTriggers = [
    "illustrate",
    "concept art",
    "character design",
    "cover art",
    "album cover",
    "poster",
    "logo",
    "icon",
    "visual style",
    "scene of",
    "environment of",
    "cinematic",
    "photorealistic",
    "anime style",
    "3d render",
    "oil painting",
    "watercolor",
    "sketch",
    "digital art",
  ];

  /**
   * Implicit / conversational intent
   */
  const implicitTriggers = [
    "what would this look like",
    "what would it look like",
    "how would this look",
    "how would it appear",
    "visualize",
    "imagine",
    "picture this",
    "picture a",
    "imagine a",
    "imagine an",
  ];

  /**
   * Short command patterns (people rushing)
   */
  const shortCommands = [
    "pic",
    "image",
    "img",
    "draw",
    "art",
    "render",
    "visual",
  ];

  /**
   * Guard phrases that usually mean TEXT, not image
   */
  const negativeGuards = [
    "explain",
    "describe",
    "tell me about",
    "write",
    "summarize",
    "list",
    "compare",
    "analyze",
    "why is",
    "how does",
  ];

  // Block false positives
  if (negativeGuards.some(g => text.startsWith(g))) {
    return false;
  }

  // Exact phrase matches
  if (
    explicitTriggers.some(t => text.includes(t)) ||
    casualTriggers.some(t => text.includes(t)) ||
    artisticTriggers.some(t => text.includes(t)) ||
    implicitTriggers.some(t => text.includes(t))
  ) {
    return true;
  }

  // Short command heuristic (single or two words)
  const words = text.split(/\s+/);
  if (words.length <= 3 && shortCommands.some(c => words.includes(c))) {
    return true;
  }

  return false;
}
