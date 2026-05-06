// Supabase Edge Function: submit-evaluation (minimal implementation)
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  Deno?.env?.get?.("SUPABASE_URL") ||
  Deno?.env?.get?.("NEXT_PUBLIC_SUPABASE_URL") ||
  "";
const SUPABASE_KEY =
  Deno?.env?.get?.("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno?.env?.get?.("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY as string);

export async function handler(req: any) {
  try {
    const body = await req.json();
    // Expect body: { attempt: {...}, user_id }
    const attempt = body.attempt || null;
    const user_id = body.user_id || null;

    // Insert evaluation record
    const { data, error } = await supabase
      .from("evaluations")
      .insert({ user_id, payload: attempt })
      .select()
      .maybeSingle();
    if (error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });

    // Audit
    await supabase
      .from("operational_audit")
      .insert({
        action: "submit_evaluation",
        user_id,
        meta: { evaluation_id: data?.id },
      });

    return new Response(JSON.stringify({ evaluation: data }), { status: 201 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ message: err?.message || "internal_error" }),
      { status: 500 },
    );
  }
}
