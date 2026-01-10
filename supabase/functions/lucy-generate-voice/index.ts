import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const { text, voice = "calm" } = await req.json();

  if (!text) {
    return new Response(JSON.stringify({ error: "Missing text" }), { status: 400 });
  }

  const audio_url = `https://cdn.lucylounge.ai/audio/${crypto.randomUUID()}.mp3`;

  return new Response(
    JSON.stringify({
      audio_url,
      voice,
      duration_seconds: Math.max(1, Math.floor(text.split(" ").length / 2.5)),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
