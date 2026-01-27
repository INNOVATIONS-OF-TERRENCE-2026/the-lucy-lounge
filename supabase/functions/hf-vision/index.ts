import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Privacy sanitizer
function sanitizeError(error: unknown): string {
  console.error('[INTERNAL ERROR]', error);
  return "Vision enhancement temporarily unavailable. Using core vision system.";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HF_TOKEN = Deno.env.get('HUGGINGFACE_API_KEY') || Deno.env.get('HF_TOKEN');
    
    if (!HF_TOKEN) {
      return new Response(JSON.stringify({ 
        error: 'HF enhancement not configured',
        fallback: true 
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = req.headers.get("content-type") ?? "";
    
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ 
        error: "Expected multipart/form-data with 'file' and 'prompt'" 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const prompt = formData.get("prompt") as string ?? "Analyze this image in detail.";

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "file is required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[hf-vision] Analyzing image:', file.name);

    const hf = new HfInference(HF_TOKEN);
    const imageBlob = await file.arrayBuffer();

    const result = await hf.imageToText({
      model: "Qwen/Qwen2-VL-7B-Instruct",
      data: imageBlob,
    });

    const text = typeof result === 'string' 
      ? result 
      : (result as any)?.generated_text ?? JSON.stringify(result);

    return new Response(JSON.stringify({
      ok: true,
      text,
      provider: 'hf-vision'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[hf-vision] Internal error:', error);
    return new Response(JSON.stringify({ 
      error: sanitizeError(error),
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
