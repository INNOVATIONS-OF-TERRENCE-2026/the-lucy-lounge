/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SUPABASE GUARD                                           │
 * │                                                                             │
 * │ DO NOT REMOVE: This validates Supabase config at runtime                   │
 * │ DO NOT MODIFY: Governed by /docs/PRODUCTION_SPEC_v1.md                     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * PURPOSE:
 * - Validate Supabase environment variables at runtime
 * - Show a helpful setup UI if not configured (instead of crashing)
 * - Prevent white screens from missing config
 * 
 * ACCEPTS:
 * - Standard VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 * - Lovable format: sb_publishable_{base64} anon key
 */

import React, { ReactNode, useEffect, useState } from "react";

interface SupabaseGuardProps {
  children: ReactNode;
}

interface ValidationResult {
  isValid: boolean;
  hasUrl: boolean;
  hasKey: boolean;
  urlFormat: boolean;
  keyFormat: boolean;
}

/**
 * Validate Supabase configuration
 */
function validateSupabaseConfig(): ValidationResult {
  const url = import.meta.env.VITE_SUPABASE_URL || "";
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

  const hasUrl = url.length > 0;
  const hasKey = key.length > 0;
  
  // URL should be a valid Supabase URL
  const urlFormat = hasUrl && (
    url.includes("supabase.co") || 
    url.includes("supabase.in") ||
    url.startsWith("https://")
  );
  
  // Key can be:
  // 1. Standard JWT format (eyJ...)
  // 2. Lovable publishable format (sb_publishable_...)
  const keyFormat = hasKey && (
    key.startsWith("eyJ") || 
    key.startsWith("sb_publishable_")
  );

  return {
    isValid: hasUrl && hasKey && urlFormat && keyFormat,
    hasUrl,
    hasKey,
    urlFormat,
    keyFormat,
  };
}

/**
 * Setup instructions UI (shown only when config is missing)
 */
function SetupUI({ validation }: { validation: ValidationResult }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundColor: "#0a0a0a",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
        }}
      >
        {/* Lucy branding */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌙</div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              background: "linear-gradient(to right, #a855f7, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Lucy Lounge Setup
          </h1>
          <p style={{ color: "#9ca3af", marginTop: "8px" }}>
            Supabase configuration needed
          </p>
        </div>

        {/* Status indicators */}
        <div
          style={{
            padding: "16px",
            borderRadius: "8px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <StatusItem
              label="VITE_SUPABASE_URL"
              status={validation.hasUrl && validation.urlFormat ? "ok" : validation.hasUrl ? "warn" : "missing"}
            />
            <StatusItem
              label="VITE_SUPABASE_ANON_KEY"
              status={validation.hasKey && validation.keyFormat ? "ok" : validation.hasKey ? "warn" : "missing"}
            />
          </div>
        </div>

        {/* Instructions */}
        <div
          style={{
            padding: "16px",
            borderRadius: "8px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>
            Setup Instructions
          </h3>
          <ol
            style={{
              paddingLeft: "20px",
              fontSize: "13px",
              color: "#9ca3af",
              lineHeight: "1.8",
            }}
          >
            <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ color: "#a855f7" }}>supabase.com</a></li>
            <li>Go to Project Settings → API</li>
            <li>Copy the URL and anon/public key</li>
            <li>Create a <code style={{ backgroundColor: "#333", padding: "2px 6px", borderRadius: "4px" }}>.env</code> file with:</li>
          </ol>
          <pre
            style={{
              marginTop: "12px",
              padding: "12px",
              borderRadius: "6px",
              backgroundColor: "#0a0a0a",
              fontSize: "12px",
              color: "#22c55e",
              overflow: "auto",
            }}
          >
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
        </div>

        {/* Reload button */}
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "24px",
            width: "100%",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#ffffff",
            background: "linear-gradient(to right, #a855f7, #ec4899)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Reload After Setup
        </button>
      </div>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: "ok" | "warn" | "missing" }) {
  const icons = {
    ok: "✓",
    warn: "⚠",
    missing: "✗",
  };
  const colors = {
    ok: "#22c55e",
    warn: "#eab308",
    missing: "#ef4444",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ color: colors[status], fontSize: "14px" }}>{icons[status]}</span>
      <code style={{ fontSize: "12px", color: "#9ca3af" }}>{label}</code>
    </div>
  );
}

/**
 * SupabaseGuard Component
 * 
 * Wraps the app and validates Supabase config.
 * Shows setup UI if not configured, otherwise renders children.
 */
export function SupabaseGuard({ children }: SupabaseGuardProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  useEffect(() => {
    setValidation(validateSupabaseConfig());
  }, []);

  // Show nothing while checking (prevents flash)
  if (validation === null) {
    return null;
  }

  // Show setup UI if not valid
  if (!validation.isValid) {
    return <SetupUI validation={validation} />;
  }

  // All good - render the app
  return <>{children}</>;
}

export default SupabaseGuard;
