/**
 * Lucy Browser - Safe web page fetching and parsing
 * Server-side only for security
 */

import type { BrowserFetchResult } from './lucyTools';

export async function fetchAndParsePage(url: string): Promise<BrowserFetchResult> {
  if (!/^https?:\/\//i.test(url)) {
    throw new Error("Only http/https URLs are allowed");
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "LucyLoungeBot/1.0 (https://lucylounge.org)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);
    }

    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch?.[1]?.trim() ?? "(no title)";

    // Remove scripts and styles
    const withoutScripts = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ");

    // Extract text content
    const text = withoutScripts
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const textPreview = text.slice(0, 20000);

    return {
      url,
      title,
      textPreview,
      success: true,
    };
  } catch (error) {
    console.error('[Browser] Fetch failed:', error);
    return {
      url,
      title: "Error",
      textPreview: error instanceof Error ? error.message : "Failed to fetch page",
      success: false,
    };
  }
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }
    return parsed.href;
  } catch {
    throw new Error('Invalid URL format');
  }
}
