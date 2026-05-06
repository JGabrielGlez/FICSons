// Minimal login endpoint: fetch profile by email
import { ApiError } from "../../lib/errors";
import { supabase } from "../../lib/supabaseClient";

export async function handler(req: any, res: any) {
  try {
    const { email } = req.body || {};
    if (!email) throw new ApiError(400, "missing_email");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message || "db_error");
    if (!data) throw new ApiError(404, "not_found");

    // NOTE: authentication should be delegated to Supabase Auth; this is a simple lookup for dev-mirror
    res.status(200).json({ profile: data });
  } catch (err: any) {
    const e =
      err instanceof ApiError ? err : new ApiError(500, "internal_error");
    res.status(e.status).json({ message: e.message });
  }
}
