import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Privacy-preserving error sanitizer
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

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "A prompt is required to generate an image.",
          imageBase64: null,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const HF_TOKEN = Deno.env.get("HF_TOKEN");
    if (!HF_TOKEN) {
      return new Response(
        JSON.stringify({
          error: sanitizeError("HF_TOKEN missing"),
          imageBase64: null,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("[hf-image-gen] Generating SDXL image for prompt:", prompt.substring(0, 100));

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
      const errorText = await response.text().catch(() => "");
      console.error("[hf-image-gen] HF API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Image generation is temporarily busy. Try again in a moment.",
            imageBase64: null,
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (response.status === 503) {
        return new Response(
          JSON.stringify({
            error: "The image model is loading. Please try again in 20-30 seconds.",
            imageBase64: null,
          }),
          {
            status: 503,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({
          error: sanitizeError(`HF API returned ${response.status}`),
          imageBase64: null,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Response is binary image data
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Convert bytes -> base64 safely
    const base64 = encodeBase64(bytes);
    const imageBase64 = `data:image/png;base64,${base64}`;

    console.log("[hf-image-gen] Image generated successfully, size:", bytes.byteLength);

    return new Response(
      JSON.stringify({
        imageBase64,
        prompt: prompt.trim(),
        model: "SDXL",
        success: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[hf-image-gen] Generation failed:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("rate") || errorMessage.includes("429")) {
      return new Response(
        JSON.stringify({
          error: "Image generation is temporarily busy. Try again in a moment.",
          imageBase64: null,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: sanitizeError(error),
        imageBase64: null,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
