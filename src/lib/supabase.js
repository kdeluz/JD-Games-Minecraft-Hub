import { createClient } from "@supabase/supabase-js";

// Public client — safe to use in the browser
// Uses the anon key which respects Row Level Security
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Admin client — server-side ONLY (API routes)
// Uses service_role key which bypasses RLS
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
