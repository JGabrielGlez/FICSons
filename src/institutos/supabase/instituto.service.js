// src/institutos/supabase/instituto.service.js
// Lógica de negocio para Supabase

const { supabaseClient } = require("../../config/db");

const TABLE = "institutos";

// Obtener todos los institutos
exports.getAll = async () => {
  try {
    const { data, error } = await supabaseClient.from(TABLE).select();
    if (error) throw new Error(error.message);
    return data;
  } catch (err) {
    throw new Error(`Error obteniendo institutos: ${err.message}`);
  }
};

// Obtener un instituto por ID
exports.getById = async (id) => {
  try {
    const { data, error } = await supabaseClient
      .from(TABLE)
      .select()
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  } catch (err) {
    throw new Error(`Error obteniendo instituto: ${err.message}`);
  }
};

// Crear un nuevo instituto
exports.create = async (data) => {
  try {
    const { data: newInstituto, error } = await supabaseClient
      .from(TABLE)
      .insert([data])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return newInstituto;
  } catch (err) {
    throw new Error(`Error creando instituto: ${err.message}`);
  }
};

// Actualizar un instituto
exports.update = async (id, data) => {
  try {
    const { data: updated, error } = await supabaseClient
      .from(TABLE)
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return updated;
  } catch (err) {
    throw new Error(`Error actualizando instituto: ${err.message}`);
  }
};

// Eliminar un instituto
exports.delete = async (id) => {
  try {
    const { data, error } = await supabaseClient
      .from(TABLE)
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    return data;
  } catch (err) {
    throw new Error(`Error eliminando instituto: ${err.message}`);
  }
};
