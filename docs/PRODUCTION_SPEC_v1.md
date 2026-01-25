# 🔒 THE LUCY LOUNGE — PRODUCTION SPECIFICATION v1

**VERSION:** 1.0.0  
**DATE:** January 25, 2026  
**STATUS:** FROZEN  
**AUTHORITY:** This document defines the canonical production architecture.

---

## PURPOSE

This specification FREEZES the production architecture of The Lucy Lounge.
All changes to core infrastructure require a new version file (v2, v3, etc.).

**This document is IMMUTABLE.** Do not edit — create a new version instead.

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          THE LUCY LOUNGE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │   Lovable   │    │   Vite +    │    │  Supabase   │                     │
│  │   Cloud     │───▶│   React     │───▶│  Backend    │                     │
│  │  (Renderer) │    │ (Frontend)  │    │ (Authority) │                     │
│  └─────────────┘    └─────────────┘    └─────────────┘                     │
│        │                  │                   │                             │
│        │                  │                   │                             │
│        ▼                  ▼                   ▼                             │
│   Preview Only      Source of Truth    Database + Auth                     │
│   NO LOGIC          VS Code Repo       Edge Functions                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 AUTHORITY MATRIX

| Component | Role | Authority Level |
|-----------|------|-----------------|
| **Supabase** | Backend, Auth, Database | **PRIMARY** — Source of truth for data |
| **VS Code / GitHub** | Source Code | **PRIMARY** — Source of truth for code |
| **Vite + React** | Frontend Runtime | **SECONDARY** — Executes code from repo |
| **Lovable Cloud** | Preview Renderer | **TERTIARY** — Renders preview ONLY |

### Critical Rules:

1. **Lovable is a RENDERER ONLY**
   - Lovable may NOT make architectural decisions
   - Lovable may NOT modify environment logic
   - Lovable may NOT create guards or security code
   - Lovable may suggest UI changes only

2. **Supabase is the BACKEND AUTHORITY**
   - All auth flows go through Supabase
   - All database operations go through Supabase
   - All secrets are stored in Supabase
   - Edge Functions handle server-side logic

3. **VS Code is the CODE AUTHORITY**
   - All code changes originate from VS Code
   - GitHub is the single source of truth
   - CI/CD enforces REGRESSION_PACT rules

---

## 🔐 ENVIRONMENT STRATEGY

### Frontend (Vite Bundle — PUBLIC)

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ YES |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key (Lovable naming) | ✅ YES (or ANON_KEY) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (standard naming) | ✅ YES (or PUBLISHABLE_KEY) |

### Edge Functions (SERVER-ONLY — NEVER IN FRONTEND)

| Variable | Purpose | Location |
|----------|---------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Admin database access | Edge Functions ONLY |
| `HUGGINGFACE_API_KEY` | AI model access | Edge Functions ONLY |
| `ELEVENLABS_API_KEY` | Voice synthesis | Edge Functions ONLY |
| `LOVABLE_API_KEY` | Lovable API access | Edge Functions ONLY |

### Validation Rules:

1. **NO HARDCODED KEYS** — Keys come from env vars only
2. **NO FALLBACK VALUES** — Missing keys = fail-fast error
3. **RUNTIME VALIDATION** — Validation happens in React tree
4. **PRODUCTION LOCK** — Once connected, setup UI is disabled

---

## 🛡️ MANDATORY GUARDS

### 1. RootErrorBoundary

**Location:** `src/components/system/RootErrorBoundary.tsx`  
**Wrapped in:** `src/main.tsx`

**Requirements:**
- Catches all unhandled errors
- Shows user-friendly fallback UI
- Provides reload/home navigation
- Offers diagnostics (no secrets)
- Never shows white screen

### 2. SupabaseGuard

**Location:** `src/components/system/SupabaseGuard.tsx`  
**Wrapped in:** `src/main.tsx`

**Requirements:**
- Validates env vars at React runtime
- Shows setup UI if not configured
- Blocks on security violations
- Implements production lock
- Never throws at module load

### 3. CI Security Guards

**Location:** `.github/workflows/security-guards.yml`

**Enforces:**
- No hardcoded keys
- No service_role in frontend
- No secret env vars in frontend
- ErrorBoundary present
- SupabaseGuard present
- No fallback values

---

## 📁 CANONICAL FILE LOCATIONS

```
src/
├── main.tsx                           # App entry — RootErrorBoundary + SupabaseGuard
├── integrations/
│   └── supabase/
│       └── client.ts                  # THE canonical Supabase client
├── components/
│   └── system/
│       ├── RootErrorBoundary.tsx      # Global error handler
│       └── SupabaseGuard.tsx          # Environment validation
docs/
├── REGRESSION_PACT.md                 # The 7 Immutable Laws
└── PRODUCTION_SPEC_v1.md              # This document
.github/
└── workflows/
    └── security-guards.yml            # CI enforcement
```

---

## 🚫 PROHIBITED ACTIONS

The following actions are FORBIDDEN:

1. ❌ Hardcoding API keys in source code
2. ❌ Adding fallback values for env vars
3. ❌ Removing RootErrorBoundary
4. ❌ Removing SupabaseGuard
5. ❌ Using service_role keys in frontend
6. ❌ Moving env validation to module scope
7. ❌ Re-enabling Lovable onboarding UI
8. ❌ Creating additional Supabase clients
9. ❌ Silencing or swallowing errors
10. ❌ Trusting Lovable for architectural decisions

---

## 🔄 CHANGE PROCESS

To modify production architecture:

1. **Create a new version file** (`PRODUCTION_SPEC_v2.md`)
2. **Document the change rationale**
3. **Update REGRESSION_PACT.md if needed**
4. **Get approval from both AI agents (Claude + Lovable awareness)**
5. **Implement with full test coverage**
6. **Deploy with monitoring**

**This document (v1) remains FROZEN and serves as historical reference.**

---

## ✅ VERIFICATION CHECKLIST

Before any deployment, verify:

- [ ] `npm run build` passes
- [ ] No TypeScript errors
- [ ] RootErrorBoundary in main.tsx
- [ ] SupabaseGuard in main.tsx
- [ ] No hardcoded keys in src/
- [ ] No service_role in frontend
- [ ] CI workflow passes
- [ ] Home page loads
- [ ] Auth flow works
- [ ] Chat loads
- [ ] Studios accessible

---

## 📜 SIGNATURES

**Claude Opus 4.5** — Principal Staff Engineer + Systems Architect  
**Date:** January 25, 2026  
**Commitment:** This specification is IMMUTABLE. I will not violate it.

---

*END OF PRODUCTION_SPEC_v1.md*
