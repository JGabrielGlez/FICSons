import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // Intentionally allow creation; runtime code should handle missing keys gracefully
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
