import dotenv from "dotenv";
dotenv.config();
export default {
  HOST: process.env.HOST || "localhost",
  PORT: process.env.PORT || 3000,
  API_URL: process.env.API_URL || "/api/supabase",
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_KEY: process.env.SUPABASE_KEY || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  DATABASE: process.env.DATABASE || "",

  // espacio para subir otras configuraciones por defecto
};
