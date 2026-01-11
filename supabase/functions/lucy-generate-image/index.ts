import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.3.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, model = "flux", style = "cinematic", width = 1024, height = 1024 } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const HF_TOKEN = Deno.env.get("HF_TOKEN");
    if (!HF_TOKEN) {
      console.error("[lucy-generate-image] HF_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Image generation service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth token
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    console.log("[lucy-generate-image] Generating image for prompt:", prompt.slice(0, 100));

    // Style enhancements
    const styleEnhancements: Record<string, string> = {
      cinematic: "cinematic lighting, dramatic composition, film aesthetic, professional photography",
      cyberpunk: "neon lights, futuristic city, blade runner aesthetic, magenta and cyan lighting",
      luxury: "luxury lifestyle, elegant composition, premium materials, sophisticated lighting",
      anime: "anime style, vibrant colors, cel shading, Japanese animation aesthetic",
      cartoon: "cartoon style, bold outlines, playful design, bright colors",
      realism: "photorealistic, hyper detailed, 8K resolution, natural textures",
      fantasy: "fantasy art, magical atmosphere, ethereal lighting, epic composition",
      portrait: "professional portrait photography, studio lighting, sharp focus, high quality",
    };

    const enhancement = styleEnhancements[style] || styleEnhancements.cinematic;
    const enhancedPrompt = `${prompt}, ${enhancement}, high quality, detailed`;

    // Select model
    const modelMap: Record<string, string> = {
      sdxl: "stabilityai/stable-diffusion-xl-base-1.0",
      flux: "black-forest-labs/FLUX.1-schnell",
    };

    const modelId = modelMap[model] || modelMap.flux;

    const hf = new HfInference(HF_TOKEN);

    console.log("[lucy-generate-image] Using model:", modelId);

    const image = await hf.textToImage({
      inputs: enhancedPrompt,
      model: modelId,
      parameters: {
        width,
        height,
      },
    });

    // Convert blob to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const imageUrl = `data:image/png;base64,${base64}`;

    // Store in ai_generated_scenes if user is authenticated
    let sceneId: string | null = null;
    if (userId) {
      const { data: scene, error: sceneError } = await supabase
        .from("ai_generated_scenes")
        .insert({
          user_id: userId,
          prompt,
          scene_data: {
            enhanced_prompt: enhancedPrompt,
            model: modelId,
            style,
            width,
            height,
          },
          image_url: imageUrl,
          mood_tags: [style],
        })
        .select()
        .single();

      if (!sceneError && scene) {
        sceneId = scene.id;
      }

      // Deduct credits
      await supabase.from("lucy_usage_ledger").insert({
        user_id: userId,
        action: "generate_image",
        credits_delta: -5,
        job_id: null,
      });
    }

    console.log("[lucy-generate-image] Image generated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        image_url: imageUrl,
        scene_id: sceneId,
        prompt_enhanced: enhancedPrompt,
        model_used: modelId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[lucy-generate-image] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Image generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
