/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — MEDIA MODULE INDEX                                       │
 * │                                                                             │
 * │ Central export for all media-related functionality.                        │
 * │ Now includes Universal Media Intelligence Layer (2025)                     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// =============================================================================
// UNIVERSAL MEDIA INTELLIGENCE LAYER (NEW 2025)
// =============================================================================

// Types - Core type definitions for the media graph
export * from './types';

// Provider Adapters - TMDB, YouTube, Spotify, RSS, Public Domain
export * from './providers';

// Recommendation Engine - Hybrid scoring, cold start, semantic similarity
export * from './engine';

// Media Graph Client - Content ingestion, deduplication, CRUD
export * from './client';

// UX Row Definitions - Netflix-style row configurations
export * from './ux';

// =============================================================================
// LEGACY EXPORTS (Maintained for backward compatibility)
// =============================================================================

// Policy (must be imported first)
export * from './MediaPolicy';
export { default as MediaPolicy } from './MediaPolicy';

// Adapters
export * from './AudioEngineAdapter';
export { default as audioEngineAdapter } from './AudioEngineAdapter';

export * from './VideoEngineAdapter';
export { default as videoEngineAdapter } from './VideoEngineAdapter';
