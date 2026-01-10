import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const MCP_ENDPOINT =
  "https://alexnasa-ltx-2-turbo.hf.space/gradio_api/mcp/";

const HF_TOKEN = Deno.env.get("HF_TOKEN");

if (!HF_TOKEN) {
  throw new Error("HF_TOKEN is not set in Supabase secrets");
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const {
      prompt,
      duration = 8,
      width = 1080,
      height = 1920,
      enhance_prompt = true,
      seed = Math.floor(Math.random() * 1_000_000),
    } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing prompt" }),
        { status: 400 }
      );
    }

    /**
     * ✅ MCP REQUIRES messages[] FORMAT
     */
    const mcpPayload = {
      messages: [
        {
          role: "user",
          content: "",
          tool_calls: [
            {
              name: "ltx_2_TURBO_generate_video",
              arguments: {
                prompt,
                duration,
                width,
                height,
                enhance_prompt,
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
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mcpPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: errorText }),
        { status: 500 }
      );
    }

    const result = await response.json();

    /**
     * MCP returns tool output here:
     * result.choices[0].message.tool_results[0]
     */
    const toolResult =
      result?.choices?.[0]?.message?.tool_results?.[0];

    if (!toolResult) {
      return new Response(
        JSON.stringify({ error: "No tool result returned from MCP" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        video_url: toolResult?.output?.video,
        seed: toolResult?.output?.seed,
        raw: toolResult,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500 }
    );
  }
});
