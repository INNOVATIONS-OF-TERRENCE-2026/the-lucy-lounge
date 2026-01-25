/**
 * THE LUCY LOUNGE - ENVIRONMENT GUARD
 * 
 * Production environment validation and configuration.
 * Ensures all required environment variables and services are available.
 * 
 * VALIDATES:
 * - Required environment variables
 * - Supabase connectivity
 * - AI service availability
 * - Feature flags
 * 
 * NEVER exposes secrets to client code.
 * ALWAYS provides graceful degradation.
 */

// ============================================================================
// TYPES
// ============================================================================

export type EnvironmentMode = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  mode: EnvironmentMode;
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiBaseUrl: string;
  features: FeatureFlags;
  services: ServiceStatus;
}

export interface FeatureFlags {
  enableVoice: boolean;
  enableVideo: boolean;
  enableAI: boolean;
  enableMusic: boolean;
  enableAnalytics: boolean;
  enablePWA: boolean;
  enableDebugMode: boolean;
  enableBetaFeatures: boolean;
}

export interface ServiceStatus {
  supabase: 'available' | 'degraded' | 'unavailable';
  ai: 'available' | 'degraded' | 'unavailable';
  storage: 'available' | 'degraded' | 'unavailable';
  realtime: 'available' | 'degraded' | 'unavailable';
}

export interface EnvironmentValidation {
  valid: boolean;
  mode: EnvironmentMode;
  errors: string[];
  warnings: string[];
  config: EnvironmentConfig;
}

// ============================================================================
// ENVIRONMENT DETECTION
// ============================================================================

/**
 * Detect current environment mode
 */
export function detectMode(): EnvironmentMode {
  // Check Vite mode
  const viteMode = import.meta.env.MODE;
  if (viteMode === 'production') return 'production';
  if (viteMode === 'staging') return 'staging';
  
  // Check for production domain
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'thelucylounge.com' || hostname === 'www.thelucylounge.com') {
      return 'production';
    }
    if (hostname.includes('staging') || hostname.includes('preview')) {
      return 'staging';
    }
  }

  return 'development';
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return detectMode() === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return detectMode() === 'production';
}

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

interface EnvVar {
  key: string;
  required: boolean;
  sensitive: boolean;
  validator?: (value: string) => boolean;
}

const REQUIRED_ENV_VARS: EnvVar[] = [
  {
    key: 'VITE_SUPABASE_URL',
    required: true,
    sensitive: false,
    validator: (v) => v.startsWith('https://') && v.includes('supabase'),
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    required: true,
    sensitive: true,
    validator: (v) => v.length > 100 && v.startsWith('eyJ'),
  },
];

const OPTIONAL_ENV_VARS: EnvVar[] = [
  { key: 'VITE_ANALYTICS_ID', required: false, sensitive: false },
  { key: 'VITE_SENTRY_DSN', required: false, sensitive: true },
  { key: 'VITE_ENABLE_DEBUG', required: false, sensitive: false },
];

/**
 * Get environment variable value safely
 * NEVER returns sensitive values in production logs
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] ?? defaultValue ?? '';
  return value;
}

/**
 * Check if an environment variable is set
 */
export function hasEnvVar(key: string): boolean {
  const value = import.meta.env[key];
  return value !== undefined && value !== null && value !== '';
}

/**
 * Validate all environment variables
 */
export function validateEnvVars(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required vars
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!hasEnvVar(envVar.key)) {
      errors.push(`Missing required environment variable: ${envVar.key}`);
      continue;
    }

    const value = getEnvVar(envVar.key);
    if (envVar.validator && !envVar.validator(value)) {
      errors.push(`Invalid value for ${envVar.key}`);
    }
  }

  // Check optional vars
  for (const envVar of OPTIONAL_ENV_VARS) {
    if (!hasEnvVar(envVar.key)) {
      warnings.push(`Optional environment variable not set: ${envVar.key}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Get current feature flags based on environment
 */
export function getFeatureFlags(): FeatureFlags {
  const mode = detectMode();
  const debugEnabled = getEnvVar('VITE_ENABLE_DEBUG') === 'true';

  // Base flags for all environments
  const baseFlags: FeatureFlags = {
    enableVoice: true,
    enableVideo: true,
    enableAI: true,
    enableMusic: true,
    enableAnalytics: mode === 'production',
    enablePWA: true,
    enableDebugMode: debugEnabled || mode === 'development',
    enableBetaFeatures: mode !== 'production',
  };

  // Override from URL params in development
  if (mode === 'development' && typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('debug')) baseFlags.enableDebugMode = params.get('debug') === 'true';
    if (params.has('voice')) baseFlags.enableVoice = params.get('voice') === 'true';
    if (params.has('video')) baseFlags.enableVideo = params.get('video') === 'true';
    if (params.has('ai')) baseFlags.enableAI = params.get('ai') === 'true';
    if (params.has('beta')) baseFlags.enableBetaFeatures = params.get('beta') === 'true';
  }

  return baseFlags;
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return getFeatureFlags()[feature];
}

// ============================================================================
// SERVICE STATUS
// ============================================================================

let _serviceStatusCache: ServiceStatus | null = null;
let _serviceStatusTimestamp = 0;
const SERVICE_STATUS_TTL = 60000; // 1 minute cache

/**
 * Check availability of external services
 */
export async function checkServiceStatus(forceRefresh = false): Promise<ServiceStatus> {
  const now = Date.now();
  
  // Return cached if fresh
  if (!forceRefresh && _serviceStatusCache && (now - _serviceStatusTimestamp) < SERVICE_STATUS_TTL) {
    return _serviceStatusCache;
  }

  const status: ServiceStatus = {
    supabase: 'unavailable',
    ai: 'unavailable',
    storage: 'unavailable',
    realtime: 'unavailable',
  };

  // Check Supabase
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { error } = await supabase.from('health_check').select('*').limit(1);
    status.supabase = error ? 'degraded' : 'available';
  } catch {
    status.supabase = 'unavailable';
  }

  // Check AI (via edge function ping)
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { error } = await supabase.functions.invoke('ai-router', {
      body: { ping: true },
    });
    status.ai = error ? 'degraded' : 'available';
  } catch {
    status.ai = 'unavailable';
  }

  // Storage availability
  try {
    const testKey = '__lucy_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    status.storage = 'available';
  } catch {
    status.storage = 'unavailable';
  }

  // Realtime (assume available if Supabase is available)
  status.realtime = status.supabase;

  // Cache result
  _serviceStatusCache = status;
  _serviceStatusTimestamp = now;

  return status;
}

// ============================================================================
// FULL ENVIRONMENT VALIDATION
// ============================================================================

/**
 * Perform full environment validation
 */
export async function validateEnvironment(): Promise<EnvironmentValidation> {
  const mode = detectMode();
  const envValidation = validateEnvVars();
  const features = getFeatureFlags();
  
  // Get service status (don't block on this in production)
  let services: ServiceStatus;
  if (mode === 'development') {
    services = await checkServiceStatus();
  } else {
    // In production, use optimistic defaults
    services = {
      supabase: 'available',
      ai: 'available',
      storage: 'available',
      realtime: 'available',
    };
    // Check in background
    checkServiceStatus().then(s => {
      _serviceStatusCache = s;
    });
  }

  const config: EnvironmentConfig = {
    mode,
    supabaseUrl: getEnvVar('VITE_SUPABASE_URL'),
    supabaseAnonKey: '[REDACTED]', // Never expose in logs
    apiBaseUrl: getEnvVar('VITE_SUPABASE_URL'),
    features,
    services,
  };

  return {
    valid: envValidation.valid,
    mode,
    errors: envValidation.errors,
    warnings: envValidation.warnings,
    config,
  };
}

// ============================================================================
// GUARD COMPONENT HELPER
// ============================================================================

export interface EnvironmentGuardOptions {
  requiredFeatures?: (keyof FeatureFlags)[];
  requiredServices?: (keyof ServiceStatus)[];
  fallback?: () => void;
}

/**
 * Check if environment meets requirements
 */
export function checkEnvironmentRequirements(options: EnvironmentGuardOptions): {
  allowed: boolean;
  reason?: string;
} {
  const features = getFeatureFlags();
  
  // Check required features
  if (options.requiredFeatures) {
    for (const feature of options.requiredFeatures) {
      if (!features[feature]) {
        return { allowed: false, reason: `Feature ${feature} is disabled` };
      }
    }
  }

  // Check required services (use cache)
  if (options.requiredServices && _serviceStatusCache) {
    for (const service of options.requiredServices) {
      if (_serviceStatusCache[service] === 'unavailable') {
        return { allowed: false, reason: `Service ${service} is unavailable` };
      }
    }
  }

  return { allowed: true };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const environmentGuard = {
  // Mode detection
  detectMode,
  isDevelopment,
  isProduction,

  // Environment variables
  getEnvVar,
  hasEnvVar,
  validateEnvVars,

  // Feature flags
  getFeatureFlags,
  isFeatureEnabled,

  // Service status
  checkServiceStatus,

  // Full validation
  validateEnvironment,
  checkEnvironmentRequirements,
};

export default environmentGuard;
