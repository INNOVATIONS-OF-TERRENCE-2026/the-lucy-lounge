/**
 * THE LUCY LOUNGE - GUARDS MODULE INDEX
 * 
 * Runtime guards for mobile safety and environment validation.
 */

// Mobile Runtime Guard
export {
  mobileRuntimeGuard,
  detectRuntime,
  isBrowser,
  isHydrated,
  markHydrated,
  guardMediaAccess,
  guardStorageAccess,
  guardNetworkAccess,
  guardAnimations,
  assertMediaAccess,
  assertStorageAccess,
  assertBrowser,
  validateBootSequence,
  MobileRuntimeError,
  type MobilePlatform,
  type BrowserEngine,
  type RuntimeEnvironment,
  type MobileRuntimeInfo,
  type GuardResult,
  type MediaAccessRequest,
  type BootSequenceStep,
} from './MobileRuntimeGuard';

// Environment Guard
export {
  environmentGuard,
  detectMode,
  isDevelopment,
  isProduction,
  getEnvVar,
  hasEnvVar,
  validateEnvVars,
  getFeatureFlags,
  isFeatureEnabled,
  checkServiceStatus,
  validateEnvironment,
  checkEnvironmentRequirements,
  type EnvironmentMode,
  type EnvironmentConfig,
  type FeatureFlags,
  type ServiceStatus,
  type EnvironmentValidation,
  type EnvironmentGuardOptions,
} from './EnvironmentGuard';
