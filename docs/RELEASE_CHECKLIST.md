# Release Checklist

> Complete this checklist before every production deployment.
> Version: 1.0.0 | Last Updated: 2026-01-25

## Pre-Release

### Code Review

- [ ] All changes reviewed by another engineer
- [ ] No TODO/FIXME comments in changed code
- [ ] No console.log statements (except controlled logging)
- [ ] No hardcoded credentials or API keys
- [ ] All new features have error boundaries

### Type Safety

- [ ] `npm run type-check` passes
- [ ] No TypeScript errors
- [ ] No `any` types without justification

### Linting

- [ ] `npm run lint` passes
- [ ] No ESLint warnings in changed files
- [ ] Import order consistent

### Build

- [ ] `npm run build` succeeds
- [ ] No build warnings
- [ ] Bundle size within limits (< 500KB initial)

---

## Platform Testing

### iOS Safari (CRITICAL)

- [ ] Fresh load (incognito/private mode)
- [ ] No console errors on load
- [ ] Tap anywhere - no errors
- [ ] Play audio - works after first tap
- [ ] Navigate to /chat - no crash
- [ ] Sign in flow works
- [ ] Sign out flow works
- [ ] PWA install (Add to Home Screen)
- [ ] Open PWA from home screen
- [ ] PWA audio works after tap

### iOS Chrome

- [ ] Fresh load
- [ ] No console errors
- [ ] Audio works after tap
- [ ] Auth flow works

### Android Chrome

- [ ] Fresh load
- [ ] No console errors
- [ ] Audio works after tap
- [ ] Auth flow works
- [ ] PWA install prompt appears
- [ ] PWA works after install

### Desktop Chrome

- [ ] Fresh load
- [ ] No console errors
- [ ] All features work
- [ ] PWA install works

---

## Feature Verification

### Authentication

- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign out
- [ ] Protected routes redirect to auth
- [ ] After auth, redirect to intended page

### Chat

- [ ] Send text message
- [ ] Receive AI response
- [ ] Message history loads
- [ ] New conversation starts clean

### Audio/Media

- [ ] Background music plays (after interaction)
- [ ] Volume control works
- [ ] Pause/play works
- [ ] No audio on load (before interaction)

### PWA

- [ ] Service worker registers
- [ ] App installable
- [ ] Offline banner shows when offline
- [ ] Basic navigation works offline
- [ ] Chat shows offline message

---

## Error Scenarios

### Network Failures

- [ ] Offline - shows banner, doesn't crash
- [ ] Slow network - loads eventually
- [ ] API timeout - shows error, recoverable

### Invalid State

- [ ] Expired session - redirects to auth
- [ ] Invalid route - 404 or redirect
- [ ] Corrupted localStorage - recovers gracefully

### Edge Cases

- [ ] Very long message - handles correctly
- [ ] Special characters - escapes properly
- [ ] Empty responses - handles gracefully

---

## Performance

### Core Web Vitals

- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

### Bundle Size

- [ ] Initial JS < 400KB
- [ ] Initial CSS < 100KB
- [ ] Images optimized

---

## Security

- [ ] No sensitive data in console
- [ ] No API keys in source
- [ ] HTTPS enforced
- [ ] CORS configured correctly

---

## Documentation

- [ ] README updated if needed
- [ ] CHANGELOG updated
- [ ] Breaking changes documented

---

## Deployment

### Pre-Deploy

- [ ] All tests pass
- [ ] Staging environment tested
- [ ] Rollback plan ready

### Deploy

- [ ] Deploy to production
- [ ] Monitor error tracking
- [ ] Check analytics for anomalies

### Post-Deploy

- [ ] Smoke test production
- [ ] Verify all critical paths
- [ ] Monitor for 1 hour

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Reviewer | | | |
| QA | | | |

---

## Rollback Procedure

If critical issues found:

1. **Immediate**: Revert to previous deployment
2. **Communication**: Notify team
3. **Investigation**: Identify root cause
4. **Fix**: Create fix in new branch
5. **Re-deploy**: Go through this checklist again
