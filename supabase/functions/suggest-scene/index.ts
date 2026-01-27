import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chatContext, currentMood, location, timeOfDay } = await req.json();

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    // Build enhanced context with location and time
    let enhancedContext = `Chat context: "${chatContext}". Current mood: "${currentMood}".`;
    
    if (timeOfDay) {
      enhancedContext += ` Time of day: ${timeOfDay}.`;
    }
    
    if (location?.weather) {
      enhancedContext += ` Current weather: ${location.weather}.`;
    }
    
    if (location?.season) {
      enhancedContext += ` Season: ${location.season}.`;
    }

    // Time-based recommendations
    const timeBasedScenes = {
      morning: ['sunrise', 'forest', 'mountains', 'nature'],
      afternoon: ['ocean', 'beach', 'nature', 'mountains'],
      evening: ['sunset', 'rain', 'ocean', 'beach'],
      night: ['stars', 'aurora', 'night', 'rain']
    };

    const sceneOptions = timeOfDay && timeBasedScenes[timeOfDay as keyof typeof timeBasedScenes]
      ? timeBasedScenes[timeOfDay as keyof typeof timeBasedScenes]
      : ['nature', 'rain', 'ocean', 'forest', 'night', 'mountains', 'beach', 'sunset', 'aurora', 'stars'];

    // Analyze chat context and suggest appropriate scene
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
            content: "You are an ambient scene recommendation expert. Consider context, mood, time of day, weather, and season to suggest the perfect immersive background scene."
          },
          {
            role: "user",
            content: `${enhancedContext} Suggest the most appropriate scene from: ${sceneOptions.join(', ')}. Consider emotional tone, activity level, and environmental factors. Respond with just the scene name.`
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
      throw new Error("AI request failed");
    }

    const aiData = await aiResponse.json();
    const suggestedScene = aiData.choices?.[0]?.message?.content?.toLowerCase().trim() || "nature";

    return new Response(
      JSON.stringify({ suggestedScene }),
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
