import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ROUTER_SYSTEM_PROMPT = `You are Lucy's routing brain for LucyLounge.org.

Your job: Decide which tools to call (if any) to best answer the user's request.

Tools available:
1) "chat" - Standard LLM reasoning. Args: { "hint"?: string }
2) "web_search" - Search the web. Args: { "query": string }
3) "browser_fetch" - Fetch and parse a URL. Args: { "url": string }
4) "code_exec" - Run JavaScript sandbox. Args: { "code": string }
5) "image_gen" - Generate images using AI. Args: { "prompt": string }
6) "hf_image_gen" - Generate high-quality images with Stable Diffusion XL. Args: { "prompt": string }
7) "memory_search" - Search user memory. Args: { "query": string }

IMPORTANT: When user asks to "generate", "create", "draw", "make", or "show me" an image/picture/artwork, use "hf_image_gen" tool.
Examples that should use hf_image_gen:
- "Generate an image of a futuristic Dallas skyline"
- "Create a picture of a sunset over mountains"
- "Draw me a cute robot"
- "Make an image of..."
- "Show me what X would look like"

Respond ONLY with JSON:
{
  "steps": [
    {
      "stepNumber": 1,
      "tool": "tool_name",
      "arguments": {...}
    }
  ],
  "continue": false,
  "reasoning": "brief explanation"
}`;

type Plan = {
  steps: Array<{ stepNumber: number; tool: string; arguments?: Record<string, unknown> }>;
  continue?: boolean;
  reasoning?: string;
};

function safeExtractJsonObject(text: string): string | null {
  // Find the first {...} block in the LLM output (robust for extra prose)
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

function safeParsePlan(routerText: string): Plan {
  const raw = safeExtractJsonObject(routerText);
  if (!raw) return { steps: [], continue: false };

  try {
    const parsed = JSON.parse(raw);
    const steps = Array.isArray(parsed?.steps) ? parsed.steps : [];
    return {
      steps,
      continue: Boolean(parsed?.continue),
      reasoning: typeof parsed?.reasoning === "string" ? parsed.reasoning : undefined,
    };
  } catch (_e) {
    console.error("[lucy-router] Failed to parse router JSON");
    return { steps: [], continue: false };
  }
}

async function lovableChatCompletion(LOVABLE_API_KEY: string, messages: any[], temperature = 0.7) {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      temperature,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    console.error("[lucy-router] lovableChatCompletion failed:", resp.status, txt);
    return { ok: false, content: null as string | null };
  }

  const data = await resp.json().catch(() => ({}));
  const content = data?.choices?.[0]?.message?.content ?? null;
  return { ok: true, content };
}

async function callTool(supabase: any, tool: string, args: any, userId: string) {
  const start = Date.now();

  try {
    switch (tool) {
      case "web_search": {
        const { data, error } = await supabase.functions.invoke("web-search", {
          body: { query: args.query || "" },
        });
        if (error) {
          console.error("[lucy-router] web_search error:", error);
          return { error: "Web search unavailable", durationMs: Date.now() - start };
        }
        return { ...data, durationMs: Date.now() - start };
      }

      case "browser_fetch": {
        const { data, error } = await supabase.functions.invoke("browser-fetch", {
          body: { url: args.url || "" },
        });
        if (error) {
          console.error("[lucy-router] browser_fetch error:", error);
          return { error: "Browser fetch unavailable", durationMs: Date.now() - start };
        }
        return { ...data, durationMs: Date.now() - start };
      }

      case "code_exec": {
        const { data, error } = await supabase.functions.invoke("code-executor", {
          body: { code: args.code || "", language: "javascript" },
        });
        if (error) {
          console.error("[lucy-router] code_exec error:", error);
          return { error: "Code execution unavailable", durationMs: Date.now() - start };
        }
        return { ...data, durationMs: Date.now() - start };
      }

      case "image_gen": {
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: { prompt: args.prompt || "" },
        });
        if (error) {
          console.error("[lucy-router] image_gen error:", error);
          return { error: "Image generation unavailable", durationMs: Date.now() - start };
        }
        return { ...data, durationMs: Date.now() - start };
      }

      case "hf_image_gen": {
        console.log("[lucy-router] Calling HF SDXL image generation");
        const { data, error } = await supabase.functions.invoke("hf-image-gen", {
          body: { prompt: args.prompt || "" },
        });

        if (error) {
          console.error("[lucy-router] HF image gen invoke error:", error);
          return { error: "Image generation temporarily unavailable", durationMs: Date.now() - start };
        }

        return { ...data, durationMs: Date.now() - start };
      }

      case "memory_search": {
        const { data, error } = await supabase.functions.invoke("memory-search", {
          body: { userId, query: args.query || "", topK: args.topK || 5 },
        });
        if (error) {
          console.error("[lucy-router] memory_search error:", error);
          return { error: "Memory search unavailable", durationMs: Date.now() - start };
        }
        return { ...data, durationMs: Date.now() - start };
      }

      default:
        return { info: `Tool ${tool} not implemented`, durationMs: Date.now() - start };
    }
  } catch (error) {
    console.error(`[lucy-router] Tool ${tool} failed:`, error);
    return { error: "Tool execution failed", durationMs: Date.now() - start };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // NOTE: We intentionally avoid throwing for “router plan failures”
  // so the app never returns 500 for normal user traffic.
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const userId = body?.userId ?? "anonymous";
    const messages = body?.messages ?? [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages[] is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Hard config error — but still return a clean JSON response.
      console.error("[lucy-router] LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Configuration error",
          plan: { steps: [], finalAnswer: "Lucy is temporarily unavailable.", continue: false },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("[lucy-router] Processing request with", messages.length, "messages");

    // Current date for temporal awareness
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentDateTime = now.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // =========================
    // Step 1: Ask router what tools to use
    // =========================
    const routerMessages = [
      { role: "system", content: ROUTER_SYSTEM_PROMPT },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const routerResult = await lovableChatCompletion(LOVABLE_API_KEY, routerMessages, 0.2);

    // If router call fails, just do normal chat. NO 500.
    if (!routerResult.ok || !routerResult.content) {
      console.warn("[lucy-router] Router call failed; falling back to normal chat.");
      const normal = await lovableChatCompletion(LOVABLE_API_KEY, messages, 0.7);

      return new Response(
        JSON.stringify({
          ok: true,
          plan: {
            steps: [],
            finalAnswer: normal.content || "How can I help?",
            continue: false,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const plan = safeParsePlan(routerResult.content);

    // =========================
    // Step 2: Execute tools
    // =========================
    const executedSteps: any[] = [];

    if (Array.isArray(plan.steps) && plan.steps.length > 0) {
      for (const step of plan.steps) {
        const toolName = String(step?.tool || "");
        const toolArgs = step?.arguments || {};
        const result = await callTool(supabase, toolName, toolArgs, userId);

        executedSteps.push({
          stepNumber: step?.stepNumber ?? executedSteps.length + 1,
          tool: toolName,
          arguments: toolArgs,
          result,
        });
      }
    }

    // ✅ CRITICAL GUARD: If no tools were executed, do NORMAL CHAT. NEVER 500.
    if (!executedSteps.length) {
      console.warn("[lucy-router] No tools executed. Falling back to normal chat.");

      const normal = await lovableChatCompletion(LOVABLE_API_KEY, messages, 0.7);

      return new Response(
        JSON.stringify({
          ok: true,
          plan: {
            steps: [],
            finalAnswer: normal.content || "How can I help?",
            continue: false,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // =========================
    // Step 3: Detect image result for inline embedding
    // =========================
    let generatedImageBase64: string | null = null;
    let imagePrompt: string | null = null;

    for (const step of executedSteps) {
      if (step.tool === "hf_image_gen" && step.result?.imageBase64) {
        generatedImageBase64 = step.result.imageBase64;
        imagePrompt = (step.arguments?.prompt as string) || "Generated image";
        console.log("[lucy-router] Found generated image to embed");
        break;
      }
    }

    // Build tool messages (exclude large base64 data for LLM context)
    const toolMessages = executedSteps.map((step) => {
      if (step.tool === "hf_image_gen" && step.result?.imageBase64) {
        return {
          role: "tool" as const,
          content: `Tool: hf_image_gen\nResult: Image successfully generated for prompt: "${step.arguments?.prompt}"`,
        };
      }

      return {
        role: "tool" as const,
        content: `Tool: ${step.tool}\nResult: ${JSON.stringify(step.result).slice(0, 2000)}`,
      };
    });

    // =========================
    // Step 4: Generate final answer
    // =========================
    const finalSystem = `You are Lucy AI for LucyLounge.org with 2025-level modern intelligence.

CURRENT CONTEXT: ${currentDateTime}, Year ${currentYear}

PRIVACY: Never reveal models, providers, or technical details.

${
  generatedImageBase64
    ? "IMPORTANT: An image was generated successfully. Write a brief, friendly caption for it. Do NOT include any image markdown - the image will be added automatically."
    : ""
}

You have tool results available. Use them to compose a clear, accurate answer. Cite sources when using web search results.`;

    const finalMessages = [
      { role: "system", content: finalSystem },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
      ...toolMessages,
    ];

    const final = await lovableChatCompletion(LOVABLE_API_KEY, finalMessages, 0.7);

    let finalAnswer = final.content || "I encountered an issue generating a response.";

    // Inject the generated image as markdown at the end of the response (direct inline image)
    if (generatedImageBase64) {
      // Ensure we never inject undefined/empty strings
      const safeAlt = (imagePrompt || "Generated image").slice(0, 200);
      finalAnswer = `${finalAnswer}\n\n![${safeAlt}](${generatedImageBase64})`;
      console.log("[lucy-router] Injected image into final answer");
    }

    return new Response(
      JSON.stringify({
        ok: true,
        plan: {
          steps: executedSteps,
          finalAnswer,
          continue: Boolean(plan?.continue),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    // LAST-RESORT catch: still return 200 with a safe response so the app never blanks out.
    console.error("[lucy-router] Unhandled Error:", error);
    return new Response(
      JSON.stringify({
        ok: true,
        error: "Agent routing failed. Using fallback response.",
        plan: {
          steps: [],
          finalAnswer: "I encountered a temporary issue. Please try again in a moment.",
          continue: false,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
