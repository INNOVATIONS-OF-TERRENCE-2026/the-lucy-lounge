#!/usr/bin/env node
/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SEO AUDIT CLI                                            │
 * │                                                                             │
 * │ Run SEO validations as part of CI/CD pipeline.                             │
 * │                                                                             │
 * │ Usage:                                                                      │
 * │   npx ts-node scripts/seo-audit.ts                                         │
 * │   npm run seo:audit                                                         │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONFIGURATION
// =============================================================================

const DOMAIN = 'https://thelucylounge.com';

const REQUIRED_FILES = [
  'public/robots.txt',
  'public/sitemap.xml',
  'public/manifest.json',
];

const REQUIRED_PAGES = [
  '/',
  '/about',
  '/explore',
  '/listening',
  '/media',
  '/studios',
];

const FORBIDDEN_PATTERNS = [
  'lucylounge.org', // Must use thelucylounge.com
  'localhost:',     // No localhost references in production
  'http://',        // Must be HTTPS
];

// =============================================================================
// AUDIT FUNCTIONS
// =============================================================================

interface AuditResult {
  passed: boolean;
  checks: AuditCheck[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

interface AuditCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

function checkRequiredFiles(): AuditCheck[] {
  const checks: AuditCheck[] = [];
  
  for (const file of REQUIRED_FILES) {
    const filePath = path.resolve(process.cwd(), file);
    const exists = fs.existsSync(filePath);
    
    checks.push({
      name: `File: ${file}`,
      status: exists ? 'pass' : 'fail',
      message: exists ? 'File exists' : 'File missing',
    });
  }
  
  return checks;
}

function checkRobotsTxt(): AuditCheck[] {
  const checks: AuditCheck[] = [];
  const robotsPath = path.resolve(process.cwd(), 'public/robots.txt');
  
  if (!fs.existsSync(robotsPath)) {
    checks.push({
      name: 'robots.txt existence',
      status: 'fail',
      message: 'robots.txt not found',
    });
    return checks;
  }
  
  const content = fs.readFileSync(robotsPath, 'utf-8');
  
  // Check for sitemap reference
  const hasSitemap = content.includes('Sitemap:');
  checks.push({
    name: 'robots.txt sitemap reference',
    status: hasSitemap ? 'pass' : 'fail',
    message: hasSitemap ? 'Sitemap referenced' : 'No sitemap reference found',
  });
  
  // Check for user-agent directive
  const hasUserAgent = content.includes('User-agent:');
  checks.push({
    name: 'robots.txt user-agent',
    status: hasUserAgent ? 'pass' : 'fail',
    message: hasUserAgent ? 'User-agent directive present' : 'No user-agent directive',
  });
  
  // Check for admin disallow
  const hasAdminDisallow = content.includes('Disallow: /admin');
  checks.push({
    name: 'robots.txt admin protection',
    status: hasAdminDisallow ? 'pass' : 'warn',
    message: hasAdminDisallow ? 'Admin routes blocked' : 'Admin routes may be crawlable',
  });
  
  // Check for AI crawler permissions
  const aiCrawlers = ['GPTBot', 'PerplexityBot', 'Claude'];
  for (const crawler of aiCrawlers) {
    const mentionsCrawler = content.includes(crawler);
    checks.push({
      name: `robots.txt ${crawler} directive`,
      status: mentionsCrawler ? 'pass' : 'warn',
      message: mentionsCrawler ? `${crawler} explicitly handled` : `${crawler} not explicitly mentioned`,
    });
  }
  
  return checks;
}

function checkSitemapStructure(): AuditCheck[] {
  const checks: AuditCheck[] = [];
  const sitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml');
  
  if (!fs.existsSync(sitemapPath)) {
    checks.push({
      name: 'sitemap.xml existence',
      status: 'fail',
      message: 'sitemap.xml not found',
    });
    return checks;
  }
  
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  
  // Check for XML declaration
  const hasXmlDeclaration = content.startsWith('<?xml');
  checks.push({
    name: 'sitemap XML declaration',
    status: hasXmlDeclaration ? 'pass' : 'fail',
    message: hasXmlDeclaration ? 'Valid XML declaration' : 'Missing XML declaration',
  });
  
  // Check for urlset or sitemapindex
  const hasUrlset = content.includes('<urlset') || content.includes('<sitemapindex');
  checks.push({
    name: 'sitemap structure',
    status: hasUrlset ? 'pass' : 'fail',
    message: hasUrlset ? 'Valid sitemap structure' : 'Invalid sitemap structure',
  });
  
  // Check for HTTPS URLs
  const hasHttpsUrls = content.includes('https://thelucylounge.com');
  checks.push({
    name: 'sitemap HTTPS URLs',
    status: hasHttpsUrls ? 'pass' : 'fail',
    message: hasHttpsUrls ? 'Uses HTTPS URLs' : 'Missing or wrong domain URLs',
  });
  
  // Count URLs
  const urlMatches = content.match(/<loc>/g);
  const urlCount = urlMatches ? urlMatches.length : 0;
  checks.push({
    name: 'sitemap URL count',
    status: urlCount > 0 ? 'pass' : 'fail',
    message: `Found ${urlCount} URLs`,
  });
  
  return checks;
}

function checkForbiddenPatterns(): AuditCheck[] {
  const checks: AuditCheck[] = [];
  const srcDir = path.resolve(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    checks.push({
      name: 'Source directory',
      status: 'fail',
      message: 'src directory not found',
    });
    return checks;
  }
  
  const files = getAllFiles(srcDir, ['.ts', '.tsx', '.js', '.jsx']);
  
  for (const pattern of FORBIDDEN_PATTERNS) {
    let found = false;
    let foundIn = '';
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes(pattern) && !file.includes('node_modules')) {
        // Skip comments and console logs for localhost
        if (pattern === 'localhost:' && (content.includes('// localhost') || content.includes('console'))) {
          continue;
        }
        found = true;
        foundIn = file;
        break;
      }
    }
    
    checks.push({
      name: `Forbidden pattern: ${pattern}`,
      status: found ? 'fail' : 'pass',
      message: found ? `Found in ${foundIn}` : 'Not found in codebase',
    });
  }
  
  return checks;
}

function checkSEOModuleExports(): AuditCheck[] {
  const checks: AuditCheck[] = [];
  const seoIndexPath = path.resolve(process.cwd(), 'src/seo/index.ts');
  
  if (!fs.existsSync(seoIndexPath)) {
    checks.push({
      name: 'SEO module index',
      status: 'fail',
      message: 'src/seo/index.ts not found',
    });
    return checks;
  }
  
  const content = fs.readFileSync(seoIndexPath, 'utf-8');
  
  const requiredExports = [
    'generateGlobalSchemas',
    'generateMetaTags',
    'LUCY_BRAND',
    'serializeSchemas',
  ];
  
  for (const exportName of requiredExports) {
    const hasExport = content.includes(exportName);
    checks.push({
      name: `SEO export: ${exportName}`,
      status: hasExport ? 'pass' : 'fail',
      message: hasExport ? 'Exported' : 'Missing export',
    });
  }
  
  return checks;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...getAllFiles(fullPath, extensions));
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (e) {
    // Directory read failed
  }
  
  return files;
}

// =============================================================================
// MAIN AUDIT RUNNER
// =============================================================================

function runAudit(): AuditResult {
  console.log('\n🔍 LUCY LOUNGE SEO AUDIT\n');
  console.log('═'.repeat(60));
  
  const allChecks: AuditCheck[] = [
    ...checkRequiredFiles(),
    ...checkRobotsTxt(),
    ...checkSitemapStructure(),
    ...checkForbiddenPatterns(),
    ...checkSEOModuleExports(),
  ];
  
  // Print results
  for (const check of allChecks) {
    const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${check.name}: ${check.message}`);
  }
  
  console.log('\n' + '═'.repeat(60));
  
  // Calculate summary
  const summary = {
    total: allChecks.length,
    passed: allChecks.filter(c => c.status === 'pass').length,
    failed: allChecks.filter(c => c.status === 'fail').length,
    warnings: allChecks.filter(c => c.status === 'warn').length,
  };
  
  console.log(`\n📊 SUMMARY`);
  console.log(`   Total:    ${summary.total}`);
  console.log(`   Passed:   ${summary.passed} ✅`);
  console.log(`   Failed:   ${summary.failed} ❌`);
  console.log(`   Warnings: ${summary.warnings} ⚠️`);
  
  const passed = summary.failed === 0;
  
  if (passed) {
    console.log('\n✨ SEO AUDIT PASSED\n');
  } else {
    console.log('\n💥 SEO AUDIT FAILED\n');
  }
  
  return {
    passed,
    checks: allChecks,
    summary,
  };
}

// =============================================================================
// EXECUTE
// =============================================================================

const result = runAudit();
process.exit(result.passed ? 0 : 1);
