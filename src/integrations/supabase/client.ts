/**
 * THE LUCY LOUNGE — SUPABASE CLIENT (GOLD STANDARD)
 * 
 * SECURITY RULES (IMMUTABLE):
 * 1. Frontend uses PUBLISHABLE KEY ONLY (VITE_SUPABASE_ANON_KEY)
 * 2. NO hardcoded keys, NO fallbacks
 * 3. FAIL-FAST if environment is misconfigured
 * 4. service_role keys are SERVER-ONLY (Edge Functions)
 * 
 * @see /docs/REGRESSION_PACT.md
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENVIRONMENT VALIDATION (FAIL-FAST)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate at module load time — crash immediately if misconfigured
function validateEnvironment(): void {
  const errors: string[] = [];

  if (!SUPABASE_URL || typeof SUPABASE_URL !== 'string' || SUPABASE_URL.trim() === '') {
    errors.push('VITE_SUPABASE_URL is missing or empty');
  }

  if (!SUPABASE_ANON_KEY || typeof SUPABASE_ANON_KEY !== 'string' || SUPABASE_ANON_KEY.trim() === '') {
    errors.push('VITE_SUPABASE_ANON_KEY is missing or empty');
  }

  // Block any service_role key from frontend (security gate)
  if (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.includes('service_role')) {
    errors.push('CRITICAL: service_role key detected in frontend — this is a security violation');
  }

  if (errors.length > 0) {
    const errorMessage = [
      '╔══════════════════════════════════════════════════════════════╗',
      '║  LUCY LOUNGE — ENVIRONMENT CONFIGURATION ERROR              ║',
      '╠══════════════════════════════════════════════════════════════╣',
      ...errors.map(e => `║  ✗ ${e.padEnd(57)}║`),
      '╠══════════════════════════════════════════════════════════════╣',
      '║  The app cannot start without proper Supabase configuration.║',
      '║  Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env   ║',
      '╚══════════════════════════════════════════════════════════════╝',
    ].join('\n');

    console.error(errorMessage);
    throw new Error(`Supabase configuration invalid: ${errors.join('; ')}`);
  }
}

// Run validation immediately
validateEnvironment();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLIENT INITIALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL!,
  SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Export URL for edge function calls (safe — this is public)
export const SUPABASE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;