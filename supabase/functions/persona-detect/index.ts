import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Persona definitions (mirrored from client)
const personas = {
  credit: {
    id: "credit",
    name: "Credit Lucy",
    keywords: ["credit", "collections", "charge off", "experian", "transunion", "equifax", "dispute", "funding", "sba", "loan", "tradeline", "score", "fico", "bureau", "debt"],
  },
  developer: {
    id: "developer",
    name: "Developer Lucy",
    keywords: ["code", "coding", "programming", "developer", "api", "database", "function", "typescript", "javascript", "python", "react", "supabase", "debug", "error", "deploy", "automation"],
  },
  realtor: {
    id: "realtor",
    name: "Realtor Lucy",
    keywords: ["real estate", "realtor", "property", "mortgage", "loan", "fha", "va loan", "usda", "investment", "rental", "landlord", "closing", "appraisal", "housing", "home"],
  },
  default: {
    id: "default",
    name: "Lucy AI",
    keywords: [],
  },
};

function detectPersona(message: string) {
  const lower = message.toLowerCase();
  
  // Check specialized personas first
  for (const [key, persona] of Object.entries(personas)) {
    if (key === 'default') continue;
    
    if (persona.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return persona;
    }
  }
  
  return personas.default;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const persona = detectPersona(message);

    return new Response(JSON.stringify({
      ok: true,
      persona,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[persona-detect] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to detect persona',
      persona: personas.default
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
