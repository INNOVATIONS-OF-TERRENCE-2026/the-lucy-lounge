# The Lucy Lounge - Deployment Guide

> **Production URL:** https://thelucylounge.com  
> **Repository:** https://github.com/INNOVATIONS-OF-TERRENCE-2026/the-lucy-lounge

---

## 🚀 Deployment Overview

The Lucy Lounge uses a modern JAMstack architecture:
- **Frontend:** React + Vite, deployed to Vercel/Lovable
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **CDN:** Cloudflare for asset delivery

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key | ✅ |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | ✅ |
| `VITE_LOVABLE_API_KEY` | Lovable AI integration | ✅ |
| `VITE_SPOTIFY_CLIENT_ID` | Spotify OAuth client ID | ✅ |
| `VITE_OPENROUTER_API_KEY` | OpenRouter AI fallback | ⚠️ Optional |
| `VITE_SITE_URL` | Production domain | ✅ |

### 2. Supabase Setup

```bash
# Login to Supabase CLI
npx supabase login

# Link to project
npx supabase link --project-ref vabrcwdngngdbjmtpwxp

# Push database migrations
npx supabase db push

# Deploy Edge Functions
npx supabase functions deploy
```

### 3. Verify Build

```bash
# Install dependencies
npm install

# Type-check
npx tsc --noEmit

# Build for production
npm run build

# Preview locally
npm run preview
```

---

## 🔄 Deployment Process

### Standard Deployment (Automatic)

1. **Merge to `main`** triggers automatic deployment
2. CI workflow runs (type-check, lint, build)
3. Vercel/Lovable deploys production build
4. Cloudflare cache invalidated

### Manual Deployment

```bash
# Ensure on main branch
git checkout main
git pull origin main

# Verify build passes
npm run build

# Push to trigger deployment
git push origin main
```

### Emergency Hotfix

```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/issue-name

# Make minimal fix
# ...commit changes...

# Push and create PR
git push origin hotfix/issue-name

# After approval, merge to main
```

---

## 🔙 Rollback Strategy

### Via Vercel Dashboard

1. Go to Vercel project dashboard
2. Navigate to Deployments
3. Find previous stable deployment
4. Click "Promote to Production"

### Via Git

```bash
# Identify stable commit
git log --oneline -10

# Revert to previous commit
git revert HEAD
git push origin main

# Or hard reset (DANGER - rewrites history)
# git reset --hard <commit-sha>
# git push --force origin main
```

### Supabase Rollback

```bash
# List migrations
npx supabase migration list

# Rollback last migration (if supported)
npx supabase db reset --local  # Test locally first
```

---

## 🔒 Security Checklist

- [ ] `.env` file NOT committed to repository
- [ ] All secrets in Vercel/Lovable environment settings
- [ ] Supabase RLS policies enabled on all tables
- [ ] CORS settings configured for production domain
- [ ] Rate limiting enabled on Edge Functions

---

## 📊 Health Checks

### Frontend
- Home page loads: `https://thelucylounge.com/`
- Auth flow works: Login/Signup functional
- Cinematic features: Ambient audio, transitions active

### Backend
- Supabase connection: Check browser console for errors
- Edge Functions: Test chat AI responses
- Database: Verify data persistence

### Performance
- Lighthouse score: Aim for 90+ on Performance
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

---

## 🐛 Troubleshooting

### Build Failures

```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
npm ci
npm run build
```

### Supabase Connection Issues

1. Verify environment variables are set correctly
2. Check Supabase project status at supabase.com
3. Confirm RLS policies allow access

### Spotify Integration

1. Verify redirect URI in Spotify Developer Dashboard
2. Must include `https://thelucylounge.com/callback`
3. Check client ID matches environment variable

---

## 📞 Contacts

- **Repository Owner:** INNOVATIONS-OF-TERRENCE-2026
- **Supabase Project:** vabrcwdngngdbjmtpwxp
- **Domain Registrar:** Check DNS settings if domain issues

---

*Last updated: June 2025*
