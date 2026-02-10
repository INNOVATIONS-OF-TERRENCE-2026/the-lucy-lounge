/**
 * PHASE 5 — Submodule Boundary Enforcement
 * 
 * Defines the clean separation between:
 *   - the-lucy-lounge (OS Shell): auth, analytics, monetization, media, orchestration
 *   - lucy-vision-spark (Vision Engine): generation, cinema, creator tools
 * 
 * This module is the ONLY place where cross-boundary concerns are documented.
 * Import this in both repos to enforce consistent boundary rules.
 */

// ─── Boundary Definitions ─────────────────────────────────────────

/**
 * Responsibilities of the OS Shell (the-lucy-lounge / .com)
 * 
 * The shell is responsible for:
 * - Primary authentication (login, signup, session management)
 * - Cross-domain session handoff to the vision engine
 * - User profiles, organizations, and multi-tenancy
 * - Subscription/monetization logic
 * - Analytics and usage tracking
 * - Media graph (Spotify, YouTube, FAST channels)
 * - Audio orchestration (ambient, podcast, music)
 * - AI model routing decisions
 * - Arcade/gaming system
 * - Blog/content/SEO pages
 * - Admin tools
 * 
 * The shell DOES NOT:
 * - Generate images or video
 * - Run cinema storyboard pipelines
 * - Manage creator dashboards
 * - Handle generation storage or galleries
 */
export const SHELL_DOMAIN = 'thelucylounge.com' as const;

/**
 * Responsibilities of the Vision Engine (lucy-vision-spark / .org)
 * 
 * The vision engine is responsible for:
 * - Image generation (FLUX, Stable Diffusion, etc.)
 * - Cinema storyboard generation and rendering
 * - Voice/audio generation
 * - Creator dashboard and generation gallery
 * - File uploads for creative reference
 * - Generation lineage tracking
 * - Prompt history and templates
 * 
 * The vision engine DOES NOT:
 * - Own authentication (receives handoff from shell)
 * - Manage subscriptions or payments
 * - Control media playback (Spotify, etc.)
 * - Run the arcade system
 * - Serve marketing/content pages
 */
export const VISION_DOMAIN = 'thelucylounge.org' as const;

// ─── Shared Contracts ─────────────────────────────────────────────

/**
 * These types can be used by BOTH repos.
 * They represent the shared interface between the shell and vision engine.
 */

/** User identity passed from shell to vision engine */
export interface SharedUserIdentity {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  plan?: 'free' | 'pro' | 'enterprise';
}

/** Navigation targets between domains */
export interface CrossDomainNavigation {
  /** Shell pages */
  shell: {
    home: '/';
    chat: '/chat';
    media: '/media';
    pricing: '/pricing';
    profile: '/profile';
    admin: '/admin';
  };
  /** Vision engine pages */
  vision: {
    home: '/';
    create: '/create';
    cinema: '/cinema';
    gallery: '/gallery';
    dashboard: '/dashboard';
    explore: '/explore';
  };
}

/** Event types that can be communicated between domains */
export type CrossDomainEventType =
  | 'session_handoff'
  | 'generation_complete'
  | 'credits_updated'
  | 'plan_changed';

export interface CrossDomainEvent {
  type: CrossDomainEventType;
  payload: Record<string, unknown>;
  timestamp: number;
  source: typeof SHELL_DOMAIN | typeof VISION_DOMAIN;
}

// ─── Dependency Rules ─────────────────────────────────────────────

/**
 * HARD RULES — Violations of these rules must be caught in code review:
 * 
 * 1. Vision Engine MUST NOT import from the Shell's source tree
 * 2. Shell MUST NOT import from the Vision Engine's source tree
 * 3. Shared logic MUST be in published npm packages or duplicated with identical types
 * 4. Each repo has its OWN Supabase project and client
 * 5. Auth tokens are transferred via the handoff protocol, never shared directly
 * 6. No circular dependencies between the repos
 * 7. Each repo builds and deploys independently
 */

export const BOUNDARY_RULES = {
  noCircularImports: true,
  separateSupabaseProjects: true,
  authViaHandoffOnly: true,
  independentDeployment: true,
  sharedTypesOnly: true,
} as const;
