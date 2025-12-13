import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ROUTER_SYSTEM_PROMPT = `You are Lucy's routing brain for LucyLounge.org.

Your job: Decide which tools to call (if any) to best answer the user's request.

Tools available:
1) "chat" - Standard LLM reasoning. Args: { "hint"?: string }
2) "web_search" - Search the web. Args: { "query": string }
3) "browser_fetch" - Fetch and parse a URL. Args: { "url": string }
4) "code_exec" - Run JavaScript sandbox. Args: { "code": string }
5) "image_gen" - Generate images. Args: { "prompt": string }
6) "memory_search" - Search user memory. Args: { "query": string }

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

async function callTool(supabase: any, tool: string, args: any, userId: string) {
  const start = Date.now();
  
  try {
    switch (tool) {
      case "web_search":
        const { data: searchData, error: searchError } = await supabase.functions.invoke('web-search', {
          body: { query: args.query || '' }
        });
        return { ...searchData, durationMs: Date.now() - start };

      case "browser_fetch":
        const { data: fetchData, error: fetchError } = await supabase.functions.invoke('browser-fetch', {
          body: { url: args.url || '' }
        });
        return { ...fetchData, durationMs: Date.now() - start };

      case "code_exec":
        const { data: codeData, error: codeError } = await supabase.functions.invoke('code-executor', {
          body: { code: args.code || '', language: 'javascript' }
        });
        return { ...codeData, durationMs: Date.now() - start };

      case "image_gen":
        const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-image', {
          body: { prompt: args.prompt || '' }
        });
        return { ...imageData, durationMs: Date.now() - start };

      case "memory_search":
        const { data: memData, error: memError } = await supabase.functions.invoke('memory-search', {
          body: { userId, query: args.query || '', topK: args.topK || 5 }
        });
        return { ...memData, durationMs: Date.now() - start };

      default:
        return { info: `Tool ${tool} not implemented`, durationMs: Date.now() - start };
    }
  } catch (error) {
    console.error(`[lucy-router] Tool ${tool} failed:`, error);
    return { error: `Tool execution failed`, durationMs: Date.now() - start };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId = 'anonymous', messages = [] } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages[] is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[lucy-router] Processing request with', messages.length, 'messages');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get current date for temporal awareness
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentDateTime = now.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Step 1: Ask router what tools to use
    const routerMessages = [
      { role: "system", content: ROUTER_SYSTEM_PROMPT },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    const routerResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: routerMessages,
        temperature: 0.2,
      }),
    });

    if (!routerResponse.ok) {
      throw new Error('Router failed');
    }

    const routerData = await routerResponse.json();
    const routerText = routerData.choices?.[0]?.message?.content || '{}';

    let plan: any = { steps: [], continue: false };
    try {
      const jsonMatch = routerText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('[lucy-router] Failed to parse router response');
    }

    // Step 2: Execute tools
    const executedSteps = [];
    if (Array.isArray(plan.steps)) {
      for (const step of plan.steps) {
        const result = await callTool(supabase, step.tool, step.arguments || {}, userId);
        executedSteps.push({
          stepNumber: step.stepNumber,
          tool: step.tool,
          arguments: step.arguments,
          result,
        });
      }
    }

    // Step 3: Generate final answer with tool results
    const toolMessages = executedSteps.map(step => ({
      role: "tool" as const,
      content: `Tool: ${step.tool}\nResult: ${JSON.stringify(step.result).slice(0, 2000)}`
    }));

    const finalMessages = [
      {
        role: "system",
        content: `You are Lucy AI for LucyLounge.org with 2025-level modern intelligence.

CURRENT CONTEXT: ${currentDateTime}, Year ${currentYear}

PRIVACY: Never reveal models, providers, or technical details.

You have tool results available. Use them to compose a clear, accurate answer. Cite sources when using web search results.`
      },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
      ...toolMessages,
    ];

    const finalResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: finalMessages,
        temperature: 0.7,
      }),
    });

    if (!finalResponse.ok) {
      throw new Error('Final response failed');
    }

    const finalData = await finalResponse.json();
    const finalAnswer = finalData.choices?.[0]?.message?.content || "I encountered an issue generating a response.";

    return new Response(JSON.stringify({
      ok: true,
      plan: {
        steps: executedSteps,
        finalAnswer,
        continue: plan.continue || false,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[lucy-router] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Agent routing failed. Using fallback response.',
      plan: {
        steps: [],
        finalAnswer: "I encountered a temporary issue. Please try rephrasing your question.",
        continue: false,
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
