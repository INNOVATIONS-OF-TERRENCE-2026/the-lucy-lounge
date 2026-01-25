/**
 * THE LUCY LOUNGE — SUPABASE ENVIRONMENT GUARD
 * 
 * Validates Supabase configuration at React runtime (not module load).
 * This allows RootErrorBoundary to catch and display configuration errors
 * instead of causing a white screen.
 * 
 * SECURITY RULES (IMMUTABLE):
 * 1. Frontend uses PUBLISHABLE KEY ONLY
 * 2. NO hardcoded keys, NO fallback values
 * 3. FAIL-FAST if environment is misconfigured
 * 4. service_role keys are SERVER-ONLY (Edge Functions)
 * 
 * @see /docs/REGRESSION_PACT.md
 */
import { useEffect, useState, ReactNode } from 'react';

interface SupabaseGuardProps {
  children: ReactNode;
}

/**
 * Validates Supabase environment configuration.
 * Throws an error if configuration is invalid (caught by RootErrorBoundary).
 */
function validateSupabaseEnvironment(): void {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = 
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
    import.meta.env.VITE_SUPABASE_ANON_KEY;

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
    // Console log for debugging (no secrets exposed)
    console.error(
      '\n╔══════════════════════════════════════════════════════════════════╗\n' +
      '║  THE LUCY LOUNGE — ENVIRONMENT CONFIGURATION ERROR              ║\n' +
      '╠══════════════════════════════════════════════════════════════════╣\n' +
      errors.map(e => `║  ✗ ${e.substring(0, 62).padEnd(62)}║`).join('\n') + '\n' +
      '╠══════════════════════════════════════════════════════════════════╣\n' +
      '║  The app cannot start without proper Supabase configuration.    ║\n' +
      '╚══════════════════════════════════════════════════════════════════╝\n'
    );

    throw new Error(`Supabase configuration invalid: ${errors.join('; ')}`);
  }
}

/**
 * SupabaseGuard - Validates environment configuration at React runtime.
 * 
 * This component performs fail-fast validation but defers it to React's
 * rendering phase so RootErrorBoundary can catch and display errors.
 */
export function SupabaseGuard({ children }: SupabaseGuardProps): ReactNode {
  const [validated, setValidated] = useState(false);

  // Validate on first render (synchronously, before children mount)
  if (!validated) {
    validateSupabaseEnvironment();
    // If we reach here, validation passed
  }

  useEffect(() => {
    // Mark as validated after initial render
    setValidated(true);
  }, []);

  return <>{children}</>;
}

export default SupabaseGuard;
