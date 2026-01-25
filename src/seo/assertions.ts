/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SEO RUNTIME ASSERTIONS                                   │
 * │                                                                             │
 * │ Runtime validation that BLOCKS SEO-breaking changes                        │
 * │ If SEO breaks, the app tells you immediately.                              │
 * │                                                                             │
 * │ No silent regressions. Ever.                                               │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type { SEOAuditResult, SEOIssue, Schema, SchemaType } from './types';
import { LUCY_BRAND, NO_INDEX_PATHS, SEO_DEFAULTS } from './types';
import { validateSchema } from './schemas';

// =============================================================================
// ASSERTION CONFIGURATION
// =============================================================================

const ASSERTION_CONFIG = {
  // Throw errors in development, warn in production
  throwOnError: process.env.NODE_ENV === 'development',
  
  // Required meta elements
  requiredMeta: ['title', 'description', 'canonical'],
  
  // Title constraints
  minTitleLength: 20,
  maxTitleLength: 60,
  
  // Description constraints
  minDescriptionLength: 50,
  maxDescriptionLength: 160,
  
  // Performance thresholds
  maxLCP: 2500,       // 2.5 seconds
  maxINP: 200,        // 200ms
  maxCLS: 0.1,
  
  // Schema requirements by page type
  requiredSchemasByPage: {
    home: ['WebSite', 'Organization', 'SoftwareApplication'],
    media: ['Movie', 'TVSeries', 'VideoObject'],
    listening: ['MusicRecording', 'MusicAlbum', 'PodcastSeries', 'Audiobook'],
    explore: ['CollectionPage', 'ItemList'],
  } as Record<string, SchemaType[]>,
};

// =============================================================================
// ASSERTION FUNCTIONS
// =============================================================================

/**
 * Assert that a page has required meta tags
 */
export function assertMetaTagsPresent(
  path: string,
  meta: {
    title?: string;
    description?: string;
    canonical?: string;
  }
): SEOIssue[] {
  const issues: SEOIssue[] = [];
  
  // Skip no-index pages
  if (NO_INDEX_PATHS.some(p => path.startsWith(p))) {
    return issues;
  }
  
  // Title check
  if (!meta.title) {
    issues.push({
      code: 'MISSING_TITLE',
      message: `Page ${path} is missing a title tag`,
      severity: 'error',
      element: '<title>',
      recommendation: 'Add a unique, descriptive title under 60 characters',
    });
  } else {
    // Title length validation
    if (meta.title.length < ASSERTION_CONFIG.minTitleLength) {
      issues.push({
        code: 'TITLE_TOO_SHORT',
        message: `Title on ${path} is too short (${meta.title.length} chars)`,
        severity: 'warning',
        element: '<title>',
        recommendation: `Expand title to at least ${ASSERTION_CONFIG.minTitleLength} characters`,
      });
    }
    if (meta.title.length > ASSERTION_CONFIG.maxTitleLength) {
      issues.push({
        code: 'TITLE_TOO_LONG',
        message: `Title on ${path} is too long (${meta.title.length} chars)`,
        severity: 'warning',
        element: '<title>',
        recommendation: `Shorten title to under ${ASSERTION_CONFIG.maxTitleLength} characters`,
      });
    }
  }
  
  // Description check
  if (!meta.description) {
    issues.push({
      code: 'MISSING_DESCRIPTION',
      message: `Page ${path} is missing a meta description`,
      severity: 'error',
      element: '<meta name="description">',
      recommendation: 'Add a compelling meta description between 50-160 characters',
    });
  } else {
    if (meta.description.length < ASSERTION_CONFIG.minDescriptionLength) {
      issues.push({
        code: 'DESCRIPTION_TOO_SHORT',
        message: `Description on ${path} is too short (${meta.description.length} chars)`,
        severity: 'warning',
        element: '<meta name="description">',
        recommendation: `Expand description to at least ${ASSERTION_CONFIG.minDescriptionLength} characters`,
      });
    }
    if (meta.description.length > ASSERTION_CONFIG.maxDescriptionLength) {
      issues.push({
        code: 'DESCRIPTION_TOO_LONG',
        message: `Description on ${path} is too long (${meta.description.length} chars)`,
        severity: 'warning',
        element: '<meta name="description">',
        recommendation: `Shorten description to under ${ASSERTION_CONFIG.maxDescriptionLength} characters`,
      });
    }
  }
  
  // Canonical check (CRITICAL)
  if (!meta.canonical) {
    issues.push({
      code: 'MISSING_CANONICAL',
      message: `Page ${path} is missing a canonical URL`,
      severity: 'error',
      element: '<link rel="canonical">',
      recommendation: 'Add a canonical URL pointing to the preferred version of this page',
    });
  } else {
    // Validate canonical format
    if (!meta.canonical.startsWith(LUCY_BRAND.url)) {
      issues.push({
        code: 'INVALID_CANONICAL_DOMAIN',
        message: `Canonical on ${path} points to wrong domain: ${meta.canonical}`,
        severity: 'error',
        element: '<link rel="canonical">',
        recommendation: `Canonical must start with ${LUCY_BRAND.url}`,
      });
    }
    
    // Check for http vs https
    if (meta.canonical.startsWith('http://')) {
      issues.push({
        code: 'INSECURE_CANONICAL',
        message: `Canonical on ${path} uses HTTP instead of HTTPS`,
        severity: 'error',
        element: '<link rel="canonical">',
        recommendation: 'Use HTTPS for canonical URLs',
      });
    }
  }
  
  return issues;
}

/**
 * Assert that required schemas are present
 */
export function assertSchemasPresent(
  path: string,
  schemas: Schema[],
  pageType?: keyof typeof ASSERTION_CONFIG.requiredSchemasByPage
): SEOIssue[] {
  const issues: SEOIssue[] = [];
  
  // No schemas at all
  if (!schemas || schemas.length === 0) {
    issues.push({
      code: 'MISSING_SCHEMAS',
      message: `Page ${path} has no JSON-LD schemas`,
      severity: 'error',
      element: '<script type="application/ld+json">',
      recommendation: 'Add appropriate JSON-LD structured data',
    });
    return issues;
  }
  
  // Validate each schema
  schemas.forEach((schema, index) => {
    const validation = validateSchema(schema);
    if (!validation.valid) {
      validation.errors.forEach(error => {
        issues.push({
          code: 'INVALID_SCHEMA',
          message: `Schema #${index + 1} on ${path}: ${error}`,
          severity: 'error',
          element: `<script type="application/ld+json"> (schema ${index + 1})`,
          recommendation: 'Fix the schema according to schema.org specifications',
        });
      });
    }
  });
  
  // Check for required schemas by page type
  if (pageType && ASSERTION_CONFIG.requiredSchemasByPage[pageType]) {
    const schemaTypes = schemas.flatMap(s => {
      const type = s['@type'];
      return Array.isArray(type) ? type : [type];
    });
    
    const requiredTypes = ASSERTION_CONFIG.requiredSchemasByPage[pageType];
    const missingTypes = requiredTypes.filter(t => !schemaTypes.includes(t));
    
    if (missingTypes.length > 0) {
      issues.push({
        code: 'MISSING_REQUIRED_SCHEMA_TYPE',
        message: `Page ${path} is missing required schema types: ${missingTypes.join(', ')}`,
        severity: 'warning',
        element: '<script type="application/ld+json">',
        recommendation: `Add ${missingTypes.join(', ')} schema(s) for this page type`,
      });
    }
  }
  
  return issues;
}

/**
 * Assert no duplicate titles across pages
 */
export function assertNoDuplicateTitles(
  pageTitles: Map<string, string>
): SEOIssue[] {
  const issues: SEOIssue[] = [];
  const titleToPath = new Map<string, string[]>();
  
  pageTitles.forEach((title, path) => {
    const normalizedTitle = title.toLowerCase().trim();
    const paths = titleToPath.get(normalizedTitle) || [];
    paths.push(path);
    titleToPath.set(normalizedTitle, paths);
  });
  
  titleToPath.forEach((paths, title) => {
    if (paths.length > 1) {
      issues.push({
        code: 'DUPLICATE_TITLE',
        message: `Duplicate title "${title}" found on: ${paths.join(', ')}`,
        severity: 'error',
        element: '<title>',
        recommendation: 'Each page must have a unique title',
      });
    }
  });
  
  return issues;
}

/**
 * Assert Core Web Vitals within thresholds
 */
export function assertCoreWebVitals(metrics: {
  lcp?: number;
  inp?: number;
  cls?: number;
}): SEOIssue[] {
  const issues: SEOIssue[] = [];
  
  if (metrics.lcp && metrics.lcp > ASSERTION_CONFIG.maxLCP) {
    issues.push({
      code: 'LCP_EXCEEDED',
      message: `LCP is ${metrics.lcp}ms, exceeds ${ASSERTION_CONFIG.maxLCP}ms threshold`,
      severity: 'error',
      element: 'Largest Contentful Paint',
      recommendation: 'Optimize images, reduce render-blocking resources, improve server response time',
    });
  }
  
  if (metrics.inp && metrics.inp > ASSERTION_CONFIG.maxINP) {
    issues.push({
      code: 'INP_EXCEEDED',
      message: `INP is ${metrics.inp}ms, exceeds ${ASSERTION_CONFIG.maxINP}ms threshold`,
      severity: 'error',
      element: 'Interaction to Next Paint',
      recommendation: 'Reduce JavaScript execution time, break up long tasks',
    });
  }
  
  if (metrics.cls && metrics.cls > ASSERTION_CONFIG.maxCLS) {
    issues.push({
      code: 'CLS_EXCEEDED',
      message: `CLS is ${metrics.cls}, exceeds ${ASSERTION_CONFIG.maxCLS} threshold`,
      severity: 'error',
      element: 'Cumulative Layout Shift',
      recommendation: 'Reserve space for images, avoid inserting content above existing content',
    });
  }
  
  return issues;
}

/**
 * Assert robots.txt is valid
 */
export function assertRobotsTxt(content: string): SEOIssue[] {
  const issues: SEOIssue[] = [];
  
  // Must have User-agent directive
  if (!content.includes('User-agent:')) {
    issues.push({
      code: 'MISSING_USER_AGENT',
      message: 'robots.txt is missing User-agent directive',
      severity: 'error',
      element: 'robots.txt',
      recommendation: 'Add User-agent: * directive',
    });
  }
  
  // Must have sitemap reference
  if (!content.toLowerCase().includes('sitemap:')) {
    issues.push({
      code: 'MISSING_SITEMAP_REFERENCE',
      message: 'robots.txt should reference the sitemap',
      severity: 'warning',
      element: 'robots.txt',
      recommendation: 'Add Sitemap: https://thelucylounge.com/sitemap.xml',
    });
  }
  
  // Check for accidental blocking of important paths
  const criticalPaths = ['/', '/explore', '/listening', '/media'];
  criticalPaths.forEach(path => {
    if (content.includes(`Disallow: ${path}`) && !content.includes(`Allow: ${path}`)) {
      issues.push({
        code: 'CRITICAL_PATH_BLOCKED',
        message: `robots.txt blocks critical path: ${path}`,
        severity: 'error',
        element: 'robots.txt',
        recommendation: `Remove or modify Disallow rule for ${path}`,
      });
    }
  });
  
  return issues;
}

// =============================================================================
// FULL PAGE AUDIT
// =============================================================================

/**
 * Run complete SEO audit on a page
 */
export function runPageAudit(
  path: string,
  options: {
    title?: string;
    description?: string;
    canonical?: string;
    schemas?: Schema[];
    pageType?: keyof typeof ASSERTION_CONFIG.requiredSchemasByPage;
    metrics?: { lcp?: number; inp?: number; cls?: number };
  }
): SEOAuditResult {
  const issues: SEOIssue[] = [];
  const warnings: SEOIssue[] = [];
  
  // Meta tag assertions
  const metaIssues = assertMetaTagsPresent(path, {
    title: options.title,
    description: options.description,
    canonical: options.canonical,
  });
  
  // Schema assertions
  const schemaIssues = options.schemas 
    ? assertSchemasPresent(path, options.schemas, options.pageType)
    : [{
        code: 'NO_SCHEMAS_PROVIDED',
        message: 'No schemas provided for audit',
        severity: 'warning' as const,
        element: 'schemas',
        recommendation: 'Add JSON-LD schemas to the page',
      }];
  
  // Performance assertions
  const performanceIssues = options.metrics 
    ? assertCoreWebVitals(options.metrics)
    : [];
  
  // Categorize issues
  [...metaIssues, ...schemaIssues, ...performanceIssues].forEach(issue => {
    if (issue.severity === 'error') {
      issues.push(issue);
    } else {
      warnings.push(issue);
    }
  });
  
  // Throw in development if critical errors
  if (ASSERTION_CONFIG.throwOnError && issues.length > 0) {
    const errorMessages = issues.map(i => `[${i.code}] ${i.message}`).join('\n');
    console.error(`[SEO ASSERTION FAILED] ${path}\n${errorMessages}`);
    
    // In strict mode, throw
    if (process.env.VITE_SEO_STRICT === 'true') {
      throw new Error(`SEO assertions failed for ${path}:\n${errorMessages}`);
    }
  }
  
  return {
    url: path,
    timestamp: new Date(),
    hasTitle: !!options.title,
    titleLength: options.title?.length || 0,
    hasDescription: !!options.description,
    descriptionLength: options.description?.length || 0,
    hasCanonical: !!options.canonical,
    canonicalValid: options.canonical?.startsWith(LUCY_BRAND.url) || false,
    hasSchemas: (options.schemas?.length || 0) > 0,
    schemaTypes: options.schemas?.flatMap(s => {
      const type = s['@type'];
      return Array.isArray(type) ? type : [type];
    }) || [],
    schemaValid: schemaIssues.filter(i => i.severity === 'error').length === 0,
    lcp: options.metrics?.lcp,
    fid: options.metrics?.inp,
    cls: options.metrics?.cls,
    issues,
    warnings,
  };
}

// =============================================================================
// DEVELOPMENT HELPERS
// =============================================================================

/**
 * Log SEO audit results to console
 */
export function logAuditResults(result: SEOAuditResult): void {
  const style = result.issues.length > 0 ? 'color: red' : 'color: green';
  
  console.group(`%c[SEO Audit] ${result.url}`, style);
  
  console.log('Meta:', {
    title: result.hasTitle ? `✓ (${result.titleLength} chars)` : '✗ MISSING',
    description: result.hasDescription ? `✓ (${result.descriptionLength} chars)` : '✗ MISSING',
    canonical: result.hasCanonical ? (result.canonicalValid ? '✓' : '✗ INVALID') : '✗ MISSING',
  });
  
  console.log('Schemas:', {
    present: result.hasSchemas ? '✓' : '✗',
    types: result.schemaTypes,
    valid: result.schemaValid ? '✓' : '✗',
  });
  
  if (result.lcp || result.cls) {
    console.log('Performance:', {
      LCP: result.lcp ? `${result.lcp}ms` : 'N/A',
      INP: result.fid ? `${result.fid}ms` : 'N/A',
      CLS: result.cls ?? 'N/A',
    });
  }
  
  if (result.issues.length > 0) {
    console.group('❌ Issues:');
    result.issues.forEach(i => console.error(`[${i.code}] ${i.message}`));
    console.groupEnd();
  }
  
  if (result.warnings.length > 0) {
    console.group('⚠️ Warnings:');
    result.warnings.forEach(w => console.warn(`[${w.code}] ${w.message}`));
    console.groupEnd();
  }
  
  console.groupEnd();
}
