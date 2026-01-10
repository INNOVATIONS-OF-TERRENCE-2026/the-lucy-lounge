import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const { prompt, style = "cinematic" } = await req.json();
  if (!prompt) {
    return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400 });
  }

  const enhanced = `${prompt}. Cinematic lighting, smooth camera motion, ultra-detailed, HDR, professional color grading, ${style} style.`;

  return new Response(
    JSON.stringify({ enhanced_prompt: enhanced }),
    { headers: { "Content-Type": "application/json" } }
  );
});
