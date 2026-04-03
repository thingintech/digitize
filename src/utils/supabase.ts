import { createClient } from "@supabase/supabase-js";

// Client-side initialization using ANON KEY (Respects RLS - Use for everything)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Administrative client using SERVICE ROLE KEY (Bypasses RLS)
 * WARNING: Do NOT use this on user-facing pages.
 * Use only for specific maintenance or bulk operations inside the dashboard.
 */
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
