import dotenv from "dotenv";
dotenv.config();
export default {
  HOST: process.env.HOST || "localhost",
  PORT: process.env.PORT || "3000",
  API_URL: process.env.API_URL || "/api/supabase",
  SUPABASE_URL: process.env.SUPABASE_URL || 'Base de datos no encontrada',
  SUPABASE_KEY:process.env.SUPABASE_KEY || 'Llave de acceso a la base de datos no encontrada.',
  DATABASE:process.env.DATABASE || 'No se encontró el nombre de la base de datos.'

  //espacio para subir otras configuraciones por defecto, como las connection Strings de la base de datos   
};
