/**
 * THE LUCY LOUNGE — SUPABASE ENVIRONMENT GUARD
 * 
 * Validates Supabase configuration at React runtime and displays a graceful
 * setup screen if configuration is missing (instead of crashing).
 * 
 * SECURITY RULES (IMMUTABLE):
 * 1. Frontend uses PUBLISHABLE KEY ONLY
 * 2. NO hardcoded keys, NO fallback values
 * 3. Show helpful UI if environment is misconfigured
 * 4. service_role keys are SERVER-ONLY (Edge Functions)
 * 
 * @see /docs/REGRESSION_PACT.md
 */
import { ReactNode } from 'react';

interface SupabaseGuardProps {
  children: ReactNode;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  isMissingConfig: boolean;
  isSecurityViolation: boolean;
}

/**
 * Validates Supabase environment configuration.
 * Returns validation result instead of throwing (graceful degradation).
 */
function validateSupabaseEnvironment(): ValidationResult {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = 
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  const errors: string[] = [];
  let isMissingConfig = false;
  let isSecurityViolation = false;

  // Validate URL
  if (!SUPABASE_URL || typeof SUPABASE_URL !== 'string' || SUPABASE_URL.trim() === '') {
    errors.push('VITE_SUPABASE_URL is missing or empty');
    isMissingConfig = true;
  }

  // Validate KEY (either naming convention is acceptable)
  if (!SUPABASE_KEY || typeof SUPABASE_KEY !== 'string' || SUPABASE_KEY.trim() === '') {
    errors.push('VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) is missing or empty');
    isMissingConfig = true;
  }

  // SECURITY GATE: Block service_role keys from frontend
  if (SUPABASE_KEY && SUPABASE_KEY.includes('service_role')) {
    errors.push('CRITICAL: service_role key detected in frontend — this is a security violation');
    isSecurityViolation = true;
  }

  // SECURITY GATE: Validate key looks like a JWT (basic format check)
  if (SUPABASE_KEY && SUPABASE_KEY.length > 0 && !SUPABASE_KEY.startsWith('eyJ')) {
    errors.push('CRITICAL: Key does not appear to be a valid Supabase anon/publishable key');
    isSecurityViolation = true;
  }

  if (errors.length > 0) {
    // Console log for debugging (no secrets exposed)
    console.warn(
      '\n╔══════════════════════════════════════════════════════════════════╗\n' +
      '║  THE LUCY LOUNGE — SUPABASE CONFIGURATION STATUS                ║\n' +
      '╠══════════════════════════════════════════════════════════════════╣\n' +
      errors.map(e => `║  ⚠ ${e.substring(0, 62).padEnd(62)}║`).join('\n') + '\n' +
      '╚══════════════════════════════════════════════════════════════════╝\n'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    isMissingConfig,
    isSecurityViolation,
  };
}

/**
 * Setup screen shown when Supabase is not configured.
 * Guides user to enable Supabase integration in Lovable.
 */
function SupabaseSetupScreen({ errors, isSecurityViolation }: { errors: string[]; isSecurityViolation: boolean }) {
  // Use inline styles so this works even if CSS fails to load
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '20px',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  };

  const titleStyle: React.CSSProperties = {
    color: isSecurityViolation ? '#ef4444' : '#a78bfa',
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const subtitleStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    marginBottom: '24px',
  };

  const stepStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  };

  const stepNumberStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    color: 'white',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    marginRight: '12px',
  };

  const stepTextStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '14px',
  };

  const errorBoxStyle: React.CSSProperties = {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
  };

  const errorTextStyle: React.CSSProperties = {
    color: '#fca5a5',
    fontSize: '13px',
    margin: '4px 0',
  };

  const logoStyle: React.CSSProperties = {
    fontSize: '32px',
  };

  if (isSecurityViolation) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={titleStyle}>
            <span style={logoStyle}>🛡️</span>
            Security Alert
          </div>
          <div style={subtitleStyle}>
            A security violation was detected in the Supabase configuration.
          </div>
          <div style={errorBoxStyle}>
            {errors.map((error, i) => (
              <div key={i} style={errorTextStyle}>• {error}</div>
            ))}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px' }}>
            Please check your environment configuration and ensure only the 
            <strong style={{ color: '#a78bfa' }}> anon/publishable key </strong> 
            is used in the frontend.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={titleStyle}>
          <span style={logoStyle}>✨</span>
          The Lucy Lounge
        </div>
        <div style={subtitleStyle}>
          Connect Supabase to unlock the full experience
        </div>

        <div style={stepStyle}>
          <span style={stepNumberStyle}>1</span>
          <span style={stepTextStyle}>
            Click the <strong style={{ color: '#a78bfa' }}>green Supabase button</strong> in the top right
          </span>
        </div>

        <div style={stepStyle}>
          <span style={stepNumberStyle}>2</span>
          <span style={stepTextStyle}>
            Select <strong style={{ color: '#a78bfa' }}>Connect to Supabase</strong>
          </span>
        </div>

        <div style={stepStyle}>
          <span style={stepNumberStyle}>3</span>
          <span style={stepTextStyle}>
            Follow the prompts to link your project
          </span>
        </div>

        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: 'rgba(167, 139, 250, 0.1)', 
          borderRadius: '8px',
          border: '1px solid rgba(167, 139, 250, 0.2)',
        }}>
          <div style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
            💡 Why Supabase?
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px' }}>
            Lucy uses Supabase for authentication, real-time chat, and secure data storage. 
            Your experience will be ready once connected!
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SupabaseGuard - Validates environment configuration at React runtime.
 * 
 * Shows a helpful setup screen if Supabase is not configured, instead of crashing.
 * This ensures users see guidance rather than a white screen or error.
 */
export function SupabaseGuard({ children }: SupabaseGuardProps): ReactNode {
  const validation = validateSupabaseEnvironment();

  // If configuration is invalid, show setup screen instead of crashing
  if (!validation.isValid) {
    return (
      <SupabaseSetupScreen 
        errors={validation.errors} 
        isSecurityViolation={validation.isSecurityViolation} 
      />
    );
  }

  // Configuration is valid — render the app
  return <>{children}</>;
}

export default SupabaseGuard;
