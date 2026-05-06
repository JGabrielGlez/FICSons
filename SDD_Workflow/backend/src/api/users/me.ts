// User profile endpoint: reads profile from Supabase using x-user-id header when available
import { supabase } from "../../lib/supabaseClient";

export async function handler(req: any, res: any) {
  try {
    const id = req.headers["x-user-id"] || req.body?.user_id;
    if (!id)
      return res
        .status(200)
        .json({ id: "unknown", display_name: "placeholder" });

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: "not_found" });
    res.status(200).json({ profile: data });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "internal_error" });
  }
}
