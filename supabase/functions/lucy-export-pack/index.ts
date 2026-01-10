import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  const { video_url } = await req.json();
  if (!video_url) {
    return new Response(JSON.stringify({ error: "Missing video_url" }), { status: 400 });
  }

  return new Response(
    JSON.stringify({
      presets: [
        { name: "TikTok", ratio: "9:16", resolution: "1080x1920", url: video_url },
        { name: "Instagram Reels", ratio: "9:16", resolution: "1080x1920", url: video_url },
        { name: "YouTube Shorts", ratio: "9:16", resolution: "1080x1920", url: video_url },
        { name: "X (Twitter)", ratio: "1:1", resolution: "1080x1080", url: video_url },
      ],
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
