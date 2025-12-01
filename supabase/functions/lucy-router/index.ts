import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ROUTER_SYSTEM_PROMPT = `ROUTER PROMPT (unchanged for brevity)`;

async function callTool(supabase: any, tool: string, args: any, userId: string) {
  const start = Date.now();

  try {
    switch (tool) {
      case "web_search":
        return await supabase.functions.invoke("web-search", {
          body: { query: args.query || "" },
        });

      case "browser_fetch":
        return await supabase.functions.invoke("browser-fetch", {
          body: { url: args.url || "" },
        });

      case "code_exec":
        return await supabase.functions.invoke("code-tool-executor", {
          body: { code: args.code || "", language: "javascript" },
        });

      case "image_gen":
        return await supabase.functions.invoke("generate-image", {
          body: { prompt: args.prompt || "" },
        });

      case "memory_search":
        return await supabase.functions.invoke("memory-search", {
          body: { userId, query: args.query || "", topK: args.topK || 5 },
        });

      default:
        return { error: `Tool ${tool} not implemented.` };
    }
  } catch (err) {
    console.error("TOOL ERROR:", err);
    return { error: "Tool failed." };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase env missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY missing");
    }

    const { userId = "anonymous", messages = [] } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages[] required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const routerResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: ROUTER_SYSTEM_PROMPT }, ...messages],
      }),
    });

    const data = await routerResponse.json();
    let plan = JSON.parse(data.choices[0].message.content);

    const executed = [];

    for (const step of plan.steps ?? []) {
      executed.push({
        ...step,
        result: await callTool(supabase, step.tool, step.arguments, userId),
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        plan: {
          steps: executed,
          finalAnswer: plan.finalAnswer ?? "",
          continue: plan.continue ?? false,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("ROUTER CRASH:", err);

    return new Response(
      JSON.stringify({
        error: "Router crashed",
        plan: {
          steps: [],
          finalAnswer: "The system temporarily failed. Try again.",
          continue: false,
        },
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
