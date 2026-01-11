import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MCP_ENDPOINT = "https://alexnasa-ltx-2-turbo.hf.space/gradio_api/mcp/";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const HF_TOKEN = Deno.env.get("HF_TOKEN");

    const {
      prompt,
      duration = 8,
      width = 1080,
      height = 1920,
      enhance_prompt = true,
      style_preset = "cinematic",
      seed = Math.floor(Math.random() * 1_000_000),
    } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get auth for persistence
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Enhance prompt with style
    const styleEnhancements: Record<string, string> = {
      cinematic: "cinematic lighting, film grain, anamorphic lens flare, 35mm film aesthetic",
      cyberpunk: "neon lights, rain-slicked streets, futuristic city, blade runner aesthetic",
      luxury: "luxury lifestyle, elegant composition, premium materials, gold accents",
      anime: "anime style, vibrant colors, dynamic action lines, cel shading",
      cartoon: "cartoon style, bold outlines, playful design, bright colors",
      realism: "photorealistic, hyper detailed, 8K resolution, natural textures",
    };

    const enhancement = styleEnhancements[style_preset] || styleEnhancements.cinematic;
    const enhancedPrompt = enhance_prompt ? `${prompt}, ${enhancement}` : prompt;

    console.log("[lucy-generate-video] Starting generation for:", enhancedPrompt.slice(0, 100));

    // Create job record
    let jobId: string | null = null;
    if (userId) {
      const { data: job } = await supabase
        .from("lucy_cinematic_jobs")
        .insert({
          user_id: userId,
          title: prompt.slice(0, 50),
          prompt_raw: prompt,
          prompt_enhanced: enhancedPrompt,
          style_preset,
          duration_seconds: duration,
          aspect_ratio: width === height ? "1:1" : width > height ? "16:9" : "9:16",
          status: "running",
          job_type: "video",
        })
        .select()
        .single();

      if (job) {
        jobId = job.id;
      }
    }

    // MCP payload format
    const mcpPayload = {
      messages: [
        {
          role: "user",
          content: "",
          tool_calls: [
            {
              name: "ltx_2_TURBO_generate_video",
              arguments: {
                prompt: enhancedPrompt,
                duration,
                width,
                height,
                enhance_prompt: false,
                seed,
                randomize_seed: false,
              },
            },
          ],
        },
      ],
    };

    const response = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: {
        ...(HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mcpPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[lucy-generate-video] MCP error:", errorText);

      if (jobId) {
        await supabase
          .from("lucy_cinematic_jobs")
          .update({ status: "failed", error_message: errorText })
          .eq("id", jobId);
      }

      return new Response(
        JSON.stringify({ error: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const toolResult = result?.choices?.[0]?.message?.tool_results?.[0];

    if (!toolResult) {
      const errorMsg = "No tool result returned from MCP";
      if (jobId) {
        await supabase
          .from("lucy_cinematic_jobs")
          .update({ status: "failed", error_message: errorMsg })
          .eq("id", jobId);
      }

      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const videoUrl = toolResult?.output?.video;

    // Update job as complete
    if (jobId && videoUrl) {
      await supabase
        .from("lucy_cinematic_jobs")
        .update({
          status: "complete",
          result_video_url: videoUrl,
          seed: toolResult?.output?.seed,
        })
        .eq("id", jobId);

      // Deduct credits
      if (userId) {
        await supabase.from("lucy_usage_ledger").insert({
          user_id: userId,
          action: "generate_video",
          credits_delta: -Math.ceil(duration / 5) * 10,
          job_id: jobId,
        });
      }
    }

    console.log("[lucy-generate-video] Generation complete");

    return new Response(
      JSON.stringify({
        video_url: videoUrl,
        seed: toolResult?.output?.seed,
        job_id: jobId,
        prompt_enhanced: enhancedPrompt,
        raw: toolResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Video generation failed";
    console.error("[lucy-generate-video] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
