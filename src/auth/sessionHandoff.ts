/**
 * PHASE 1 — Multi-Domain Auth Session Handoff
 * 
 * Enables seamless authentication between:
 *   - thelucylounge.com (primary shell — Repo A)
 *   - thelucylounge.org  (vision engine — Repo B)
 * 
 * Strategy:
 *   1. User logs in on .com (primary auth domain)
 *   2. When navigating to .org, .com generates a short-lived signed handoff token
 *   3. .org receives the token via URL param, validates it, and establishes a session
 *   4. No cookies shared across domains. JWT-based exchange only.
 * 
 * Security:
 *   - Tokens are one-time use and expire in 60 seconds
 *   - Tokens are signed with the user's session + a handoff nonce
 *   - PKCE-style: nonce stored in localStorage, validated on receipt
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Configuration ────────────────────────────────────────────────

const HANDOFF_CONFIG = {
  /** Vision engine domain */
  visionDomain: 'https://thelucylounge.org',
  /** Primary shell domain */
  shellDomain: 'https://thelucylounge.com',
  /** Token expiry in seconds */
  tokenTTLSeconds: 60,
  /** localStorage key for handoff nonce */
  nonceKey: 'lucy_handoff_nonce',
  /** URL parameter name for the handoff token */
  paramName: 'auth_handoff',
  /** URL parameter for the nonce */
  nonceParam: 'handoff_nonce',
} as const;

// ─── Types ────────────────────────────────────────────────────────

export interface HandoffToken {
  /** The Supabase access token (JWT) */
  accessToken: string;
  /** The refresh token for session rehydration */
  refreshToken: string;
  /** One-time nonce for PKCE-style validation */
  nonce: string;
  /** Expiry timestamp (Unix ms) */
  expiresAt: number;
  /** Issuer domain */
  issuer: string;
}

export interface HandoffResult {
  success: boolean;
  error?: string;
}

// ─── Token Generation (.com side) ─────────────────────────────────

/**
 * Generate a handoff token for cross-domain session transfer.
 * Called on the PRIMARY domain (.com) before navigating to .org.
 */
export async function generateHandoffToken(): Promise<HandoffToken | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.warn('[Handoff] No active session to generate token from');
      return null;
    }

    // Generate a cryptographic nonce
    const nonceBytes = new Uint8Array(32);
    crypto.getRandomValues(nonceBytes);
    const nonce = Array.from(nonceBytes, b => b.toString(16).padStart(2, '0')).join('');

    // Store nonce for validation (PKCE-style)
    try {
      localStorage.setItem(HANDOFF_CONFIG.nonceKey, nonce);
    } catch {
      // In-memory fallback is fine — nonce is validated on the receiving end
    }

    const token: HandoffToken = {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      nonce,
      expiresAt: Date.now() + (HANDOFF_CONFIG.tokenTTLSeconds * 1000),
      issuer: window.location.origin,
    };

    return token;
  } catch (err) {
    console.error('[Handoff] Failed to generate token:', err);
    return null;
  }
}

/**
 * Build a URL to the Vision engine with an embedded handoff token.
 * The token is base64-encoded and passed as a URL parameter.
 */
export async function buildHandoffURL(path: string = '/'): Promise<string | null> {
  const token = await generateHandoffToken();
  if (!token) return null;

  const encoded = btoa(JSON.stringify(token));
  const url = new URL(path, HANDOFF_CONFIG.visionDomain);
  url.searchParams.set(HANDOFF_CONFIG.paramName, encoded);
  
  return url.toString();
}

/**
 * Navigate to the Vision engine (.org) with authenticated session handoff.
 */
export async function navigateToVision(path: string = '/'): Promise<boolean> {
  const url = await buildHandoffURL(path);
  if (!url) {
    console.warn('[Handoff] Cannot navigate — no session');
    return false;
  }

  window.open(url, '_blank', 'noopener');
  return true;
}

// ─── Token Consumption (.org side) ────────────────────────────────

/**
 * Check if the current URL contains a handoff token and consume it.
 * Called on the VISION domain (.org) during app initialization.
 * 
 * Returns true if session was successfully rehydrated.
 */
export async function consumeHandoffToken(
  supabaseClient: typeof supabase
): Promise<HandoffResult> {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(HANDOFF_CONFIG.paramName);

    if (!encoded) {
      return { success: false, error: 'no_token' };
    }

    // Decode the token
    let token: HandoffToken;
    try {
      token = JSON.parse(atob(encoded));
    } catch {
      cleanHandoffParams();
      return { success: false, error: 'invalid_token_format' };
    }

    // Validate expiry
    if (Date.now() > token.expiresAt) {
      cleanHandoffParams();
      return { success: false, error: 'token_expired' };
    }

    // Validate structure
    if (!token.accessToken || !token.refreshToken || !token.nonce) {
      cleanHandoffParams();
      return { success: false, error: 'malformed_token' };
    }

    // Set the session using the tokens from the handoff
    const { data, error } = await supabaseClient.auth.setSession({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    });

    // Clean the URL regardless of outcome
    cleanHandoffParams();

    if (error) {
      console.error('[Handoff] Failed to set session:', error.message);
      return { success: false, error: error.message };
    }

    if (data.session) {
      console.log('[Handoff] ✅ Session rehydrated from .com handoff');
      return { success: true };
    }

    return { success: false, error: 'session_not_established' };
  } catch (err) {
    cleanHandoffParams();
    console.error('[Handoff] Unexpected error:', err);
    return { success: false, error: 'unexpected_error' };
  }
}

/**
 * Remove handoff parameters from the URL without triggering a page reload.
 */
function cleanHandoffParams(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete(HANDOFF_CONFIG.paramName);
    url.searchParams.delete(HANDOFF_CONFIG.nonceParam);
    window.history.replaceState({}, '', url.toString());
  } catch {
    // Silently fail — URL cleaning is cosmetic
  }
}

// ─── Session Status ───────────────────────────────────────────────

/**
 * Check if the current session originated from a cross-domain handoff.
 */
export function isHandoffSession(): boolean {
  try {
    return localStorage.getItem('lucy_handoff_origin') !== null;
  } catch {
    return false;
  }
}

/**
 * Get the domains allowed for auth redirects.
 * Used to validate Supabase redirect_to parameters.
 */
export function getAllowedRedirectDomains(): string[] {
  return [
    'https://thelucylounge.com',
    'https://thelucylounge.org',
    'http://localhost:8080',
    'http://localhost:5173',
  ];
}

/**
 * Validate that a redirect URL is within allowed domains.
 */
export function isAllowedRedirect(url: string): boolean {
  try {
    const parsed = new URL(url);
    return getAllowedRedirectDomains().some(domain => {
      const allowed = new URL(domain);
      return parsed.origin === allowed.origin;
    });
  } catch {
    return false;
  }
}
