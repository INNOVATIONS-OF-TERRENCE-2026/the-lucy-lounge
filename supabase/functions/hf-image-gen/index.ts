import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function sanitizeError(error: unknown): string {
  console.error("[hf-image-gen][INTERNAL ERROR]", error);
  return "I couldn't generate that image right now, but I've got you — try again in a moment.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body?.prompt;
    const negativePrompt = body?.negativePrompt;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(JSON.stringify({ error: "Prompt is required", imageBase64: null }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const HF_TOKEN = Deno.env.get("HF_TOKEN");
    if (!HF_TOKEN) {
      return new Response(JSON.stringify({ error: sanitizeError("HF_TOKEN missing"), imageBase64: null }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt.trim(),
          parameters: {
            negative_prompt: negativePrompt || "blurry, low quality, distorted, watermark, text",
            num_inference_steps: 30,
            guidance_scale: 7.5,
            width: 1024,
            height: 1024,
          },
        }),
      },
    );

    if (!response.ok) {
      const txt = await response.text().catch(() => "");
      console.error("[hf-image-gen] HF error:", response.status, txt);

      return new Response(
        JSON.stringify({
          error: "Image generation is temporarily unavailable",
          imageBase64: null,
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ✅ CORRECT DENO-SAFE BASE64 CONVERSION
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return new Response(
      JSON.stringify({
        success: true,
        model: "SDXL",
        prompt: prompt.trim(),
        imageBase64: `data:image/png;base64,${base64}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: sanitizeError(error), imageBase64: null }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
