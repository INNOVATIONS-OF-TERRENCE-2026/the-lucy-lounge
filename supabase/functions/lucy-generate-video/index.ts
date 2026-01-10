import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const MCP_ENDPOINT =
  "https://alexnasa-ltx-2-turbo.hf.space/gradio_api/mcp/";
const HF_TOKEN = Deno.env.get("HF_TOKEN");

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

    const payload = {
      tool: "ltx_2_TURBO_generate_video",
      args: {
        prompt,
        duration,
        width,
        height,
        enhance_prompt,
        seed,
        randomize_seed: false,
      },
    };

    const response = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(err, { status: 500 });
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({
        video_url: result?.[0],
        seed: result?.[1],
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
