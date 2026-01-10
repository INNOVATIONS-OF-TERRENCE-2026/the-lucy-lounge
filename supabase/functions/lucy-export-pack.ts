import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const EXPORTS = {
  tiktok: "9:16",
  instagram: "9:16",
  youtube: "16:9",
  twitter: "16:9",
  facebook: "9:16",
};

serve(async (req) => {
  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return new Response(JSON.stringify({ error: "Missing video URL" }), {
        status: 400,
      });
    }

    const exportUrls: Record<string, string> = {};
    Object.keys(EXPORTS).forEach((platform) => {
      exportUrls[platform] = `${videoUrl}?export=${platform}`;
    });

    return new Response(
      JSON.stringify({ success: true, exportUrls }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Export failed" }),
      { status: 500 }
    );
  }
});
