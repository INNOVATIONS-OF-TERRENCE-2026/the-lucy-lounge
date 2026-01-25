# Production Spec v1

> **FROZEN CONSTITUTION**: Changes to this spec require explicit approval.
> Version: 1.0.0 | Last Updated: 2026-01-25

## Overview

This document defines the **guaranteed behavior** of Lucy AI in production.
Any change that violates this spec is a **breaking change** and requires:
1. Explicit documentation of the change
2. Migration path for existing users
3. Verification on all supported platforms

---

## Supported Platforms

### Tier 1 (Must Work Perfectly)

| Platform | Browser | Version |
|----------|---------|---------|
| iOS | Safari | 15+ |
| iOS | Chrome | Latest |
| Android | Chrome | Latest |
| Desktop | Chrome | Latest |
| Desktop | Edge | Latest |

### Tier 2 (Should Work)

| Platform | Browser | Version |
|----------|---------|---------|
| Desktop | Safari | Latest |
| Desktop | Firefox | Latest |
| Android | Firefox | Latest |

---

## Guaranteed Routes

These routes MUST work on all Tier 1 platforms:

| Route | Auth Required | Offline Support |
|-------|---------------|-----------------|
| `/` | No | Yes (cached) |
| `/auth` | No | No |
| `/chat` | Yes | Partial |
| `/features` | No | Yes |
| `/pricing` | No | Yes |
| `/about` | No | Yes |
| `/blog` | No | Yes |
| `/tools` | Yes | Partial |

---

## Boot Sequence

The application MUST boot in this exact order:

```
1. initViewportFix()           ← Mobile viewport fix
2. <React.StrictMode>
   3. <RootErrorBoundary>      ← Catches ALL errors
      4. <SupabaseGuard>       ← Validates environment
         5. <App>              ← Application logic
            6. <UserGestureGateProvider>
               7. <SafeMediaGateProvider>
                  8. Routes...
```

### Boot Guarantees

- Boot sequence completes in < 3 seconds on 3G
- No errors thrown at module import time
- RootErrorBoundary catches any error
- User NEVER sees a white screen

---

## Auth Flow

### Sign Up

1. User navigates to `/auth`
2. User enters email/password
3. Supabase creates account
4. Redirect to `/chat`

### Sign In

1. User navigates to `/auth`
2. User enters credentials
3. Supabase authenticates
4. Redirect to `/chat`

### Sign Out

1. User clicks sign out
2. Supabase session cleared
3. Local storage cleared (auth only)
4. Redirect to `/`

### Protected Routes

Accessing a protected route without auth:
- Redirect to `/auth`
- Store intended destination
- After auth, redirect to destination

---

## Media Policy

### Audio

| Action | Allowed At |
|--------|------------|
| Check support | Page load |
| Create AudioContext | After gesture |
| Play audio | After gesture |
| Access microphone | After gesture + permission |

### Video

| Action | Allowed At |
|--------|------------|
| Check support | Page load |
| Autoplay muted | Page load |
| Autoplay unmuted | After gesture |
| Access camera | After gesture + permission |

---

## Error Handling

### Error Hierarchy

1. **RootErrorBoundary** - Catches everything
2. **RouteErrorBoundary** - Per-route errors
3. **FeatureErrorBoundary** - Per-feature errors
4. **Try/catch** - Local error handling

### Error UI

| Error Type | UI Shown |
|------------|----------|
| Fatal crash | "Lucy needs a moment..." |
| Network error | "You're offline" banner |
| Auth error | Redirect to `/auth` |
| Feature error | Feature disabled, rest works |

---

## PWA Behavior

### Installation

| Platform | Method |
|----------|--------|
| iOS Safari | Add to Home Screen (manual) |
| Android Chrome | Install prompt |
| Desktop Chrome | Install button |

### Offline Mode

| Feature | Offline Behavior |
|---------|-----------------|
| Shell | Always renders |
| Past chats | From cache |
| New messages | Queued |
| AI responses | "Offline" message |

---

## Performance Targets

### Core Web Vitals

| Metric | Target | Maximum |
|--------|--------|---------|
| LCP | < 2.5s | 4s |
| FID | < 100ms | 300ms |
| CLS | < 0.1 | 0.25 |
| TTFB | < 600ms | 1800ms |

### Bundle Size

| Asset | Target | Maximum |
|-------|--------|---------|
| Initial JS | < 200KB | 400KB |
| Initial CSS | < 50KB | 100KB |
| Total initial | < 500KB | 1MB |

---

## Security

### Required

- HTTPS only (enforced by Supabase)
- No credentials in localStorage
- CSP headers configured
- XSS protection enabled
- CORS configured correctly

### Forbidden

- Hardcoded API keys in client code
- Storing tokens in localStorage
- Eval or Function constructors
- Inline scripts without nonce

---

## Accessibility

### Required

- Keyboard navigation works
- Screen reader compatible
- Color contrast meets WCAG AA
- Focus indicators visible
- Form labels present

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-25 | Initial spec |

---

## Compliance Verification

Before any release:

```bash
# Run verification checklist
npm run verify:production

# Manual tests
- [ ] iOS Safari cold boot
- [ ] iOS Safari audio after tap
- [ ] Android Chrome cold boot
- [ ] Desktop Chrome cold boot
- [ ] Auth flow all platforms
- [ ] PWA install all platforms
- [ ] Offline mode
- [ ] Error recovery
```
