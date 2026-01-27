import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sceneType, mood, timeOfDay, weatherCondition, userId } = await req.json();

    if (!sceneType) {
      return new Response(
        JSON.stringify({ error: "Scene type is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    // Generate ultra-realistic scene description using AI
    const prompt = `Create a cinematic, ultra-realistic 4K HDR nature scene description for: ${sceneType}.
Mood: ${mood || 'serene'}
Time of Day: ${timeOfDay || 'afternoon'}
Weather: ${weatherCondition || 'clear'}

Include:
- Lighting and atmospheric conditions (golden hour, soft shadows, HDR quality)
- Color palette (natural, vibrant, cinematic grading)
- Motion elements (gentle breeze, water flow, cloud movement)
- Environmental details (depth, texture, photorealistic quality)
- Ambient sound suggestions (wind, water, birds, rain)

Make it feel like a professional nature documentary. Keep under 300 words.`;

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://thelucylounge.com",
        "X-Title": "The Lucy Lounge",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: "You are a professional cinematographer and nature videographer specializing in ultra-realistic 4K HDR nature footage."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const sceneDescription = aiData.choices?.[0]?.message?.content || "Ultra-realistic scene generated";

    // Store scene recommendation in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sceneData = {
      description: sceneDescription,
      sceneType,
      mood,
      timeOfDay,
      weatherCondition,
      generated_at: new Date().toISOString(),
      quality: 'ultra_4k_hdr',
      recommendedVideos: [], // Could be populated with actual video URLs
    };

    if (userId) {
      const { error: dbError } = await supabase
        .from("ai_generated_scenes")
        .insert({
          user_id: userId,
          prompt: `${sceneType} - ${mood} - ${timeOfDay} - ${weatherCondition}`,
          mood_tags: [mood, timeOfDay, weatherCondition, sceneType],
          scene_data: sceneData,
        });

      if (dbError) {
        console.error("Database error:", dbError);
      }
    }

    return new Response(
      JSON.stringify({ 
        scene: sceneData,
        description: sceneDescription,
        message: "Ultra-realistic scene generated successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
