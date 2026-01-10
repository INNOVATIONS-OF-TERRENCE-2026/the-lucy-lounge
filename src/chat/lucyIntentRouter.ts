export type LucyIntentResult =
  | { type: "cinematic_video"; tool: "generate_video" }
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

  return { type: "none" };
}
