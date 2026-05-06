import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import config from "../../config/config.js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || config.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || config.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
