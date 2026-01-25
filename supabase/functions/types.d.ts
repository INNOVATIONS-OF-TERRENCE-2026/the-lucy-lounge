// Type declarations for Deno modules used in Supabase Edge Functions
// This allows VS Code to understand imports without Deno runtime

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}

// Deno namespace type stubs
declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
}
