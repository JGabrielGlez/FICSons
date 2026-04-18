// Librería para manejo de errores HTTP estructurados
import boom from "@hapi/boom";
// Cliente de Supabase inicializado con las credenciales del proyecto
import { supabase } from "../../../config/database.config.js";

// Consulta todos los registros de la tabla cat_institutos
export const getCatIntitutosList = async () => {
  // Ejecuta SELECT * FROM cat_institutos
  const { data, error } = await supabase.from("cat_institutos").select("*");
  // Si Supabase retorna error, lanza un error HTTP 500
  if (error) {
    throw boom.internal(error);
  }
  // Retorna el arreglo de institutos
  return data;
};

// Agrega un nuevo instituto a la tabla cat_institutos
export const addInstitutoItem = async (data) => {
  try {
    const { data: newInstituto, error } = await supabase
      .from("cat_institutos")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return newInstituto;
  } catch (error) {
    throw boom.internal(error);
  }
};

// Busca un instituto por su ID, usando el tipo de clave indicado (OK o BK)
export const getInstitutoItem = async (id, keytype) => {
  try {
    let query = supabase.from("cat_institutos").select("*");

    // 1. Decidimos qué columna filtrar
    if (!keytype) {
      query = query.eq("id", id);
    } else {
      const column = keytype === "OK" ? "id_instituto_ok" : "id_instituto_bk";
      query = query.eq(column, id);
    }

    // 2. Ejecutamos la consulta (una sola vez para evitar repetir código)
    const { data, error } = await query.single();

    // 3. Manejo de errores
    if (error) {
      // Si el error es porque no encontró nada, devolvemos null para que el controlador lance el 404
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data;
  } catch (error) {
    throw boom.internal(error.message);
  }
};
