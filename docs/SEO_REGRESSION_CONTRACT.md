# THE LUCY LOUNGE — SEO REGRESSION CONTRACT
## A Living Document for SEO Governance & Quality Assurance

> **Last Updated:** January 2025  
> **Enforced By:** CI/CD Pipeline + Runtime Assertions  
> **Owned By:** Platform Engineering Team

---

## 🎯 Purpose

This document defines the **SEO regression contract** for The Lucy Lounge. It establishes:
- Mandatory SEO requirements that MUST be present on all pages
- Automated checks that run on every deployment
- Performance thresholds that cannot be violated
- Schema requirements by page type

**Violation of this contract blocks deployment.**

---

## 📋 Global SEO Requirements

### 1. Meta Tags (ALL PAGES)

Every page MUST have:

| Meta Tag | Requirement | Max Length |
|----------|-------------|------------|
| `<title>` | Present, unique, includes "Lucy" | 60 chars |
| `<meta name="description">` | Present, unique, compelling | 160 chars |
| `<link rel="canonical">` | Present, absolute URL | N/A |
| `<meta name="robots">` | Present (index,follow or noindex) | N/A |
| `<meta name="viewport">` | `width=device-width, initial-scale=1` | N/A |
| `<meta charset>` | `UTF-8` | N/A |

### 2. Open Graph Tags (ALL PAGES)

| OG Tag | Requirement |
|--------|-------------|
| `og:title` | Present, matches or similar to `<title>` |
| `og:description` | Present, matches or similar to meta description |
| `og:type` | Present (`website`, `video.movie`, `music.song`, etc.) |
| `og:url` | Present, matches canonical |
| `og:image` | Present, absolute URL, min 1200x630 |
| `og:site_name` | `Lucy Lounge` |

### 3. Twitter Card Tags (ALL PAGES)

| Twitter Tag | Requirement |
|-------------|-------------|
| `twitter:card` | `summary_large_image` or `summary` |
| `twitter:site` | `@TheLucyLounge` |
| `twitter:title` | Present |
| `twitter:description` | Present |
| `twitter:image` | Present (same as og:image) |

---

## 🏗️ Schema Requirements by Page Type

### Home Page (`/`)

Required schemas:
- `SoftwareApplication` (Lucy as product)
- `Organization` (Lucy Lounge brand)
- `WebSite` (with SearchAction)
- `FAQPage` (common questions)

### Explore Pages (`/explore/*`)

Required schemas:
- `CollectionPage`
- `ItemList` (with items)
- `BreadcrumbList`

### Media Detail Pages (`/media/*`)

Required schemas (by media type):
- Movies: `Movie`
- TV Shows: `TVSeries`
- Music: `MusicRecording` or `MusicAlbum`
- Podcasts: `PodcastSeries` or `PodcastEpisode`
- Audiobooks: `Audiobook`

Plus:
- `BreadcrumbList`
- `Review` (if ratings available)

### Listening Pages (`/listening/*`)

Required schemas:
- `ItemList`
- `BreadcrumbList`
- Audio-specific schema (`MusicPlaylist`, `PodcastSeries`, etc.)

### Discovery Pages (`/discover/*`)

Required schemas:
- `ItemList`
- `BreadcrumbList`
- Optional: `FAQPage` for intent queries

---

## ⚡ Core Web Vitals Thresholds

**These thresholds are enforced in CI and must pass:**

| Metric | Target | Maximum Allowed |
|--------|--------|-----------------|
| **LCP** (Largest Contentful Paint) | < 2.0s | < 2.5s |
| **INP** (Interaction to Next Paint) | < 200ms | < 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.05 | < 0.1 |
| **FCP** (First Contentful Paint) | < 1.5s | < 2.0s |
| **TTFB** (Time to First Byte) | < 600ms | < 800ms |

### Testing Requirements

- Lighthouse score MUST be > 90 for Performance, SEO, Accessibility
- Run against mobile viewport (375px width)
- Test on 3G throttled connection

---

## 🔍 Crawlability Requirements

### robots.txt

- File MUST exist at `/robots.txt`
- MUST allow Googlebot, Bingbot, PerplexityBot, GPTBot
- MUST disallow `/admin/`, `/api/`, `/auth/`, `/settings/`
- MUST reference all sitemaps

### Sitemap

- Sitemap index MUST exist at `/sitemap.xml`
- Individual sitemaps:
  - `/sitemap-pages.xml` — Static pages
  - `/sitemap-moods.xml` — Mood exploration pages
  - `/sitemap-genres.xml` — Genre exploration pages
  - `/sitemap-journeys.xml` — Journey pages
  - `/sitemap-discover.xml` — Discovery intent pages
- All URLs MUST be absolute
- All URLs MUST return 200 status

### Internal Linking

- Maximum crawl depth: **3 clicks** from homepage
- Every page MUST link to:
  - Homepage
  - Explore hub
  - At least 3 related pages
- Orphan pages are **FORBIDDEN**

---

## 🤖 AI Search Optimization Requirements

### Entity Definition

Every page MUST include a clear definition of Lucy that AI can extract:

```html
<div itemscope itemtype="https://schema.org/SoftwareApplication">
  <meta itemprop="name" content="Lucy">
  <meta itemprop="applicationCategory" content="EntertainmentApplication">
  <span itemprop="description">
    Lucy is an AI-powered media intelligence platform that helps users 
    discover movies, music, podcasts, and audiobooks through personalized 
    recommendations.
  </span>
</div>
```

### FAQ Content

Pages with FAQ content MUST:
- Use `FAQPage` schema
- Structure questions as H3 elements
- Provide concise, factual answers
- Target featured snippet format (40-60 words)

### Citable Facts

Content MUST include citable facts that AI can reference:
- Numeric data with context
- Comparisons with alternatives
- Unique value propositions

---

## 🚫 Forbidden Practices

The following will **FAIL CI**:

1. **Duplicate titles** across pages
2. **Duplicate meta descriptions** across pages
3. **Missing canonical tags**
4. **Non-absolute canonical URLs**
5. **Schema validation errors** (invalid JSON-LD)
6. **Missing alt text** on images
7. **Orphan pages** (no internal links pointing to them)
8. **Redirect chains** (> 1 redirect)
9. **Mixed content** (HTTP resources on HTTPS pages)
10. **Broken internal links**

---

## 🧪 CI/CD Integration

### Pre-Deploy Checks

```bash
# 1. Run SEO assertions
npm run seo:audit

# 2. Validate all schemas
npm run seo:validate-schemas

# 3. Check for duplicate content
npm run seo:check-duplicates

# 4. Verify sitemap URLs
npm run seo:verify-sitemap

# 5. Run Lighthouse CI
npm run lighthouse:ci
```

### Runtime Assertions

In development, the `useSEO` hook and runtime assertions will:
- Log warnings for missing meta tags
- Throw errors for critical SEO violations
- Display Core Web Vitals in console

### Post-Deploy Monitoring

- Google Search Console alerts for coverage issues
- Automated crawl monitoring via Screaming Frog
- Weekly SEO health report generation

---

## 📊 SEO Health Metrics

Track these metrics weekly:

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Indexed Pages | Increasing | Decrease > 5% |
| Crawl Budget Usage | > 90% | < 80% |
| Core Web Vitals Pass Rate | 100% | < 95% |
| Schema Validation | 100% | < 100% |
| Canonical Consistency | 100% | < 100% |

---

## 🔄 Amendment Process

To modify this contract:

1. Create PR with proposed changes
2. Document rationale and expected impact
3. Run full SEO audit on staging
4. Obtain approval from:
   - Platform Lead
   - SEO Lead
   - Product Owner
5. Update all automated checks
6. Deploy to production
7. Monitor for 7 days

---

## 📚 Related Documentation

- [src/seo/types.ts](../src/seo/types.ts) — SEO type definitions
- [src/seo/schemas.ts](../src/seo/schemas.ts) — JSON-LD generators
- [src/seo/assertions.ts](../src/seo/assertions.ts) — Runtime checks
- [src/hooks/useSEO.ts](../src/hooks/useSEO.ts) — React SEO hook
- [public/robots.txt](../public/robots.txt) — Crawl directives
- [public/sitemap.xml](../public/sitemap.xml) — Sitemap index

---

## ✅ Checklist for New Pages

Before deploying a new page type:

- [ ] Title tag present and unique
- [ ] Meta description present and unique
- [ ] Canonical tag present with absolute URL
- [ ] Open Graph tags complete
- [ ] Twitter Card tags complete
- [ ] Appropriate JSON-LD schema(s) added
- [ ] Breadcrumb navigation present
- [ ] Internal links to/from related pages
- [ ] Added to sitemap
- [ ] Lighthouse score > 90
- [ ] Schema validates at schema.org validator
- [ ] Mobile rendering verified
- [ ] Page indexed in Search Console

---

**Remember:** SEO is not an afterthought. It's architecture.

*Lucy doesn't chase traffic. Traffic flows to Lucy.*
