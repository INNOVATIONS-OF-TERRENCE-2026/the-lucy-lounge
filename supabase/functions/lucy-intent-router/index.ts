import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  const { message } = await req.json();
  if (!message) {
    return new Response(JSON.stringify({ error: "Missing message" }), { status: 400 });
  }

  const keywords = ["video", "cinematic", "movie", "scene", "cutscene"];
  const text = message.toLowerCase();
  const matched = keywords.filter(k => text.includes(k));

  return new Response(
    JSON.stringify({ cinematic: matched.length > 0, matched }),
    { headers: { "Content-Type": "application/json" } }
  );
});
