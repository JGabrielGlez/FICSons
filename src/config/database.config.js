import config from "./config";
import dotenv from "dotenv";

// Initialize the JS client
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || config.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || config.SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

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
 