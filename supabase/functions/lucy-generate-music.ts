import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  try {
    const { mood, duration } = await req.json();

    const musicUrl = `https://cdn.lucylounge.ai/music/${mood || "cinematic"}_${duration || 10}.mp3`;

    return new Response(
      JSON.stringify({
        success: true,
        musicUrl,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("lucy-generate-music error", err);
    return new Response(
      JSON.stringify({ error: "Music generation failed" }),
      { status: 500 }
    );
  }
});
