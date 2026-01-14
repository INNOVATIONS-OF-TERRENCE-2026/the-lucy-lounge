export function detectCinematicIntent(message: string): boolean {
  return /video|cinematic|movie|scene|cutscene/i.test(message);
}
