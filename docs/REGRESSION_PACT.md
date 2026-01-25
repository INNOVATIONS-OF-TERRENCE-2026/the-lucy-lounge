# 🔐 THE LUCY LOUNGE — DUAL-AGENT REGRESSION PACT

**VERSION:** 1.0.0  
**DATE:** January 25, 2026  
**BINDING PARTIES:** Lovable AI, Claude Opus 4.5, Future AI Agents  
**ENFORCED BY:** GitHub CI/CD, Production Monitoring

---

## PURPOSE

This document establishes IMMUTABLE RULES that ALL AI agents (Lovable, Claude, Copilot, etc.) MUST obey when making changes to The Lucy Lounge codebase. These rules exist because past violations caused production outages.

**This pact prevents:**
- White screen crashes
- Authentication failures
- Security vulnerabilities
- Silent failures that mask real errors

---

## ⚖️ THE SEVEN IMMUTABLE LAWS

### LAW 1: NEVER HARDCODE SECRETS

```
❌ FORBIDDEN:
const KEY = 'sk-abc123...';
const KEY = 'eyJhbGci...';
const KEY = import.meta.env.VAR || 'hardcoded-fallback';

✅ REQUIRED:
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
// With fail-fast validation (see Law 4)
```

**Rationale:** Hardcoded keys get committed to version control and leaked.

---

### LAW 2: PUBLISHABLE KEY ONLY IN FRONTEND

The frontend (React/Vite bundle) may ONLY use:
- `VITE_SUPABASE_URL` (public project URL)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (Lovable convention, preferred)
- `VITE_SUPABASE_ANON_KEY` (standard Supabase naming, alternative)

The following are **SERVER-ONLY** (Edge Functions):
- `SUPABASE_SERVICE_ROLE_KEY`
- `HUGGINGFACE_API_KEY`
- `ELEVENLABS_API_KEY`
- `LOVABLE_API_KEY`
- Any `*_SECRET` or `*_PRIVATE` key

**Rationale:** Frontend bundles are publicly downloadable. Server keys in client = breach.

---

### LAW 3: NO FALLBACK VALUES (Hardcoded defaults are forbidden)

```
❌ FORBIDDEN:
const URL = import.meta.env.VITE_URL || 'https://default.supabase.co';
const KEY = import.meta.env.VITE_KEY || 'eyJhbGci...';

✅ REQUIRED:
const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
// Validate and fail-fast if missing
```

**Rationale:** Fallbacks mask configuration errors, causing silent failures in production.

---

### LAW 4: FAIL-FAST ENVIRONMENT VALIDATION

The Supabase client MUST validate environment at module load:

```typescript
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase configuration missing');
}
```

**Rationale:** Explicit errors are diagnosable. Silent failures cause hours of debugging.

---

### LAW 5: ROOT ERROR BOUNDARY REQUIRED

The application MUST have a root-level ErrorBoundary that:
- Catches all unhandled errors
- Shows a user-friendly fallback UI
- Provides "Reload" and "Go Home" buttons
- Offers "Copy Diagnostics" (with NO secrets)
- Never crashes into a white screen

**Location:** `src/main.tsx` wraps `<App />` with `<RootErrorBoundary>`

---

### LAW 6: NO SECRET LEAKS

Secrets MUST NOT appear in:
- Client bundle (`dist/` folder)
- Console logs
- Error messages
- Network requests (except Authorization headers to own backend)
- Diagnostic reports

---

### LAW 7: PRESERVE PROTECTED FEATURES

The following features are PROTECTED ENTITIES. They MUST remain functional after any change:

| Feature | Route | Status |
|---------|-------|--------|
| Landing Page | `/` | PROTECTED |
| Authentication | `/auth` | PROTECTED |
| Chat Interface | `/chat` | PROTECTED |
| Studios Hub | `/studios` | PROTECTED |
| Audio Studio | `/studios/audio` | PROTECTED |
| AI Studio | `/studios/ai` | PROTECTED |
| Model Routing | (internal) | PROTECTED |
| Session Persistence | (internal) | PROTECTED |

---

## 🛡️ PROTECTED ROUTES

These routes MUST load without error:

```
/           → Landing page
/auth       → Sign in / Sign up
/chat       → Chat interface (requires auth)
/studios    → Studios hub
/studios/audio → Audio generation studio
/studios/ai    → AI generation studio
/studios/dev   → Developer tools
/neural     → Neural lounge
/dream      → Dream mode
/admin      → Admin panel (requires admin role)
```

---

## ✅ PRE-CHANGE VERIFICATION CHECKLIST

Before ANY agent suggests changes, verify:

- [ ] No hardcoded keys in source files
- [ ] No fallback keys (empty strings, default URLs)
- [ ] Environment validation exists and throws on missing vars
- [ ] RootErrorBoundary wraps the app in main.tsx
- [ ] Build passes: `npm run build`
- [ ] TypeScript passes: `npx tsc --noEmit`
- [ ] Protected routes load (manual or automated test)
- [ ] Auth flow works: sign up → sign in → redirect to /chat
- [ ] No secrets in `dist/` bundle

---

## 🔴 INCIDENT HISTORY

### Incident 001 (January 2026)
**Cause:** Hardcoded fallback Supabase key masked missing environment configuration  
**Impact:** White screen on production  
**Resolution:** Removed fallback, implemented fail-fast validation  
**Prevention:** This pact

---

## 📋 ENFORCEMENT

1. **CI Pipeline** checks for hardcoded secrets before merge
2. **Code Review** must verify compliance with this pact
3. **AI Agents** must read this file before suggesting changes
4. **Production Monitoring** alerts on increased error rates

---

## 🤝 AGREEMENT

By making changes to this codebase, AI agents agree to:

1. Read and understand this REGRESSION_PACT.md
2. Follow all seven immutable laws
3. Run the verification checklist before finalizing changes
4. Never mask errors with fallbacks
5. Never expose secrets in client code
6. Preserve all protected features

---

**Document maintained by:** The Lucy Lounge Engineering Team  
**Last updated:** January 25, 2026  
**Pact version:** 1.0.0
