// Minimal signup endpoint: inserts a profile using Supabase service key
import { ApiError } from "../../lib/errors";
import { supabase } from "../../lib/supabaseClient";

export async function handler(req: any, res: any) {
  try {
    const { email, display_name } = req.body || {};
    if (!email) throw new ApiError(400, "missing_email");

    const { data, error } = await supabase
      .from("profiles")
      .insert({ email, display_name })
      .select()
      .maybeSingle();
    if (error) throw new ApiError(500, error.message || "db_error");

    res.status(201).json({ profile: data });
  } catch (err: any) {
    const e =
      err instanceof ApiError ? err : new ApiError(500, "internal_error");
    res.status(e.status).json(e.message ? { message: e.message } : {});
  }
}
