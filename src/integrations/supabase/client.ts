/**
 * THE LUCY LOUNGE — SUPABASE CLIENT (GOLD STANDARD)
 * 
 * SECURITY RULES (IMMUTABLE):
 * 1. Frontend uses PUBLISHABLE KEY ONLY
 * 2. NO hardcoded keys, NO fallback values
 * 3. FAIL-FAST if environment is misconfigured
 * 4. service_role keys are SERVER-ONLY (Edge Functions)
 * 
 * ACCEPTED ENVIRONMENT VARIABLES:
 * - VITE_SUPABASE_URL (required)
 * - VITE_SUPABASE_PUBLISHABLE_KEY (preferred, Lovable convention)
 * - VITE_SUPABASE_ANON_KEY (alternative, standard Supabase naming)
 * 
 * @see /docs/REGRESSION_PACT.md
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENVIRONMENT RESOLUTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// URL: Single source
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// KEY: Accept Lovable's naming (PUBLISHABLE_KEY) OR standard naming (ANON_KEY)
// Priority: PUBLISHABLE_KEY > ANON_KEY (per Governance Pact)
const SUPABASE_KEY = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENVIRONMENT VALIDATION (FAIL-FAST)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function validateEnvironment(): void {
  const errors: string[] = [];

  // Validate URL
  if (!SUPABASE_URL || typeof SUPABASE_URL !== 'string' || SUPABASE_URL.trim() === '') {
    errors.push('VITE_SUPABASE_URL is missing or empty');
  }

  // Validate KEY (either naming convention is acceptable)
  if (!SUPABASE_KEY || typeof SUPABASE_KEY !== 'string' || SUPABASE_KEY.trim() === '') {
    errors.push('VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) is missing or empty');
  }

  // SECURITY GATE: Block service_role keys from frontend
  if (SUPABASE_KEY && SUPABASE_KEY.includes('service_role')) {
    errors.push('CRITICAL: service_role key detected in frontend — this is a security violation');
  }

  // SECURITY GATE: Validate key looks like a JWT (basic format check)
  if (SUPABASE_KEY && !SUPABASE_KEY.startsWith('eyJ')) {
    errors.push('CRITICAL: Key does not appear to be a valid Supabase anon/publishable key');
  }

  if (errors.length > 0) {
    const errorMessage = [
      '',
      '╔══════════════════════════════════════════════════════════════════╗',
      '║  THE LUCY LOUNGE — ENVIRONMENT CONFIGURATION ERROR              ║',
      '╠══════════════════════════════════════════════════════════════════╣',
      ...errors.map(e => `║  ✗ ${e.substring(0, 62).padEnd(62)}║`),
      '╠══════════════════════════════════════════════════════════════════╣',
      '║  The app cannot start without proper Supabase configuration.    ║',
      '║                                                                  ║',
      '║  Required in Lovable Settings → Integrations → Supabase:        ║',
      '║    • VITE_SUPABASE_URL                                          ║',
      '║    • VITE_SUPABASE_PUBLISHABLE_KEY                              ║',
      '╚══════════════════════════════════════════════════════════════════╝',
      '',
    ].join('\n');

    console.error(errorMessage);
    throw new Error(`Supabase configuration invalid: ${errors.join('; ')}`);
  }
}

// Run validation immediately at module load
validateEnvironment();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLIENT INITIALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL!,
  SUPABASE_KEY!,
  {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Export URL for edge function calls (safe — URL is public)
export const SUPABASE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;