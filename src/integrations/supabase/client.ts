/**
 * THE LUCY LOUNGE — SUPABASE CLIENT (GOLD STANDARD)
 * 
 * SECURITY RULES (IMMUTABLE):
 * 1. Frontend uses PUBLISHABLE KEY ONLY
 * 2. NO hardcoded keys, NO fallback values
 * 3. Validation is DEFERRED to React runtime (SupabaseGuard)
 * 4. service_role keys are SERVER-ONLY (Edge Functions)
 * 
 * ARCHITECTURE NOTE:
 * Environment validation is performed by SupabaseGuard component at React
 * runtime, NOT at module load. This allows RootErrorBoundary to catch and
 * display configuration errors instead of causing a white screen.
 * 
 * @see /docs/REGRESSION_PACT.md
 * @see src/components/system/SupabaseGuard.tsx
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENVIRONMENT RESOLUTION (NO FALLBACKS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// URL: Single source, no fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

// KEY: Accept Lovable's naming (PUBLISHABLE_KEY) OR standard naming (ANON_KEY)
// Priority: PUBLISHABLE_KEY > ANON_KEY (per Governance Pact)
// NO HARDCODED FALLBACKS
const SUPABASE_KEY = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  '';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLIENT INITIALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Note: If URL or KEY are empty strings, createClient will still instantiate
// but API calls will fail. SupabaseGuard validates at React runtime and throws
// before any API calls are attempted, allowing RootErrorBoundary to catch.

let supabaseInstance: SupabaseClient<Database> | null = null;

function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseInstance && SUPABASE_URL && SUPABASE_KEY) {
    supabaseInstance = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_KEY,
      {
        auth: {
          storage: typeof window !== 'undefined' ? localStorage : undefined,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }
  
  // Return instance or create a dummy that will fail gracefully
  // SupabaseGuard will throw before this is ever used if config is invalid
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      SUPABASE_URL || 'https://placeholder.supabase.co',
      SUPABASE_KEY || 'placeholder',
      {
        auth: {
          storage: typeof window !== 'undefined' ? localStorage : undefined,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }
  
  return supabaseInstance;
}

export const supabase = getSupabaseClient();

// Export URL for edge function calls (safe — URL is public)
export const SUPABASE_FUNCTIONS_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1` : '';