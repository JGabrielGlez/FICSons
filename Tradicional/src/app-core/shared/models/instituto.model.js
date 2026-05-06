import supabase from "../db.js";

const TABLE = "institutos";

const getAll = async () => {
  const { data, error } = await supabase.from(TABLE).select("*");
  if (error) throw error;
  return data;
};

const getById = async (id) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};

const create = async (payload) => {
  const { data, error } = await supabase.from(TABLE).insert(payload).select();
  if (error) throw error;
  return data;
};

const update = async (id, payload) => {
  const { data, error } = await supabase.from(TABLE).update(payload).eq("id", id).select();
  if (error) throw error;
  return data;
};

export default {
  getAll,
  getById,
  create,
  update,
};
