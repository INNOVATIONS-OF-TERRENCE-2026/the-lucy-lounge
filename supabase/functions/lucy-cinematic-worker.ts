import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  try {
    return new Response(
      JSON.stringify({
        status: "worker online",
        message: "Lucy Cinematic Worker active",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response("Worker error", { status: 500 });
  }
});
