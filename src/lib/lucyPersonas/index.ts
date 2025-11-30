/**
 * Lucy Personas - Multi-personality AI system
 * Auto-routing based on keyword detection
 */

import { persona as credit } from './credit';
import { persona as developer } from './developer';
import { persona as realtor } from './realtor';
import { persona as defaultPersona } from './default';

export const PERSONAS = {
  credit,
  developer,
  realtor,
  default: defaultPersona,
} as const;

export type PersonaId = keyof typeof PERSONAS;
export type Persona = typeof defaultPersona;

const personasList = [credit, developer, realtor]; // Ordered by priority

/**
 * Detect which persona to use based on user message content
 */
export function detectPersona(userMessage: string): Persona {
  const lower = userMessage.toLowerCase();

  // Check each specialized persona for keyword matches
  for (const persona of personasList) {
    if (persona.keywords.some((keyword) => lower.includes(keyword.toLowerCase()))) {
      console.log(`[Persona] Detected: ${persona.name}`);
      return persona;
    }
  }

  // Default fallback
  return defaultPersona;
}

/**
 * Get persona by ID
 */
export function getPersonaById(id: string) {
  return PERSONAS[id as PersonaId] || PERSONAS.default;
}

/**
 * Get all available personas
 */
export function getAllPersonas() {
  return Object.values(PERSONAS);
}
