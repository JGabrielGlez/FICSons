// Supabase Edge Function: update-user-role (minimal implementation)
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno?.env?.get?.("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno?.env?.get?.("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY as string);

export async function handler(req: any) {
  try {
    const body = await req.json();
    const { user_id, role } = body || {};
    if (!user_id || !role)
      return new Response(JSON.stringify({ message: "missing_params" }), {
        status: 400,
      });

    const { data, error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", user_id)
      .select()
      .maybeSingle();
    if (error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });

    await supabase
      .from("operational_audit")
      .insert({ action: "update_user_role", user_id, meta: { role } });

    return new Response(JSON.stringify({ profile: data }), { status: 200 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ message: err?.message || "internal_error" }),
      { status: 500 },
    );
  }
}
