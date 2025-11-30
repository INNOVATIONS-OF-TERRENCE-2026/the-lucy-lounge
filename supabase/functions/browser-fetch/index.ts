import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Privacy sanitizer
function sanitizeError(error: unknown): string {
  console.error('[INTERNAL ERROR]', error);
  return "Unable to fetch the requested page. Please verify the URL and try again.";
}

async function fetchAndParsePage(url: string) {
  if (!/^https?:\/\//i.test(url)) {
    throw new Error("Only http/https URLs are allowed");
  }

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "LucyLoungeBot/1.0 (https://lucylounge.org)",
      "Accept": "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  const html = await res.text();
  
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() ?? "(no title)";

  const withoutScripts = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");

  const text = withoutScripts
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    url,
    title,
    textPreview: text.slice(0, 20000),
    success: true,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url?.trim()) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[browser-fetch] Fetching:', url.substring(0, 100));

    const result = await fetchAndParsePage(url);

    return new Response(JSON.stringify({
      ok: true,
      ...result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[browser-fetch] Internal error:', error);
    return new Response(JSON.stringify({ 
      error: sanitizeError(error),
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
