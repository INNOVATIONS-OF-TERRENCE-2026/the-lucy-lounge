import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ROUTER_SYSTEM_PROMPT = `You are Lucy's routing brain for LucyLounge.org.

You decide whether to call tools. Tools are OPTIONAL.

If unsure, return no steps.

When user asks to generate an image, use hf_image_gen.

Respond ONLY with JSON:
{
  "steps": [],
  "continue": false
}`;

function safeJsonParse(text: string): any {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { steps: [] };
    return JSON.parse(match[0]);
  } catch {
    return { steps: [] };
  }
}

async function lovableChat(apiKey: string, messages: any[], temperature = 0.7) {
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  // ⚠️ NEVER return 500 for user traffic
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const safeResponse = (finalAnswer: string, steps: any[] = []) =>
    new Response(
      JSON.stringify({
        ok: true,
        plan: {
          steps,
          finalAnswer,
          continue: false,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );

  try {
    const body = await req.json().catch(() => ({}));
    const messages = body?.messages ?? [];
    const userId = body?.userId ?? "anonymous";

    if (!Array.isArray(messages) || messages.length === 0) {
      return safeResponse("How can I help?");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
      return safeResponse("Lucy is temporarily unavailable.");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // STEP 1: Ask router
    const routerText = await lovableChat(
      LOVABLE_API_KEY,
      [{ role: "system", content: ROUTER_SYSTEM_PROMPT }, ...messages],
      0.2,
    );

    const plan = routerText ? safeJsonParse(routerText) : { steps: [] };
    const steps = Array.isArray(plan.steps) ? plan.steps : [];

    // STEP 2: If NO TOOLS → NORMAL CHAT (THIS IS THE CRITICAL FIX)
    if (!steps.length) {
      const normal = await lovableChat(LOVABLE_API_KEY, messages, 0.7);
      return safeResponse(normal ?? "How can I help?");
    }

    // STEP 3: Execute tools
    let imageBase64: string | null = null;
    let imagePrompt = "";

    for (const step of steps) {
      if (step.tool === "hf_image_gen") {
        const { data } = await supabase.functions.invoke("hf-image-gen", {
          body: { prompt: step.arguments?.prompt || "" },
        });

        if (data?.imageBase64) {
          imageBase64 = data.imageBase64;
          imagePrompt = step.arguments?.prompt || "Generated image";
        }
      }
    }

    // STEP 4: Final response
    const finalText = await lovableChat(
      LOVABLE_API_KEY,
      [
        ...messages,
        {
          role: "system",
          content: imageBase64 ? "An image was generated. Write a brief caption only." : "Respond normally.",
        },
      ],
      0.7,
    );

    let finalAnswer = finalText ?? "Here you go.";

    if (imageBase64) {
      finalAnswer += `\n\n![${imagePrompt}](${imageBase64})`;
    }

    return safeResponse(finalAnswer, steps);
  } catch {
    // 🔒 ABSOLUTE LAST LINE OF DEFENSE — STILL 200
    return safeResponse("I encountered a temporary issue, but I'm still here. Try again.");
  }
});
