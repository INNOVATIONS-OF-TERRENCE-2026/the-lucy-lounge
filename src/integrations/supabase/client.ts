// Updated Supabase client for Lovable compatibility
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Lovable uses these env variable names exactly:
const SUPABASE_URL = import.meta.env.SUPABASEURL;
const SUPABASE_ANON_KEY = import.meta.env.SUPABASEANONKEY;

// Safety checks to help debugging
if (!SUPABASE_URL) {
  console.error("❌ Missing env: SUPABASEURL");
}
if (!SUPABASE_ANON_KEY) {
  console.error("❌ Missing env: SUPABASEANONKEY");
}

// Create Supabase client with working auth/session
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
