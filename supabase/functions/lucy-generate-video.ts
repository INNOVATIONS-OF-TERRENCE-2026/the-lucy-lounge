import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const MCP_ENDPOINT =
  "https://alexnasa-ltx-2-turbo.hf.space/gradio_api/mcp/";
const MCP_TOOL = "ltx_2_TURBO_generate_video";

serve(async (req) => {
  try {
    const body = await req.json();

    const {
      enhancedPrompt,
      shots,
      style,
      aspectRatio,
      duration,
      seed,
    } = body;

    if (!enhancedPrompt || !shots?.length) {
      return new Response(
        JSON.stringify({ error: "Invalid video payload" }),
        { status: 400 }
      );
    }

    const mcpPayload = {
      tool: MCP_TOOL,
      input: {
        prompt: enhancedPrompt,
        shots,
        style,
        aspect_ratio: aspectRatio,
        duration_seconds: duration,
        seed: seed ?? Math.floor(Math.random() * 1e9),
        quality: "ultra",
        fps: 30,
      },
    };

    const res = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mcpPayload),
    });

    if (!res.ok) {
      throw new Error("MCP video generation failed");
    }

    const data = await res.json();

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: data?.output?.video_url,
        seed: data?.output?.seed,
        meta: data?.output,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("lucy-generate-video error:", err);
    return new Response(
      JSON.stringify({ error: "Video generation failed" }),
      { status: 500 }
    );
  }
});
