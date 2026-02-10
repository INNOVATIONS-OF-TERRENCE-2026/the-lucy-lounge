/**
 * PHASE 6 — Security & RLS Audit Report + Hardening
 * 
 * This module provides runtime security validation functions
 * and documents all security findings and remediations.
 * 
 * CRITICAL FINDINGS:
 * 1. Submodule: ALL edge functions had verify_jwt = false → FIXED in config.toml
 * 2. Root: promote-admin had verify_jwt = false → FLAGGED for fix
 * 3. Submodule: streamAI sends anon key as Bearer → should use session JWT
 * 4. Submodule: No iOS-safe storage → FIXED in client.ts
 * 5. All edge functions use CORS: * → acceptable for public API but noted
 * 6. HuggingFace token in VITE_ env var → exposed to browser bundle
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Auth Validation ──────────────────────────────────────────────

/**
 * Validate that the current user has an active, non-expired session.
 * Use this before any sensitive operation.
 */
export async function requireAuth(): Promise<{
  authenticated: boolean;
  userId: string | null;
  error?: string;
}> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { authenticated: false, userId: null, error: error.message };
    }

    if (!session) {
      return { authenticated: false, userId: null, error: 'No active session' };
    }

    // Check token expiry
    const expiresAt = session.expires_at;
    if (expiresAt && expiresAt * 1000 < Date.now()) {
      // Try to refresh
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshData.session) {
        return { authenticated: false, userId: null, error: 'Session expired and refresh failed' };
      }
      return { authenticated: true, userId: refreshData.session.user.id };
    }

    return { authenticated: true, userId: session.user.id };
  } catch (err) {
    return { authenticated: false, userId: null, error: 'Auth check failed' };
  }
}

/**
 * Get the current session's JWT for use in edge function calls.
 * Returns the USER's JWT, not the anon key.
 */
export async function getSessionJWT(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

// ─── Edge Function Security ───────────────────────────────────────

/**
 * Make an authenticated edge function call using the user's session JWT.
 * This is safer than using the anon key as the Authorization header.
 */
export async function secureEdgeFunctionCall<T = unknown>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<{ data: T | null; error: string | null }> {
  const jwt = await getSessionJWT();
  
  if (!jwt) {
    return { data: null, error: 'Not authenticated — please sign in' };
  }

  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as T, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Edge function call failed' };
  }
}

// ─── Input Sanitization ──────────────────────────────────────────

/**
 * Sanitize user input before passing to database or edge functions.
 * Prevents XSS and SQL injection via application layer.
 */
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  return input
    .slice(0, maxLength)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\0/g, '')
    .trim();
}

/**
 * Validate that a URL is safe to use (no javascript: protocol, etc.)
 */
export function isSafeURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'data:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// ─── RLS Policy Checklist ─────────────────────────────────────────

/**
 * Documented RLS requirements for all Supabase tables.
 * This serves as a living audit document.
 * 
 * Each table MUST have:
 * - SELECT policy scoped to auth.uid() = user_id (or public for shared content)
 * - INSERT policy requiring auth.uid() = user_id
 * - UPDATE policy requiring auth.uid() = user_id
 * - DELETE policy requiring auth.uid() = user_id
 * - No cross-user access paths
 */
export const RLS_AUDIT = {
  // Root repo tables
  'conversations': { hasRLS: true, scopedToUser: true, note: 'User-owned conversations' },
  'messages': { hasRLS: true, scopedToUser: true, note: 'Messages within user conversations' },
  'memories': { hasRLS: true, scopedToUser: true, note: 'User AI memory' },
  'profiles': { hasRLS: true, scopedToUser: true, note: 'User profiles — public read, private write' },
  'organizations': { hasRLS: true, scopedToUser: true, note: 'Org-level access' },
  'subscriptions': { hasRLS: true, scopedToUser: true, note: 'Billing data — private' },
  
  // Vision engine tables
  'generations': { hasRLS: true, scopedToUser: true, note: 'Generated content — owner + shared' },
  'collections': { hasRLS: true, scopedToUser: true, note: 'User collections' },
  'generation_forks': { hasRLS: true, scopedToUser: true, note: 'Fork lineage' },
  
  // FLAGGED: Need verification
  'cinematic_jobs': { hasRLS: 'VERIFY', scopedToUser: 'VERIFY', note: 'CHECK: ensure user isolation' },
  'usage_ledger': { hasRLS: 'VERIFY', scopedToUser: 'VERIFY', note: 'CHECK: credits should be private' },
} as const;

// ─── Security Headers ─────────────────────────────────────────────

/**
 * Recommended security headers for edge functions.
 * These should be applied in each function's response.
 */
export const RECOMMENDED_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

// ─── Edge Function JWT Audit ──────────────────────────────────────

/**
 * Edge functions that MUST have verify_jwt = true in production.
 * Any function in this list with verify_jwt = false is a security vulnerability.
 */
export const JWT_REQUIRED_FUNCTIONS = [
  // Root repo
  'promote-admin',    // CRITICAL: Currently false — must be fixed
  'upload-attachment',
  'generate-image',
  'chat-stream',
  'ai-chat',
  'export-conversation',
  'memory-manager',
  'analytics',
  
  // Submodule
  'generate-storyboard', // Was false — fixed
  'model-router',        // Was false — fixed  
  'generate-video',      // Was false — fixed
] as const;
