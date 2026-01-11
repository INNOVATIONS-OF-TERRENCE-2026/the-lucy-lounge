export type LucyIntentResult =
  | { type: "cinematic_video"; tool: "generate_video" }
  | { type: "cinematic_image"; tool: "generate_image" }
  | { type: "none" };

export function detectLucyIntent(message: string): LucyIntentResult {
  const cinematic =
    /video|cinematic|movie|scene|cutscene|reel|short/i.test(message);

  if (cinematic) {
    return {
      type: "cinematic_video",
      tool: "generate_video",
    };
  }

  const imageIntent = /image|picture|photo|generate.*image|create.*image|draw|illustrate/i.test(message);
  if (imageIntent) {
    return {
      type: "cinematic_image",
      tool: "generate_image",
    };
  }

  return { type: "none" };
}

// 🎬 CINEMATIC INTENT DETECTION (used by ChatInterface)
export function detectCinematicIntent(message: string): boolean {
  return /video|cinematic|movie|scene|cutscene|reel|short/i.test(message);
}

// 🖼️ IMAGE INTENT DETECTION
export function detectImageIntent(message: string): boolean {
  return /image|picture|photo|generate.*image|create.*image|draw|illustrate/i.test(message);
}
