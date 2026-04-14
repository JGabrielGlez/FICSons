// src/institutos/mongo/instituto.service.js
// Lógica de negocio para MongoDB usando Mongoose

const Instituto = require("./instituto.model");

// Obtener todos los institutos
exports.getAll = async () => {
  try {
    return await Instituto.find();
  } catch (err) {
    throw new Error(`Error obteniendo institutos: ${err.message}`);
  }
};

// Obtener un instituto por ID
exports.getById = async (id) => {
  try {
    return await Instituto.findById(id);
  } catch (err) {
    throw new Error(`Error obteniendo instituto: ${err.message}`);
  }
};

// Crear un nuevo instituto
exports.create = async (data) => {
  try {
    const instituto = new Instituto(data);
    return await instituto.save();
  } catch (err) {
    throw new Error(`Error creando instituto: ${err.message}`);
  }
};

// Actualizar un instituto
exports.update = async (id, data) => {
  try {
    return await Instituto.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw new Error(`Error actualizando instituto: ${err.message}`);
  }
};

// Eliminar un instituto
exports.delete = async (id) => {
  try {
    return await Instituto.findByIdAndDelete(id);
  } catch (err) {
    throw new Error(`Error eliminando instituto: ${err.message}`);
  }
};
