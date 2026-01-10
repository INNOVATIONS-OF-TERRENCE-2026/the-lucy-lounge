import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  try {
    const { text, voice } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "Missing narration text" }), {
        status: 400,
      });
    }

    const audioUrl = `https://cdn.lucylounge.ai/voices/${voice || "cinematic"}.mp3`;

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("lucy-generate-voice error", err);
    return new Response(
      JSON.stringify({ error: "Voice generation failed" }),
      { status: 500 }
    );
  }
});
