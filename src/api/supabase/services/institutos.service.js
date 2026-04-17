// Librería para manejo de errores HTTP estructurados
import boom from "@hapi/boom";
// Cliente de Supabase inicializado con las credenciales del proyecto
import { supabase } from "../../config/database.config.js";

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

// Busca un instituto por su ID, usando el tipo de clave indicado (OK o BK)
export const getInstitutoItem = async (id, keytype) => {
  try {
    // Determina el nombre de la columna según el tipo de clave:
    // "OK" = clave primaria (IdInstitutoOK), cualquier otro valor = clave de negocio (IdInstitutoBK)
    const column = keytype === "OK" ? "IdInstitutoOK" : "IdInstitutoBK";

    // Ejecuta SELECT * FROM cat_institutos WHERE {column} = {id} LIMIT 1
    const { data, error } = await supabase
      .from("cat_institutos")
      .select("*")
      .eq(column, id)
      .single(); // Retorna un objeto directo, no un arreglo

    // Si no encuentra el registro o hay error de BD, lo lanza para el catch
    if (error) throw error;
    // Retorna el objeto del instituto encontrado
    return data;
  } catch (error) {
    // Envuelve cualquier error en un error HTTP 500
    throw boom.internal(error);
  }
};
