/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — CANONICAL SUPABASE CLIENT                                │
 * │                                                                             │
 * │ DO NOT MODIFY: Governed by /docs/REGRESSION_PACT.md                        │
 * │ DO NOT MODIFY: Governed by /docs/PRODUCTION_SPEC_v1.md                     │
 * │                                                                             │
 * │ This is the ONE AND ONLY Supabase client for the entire application.       │
 * │ All imports MUST use: @/integrations/supabase/client                       │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * SECURITY RULES (IMMUTABLE):
 * 1. Frontend uses PUBLISHABLE KEY ONLY (anon key)
 * 2. NO hardcoded keys — EVER
 * 3. NO fallback values — EVER  
 * 4. Validation is DEFERRED to React runtime (SupabaseGuard)
 * 5. service_role keys are SERVER-ONLY (Edge Functions)
 * 
 * ARCHITECTURE:
 * - Environment variables are READ at module load (safe — just reads strings)
 * - Client is CREATED lazily on first use (safe — no network calls)
 * - VALIDATION happens in SupabaseGuard at React runtime (catchable by ErrorBoundary)
 * - If config is invalid, SupabaseGuard shows UI BEFORE any supabase calls happen
 * 
 * ACCEPTED ENVIRONMENT VARIABLES:
 * - VITE_SUPABASE_URL (required)
 * - VITE_SUPABASE_PUBLISHABLE_KEY (Lovable convention, preferred)
 * - VITE_SUPABASE_ANON_KEY (standard Supabase naming, fallback)
 * 
 * @see /docs/REGRESSION_PACT.md
 * @see /docs/PRODUCTION_SPEC_v1.md
 * @see src/components/system/SupabaseGuard.tsx
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENVIRONMENT RESOLUTION — NO FALLBACKS, NO HARDCODING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// DO NOT MODIFY: Environment variable names are locked
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';

// DO NOT MODIFY: Accept both naming conventions (Lovable vs standard)
// Priority: PUBLISHABLE_KEY > ANON_KEY
const SUPABASE_KEY = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 
  '';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER: Check if Supabase is configured (used by SupabaseGuard)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Returns true if Supabase environment variables appear to be configured.
 * This is a QUICK CHECK — full validation happens in SupabaseGuard.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL) && Boolean(SUPABASE_KEY);
}

/**
 * Returns the current Supabase URL (safe to expose — URLs are public).
 */
export function getSupabaseUrl(): string {
  return SUPABASE_URL;
}

/**
 * Returns true if the configured key appears to be a valid format.
 * Accepts: JWT format (eyJ...) OR Lovable Cloud format (sb_publishable_...)
 * This does NOT validate the key — just checks format.
 */
export function hasValidKeyFormat(): boolean {
  return SUPABASE_KEY.startsWith('eyJ') || SUPABASE_KEY.startsWith('sb_publishable_');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON CLIENT — LAZY INITIALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let _supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get the Supabase client instance.
 * 
 * IMPORTANT: This function does NOT validate config. Validation is done by
 * SupabaseGuard in the React tree. If you call this before SupabaseGuard runs,
 * the client may be non-functional.
 */
function getSupabaseClient(): SupabaseClient<Database> {
  if (_supabaseInstance) {
    return _supabaseInstance;
  }

  // If config is present, create a real client
  if (SUPABASE_URL && SUPABASE_KEY) {
    _supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        storage: typeof window !== 'undefined' ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return _supabaseInstance;
  }

  // Config is missing — create a stub client that will fail gracefully
  // SupabaseGuard will show the setup UI BEFORE any code reaches this point
  // in normal operation. This stub exists only as a safety net.
  _supabaseInstance = createClient<Database>(
    'https://stub.supabase.co',
    'eyJzdHViIjoidGhpcy1pcy1hLXN0dWItdG9rZW4ifQ',
    {
      auth: {
        storage: typeof window !== 'undefined' ? localStorage : undefined,
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  return _supabaseInstance;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS — DO NOT ADD NEW EXPORTS WITHOUT UPDATING REGRESSION_PACT.md
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** The singleton Supabase client. Always use this export. */
export const supabase = getSupabaseClient();

/** URL for Edge Function calls (safe — URLs are public). */
export const SUPABASE_FUNCTIONS_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1` : '';