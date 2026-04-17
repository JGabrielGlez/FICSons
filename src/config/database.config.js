import config from "./config";

// Initialize the JS client
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);

(async () => {
  try {
    // Make a request
    const { data: todos, error } = await supabase
      .from("cat_institutos")
      .select("*");
    error && console.log(error);
    console.log(todos);
  } catch (e) {
    console.log(e);
  }
})();
