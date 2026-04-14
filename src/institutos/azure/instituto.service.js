// src/institutos/azure/instituto.service.js
// Lógica de negocio para Azure Cosmos DB

const { cosmosClient } = require("../../config/db");

const DATABASE = process.env.AZURE_COSMOS_DATABASE;
const CONTAINER = process.env.AZURE_COSMOS_CONTAINER;

// Obtener todos los institutos
exports.getAll = async () => {
  try {
    const container = cosmosClient.database(DATABASE).container(CONTAINER);
    const { resources } = await container.items
      .query("SELECT * FROM c")
      .fetchAll();
    return resources;
  } catch (err) {
    throw new Error(`Error obteniendo institutos: ${err.message}`);
  }
};

// Obtener un instituto por ID
exports.getById = async (id) => {
  try {
    const container = cosmosClient.database(DATABASE).container(CONTAINER);
    const { resource } = await container.item(id).read();
    return resource;
  } catch (err) {
    throw new Error(`Error obteniendo instituto: ${err.message}`);
  }
};

// Crear un nuevo instituto
exports.create = async (data) => {
  try {
    const container = cosmosClient.database(DATABASE).container(CONTAINER);
    const { resource } = await container.items.create(data);
    return resource;
  } catch (err) {
    throw new Error(`Error creando instituto: ${err.message}`);
  }
};

// Actualizar un instituto
exports.update = async (id, data) => {
  try {
    const container = cosmosClient.database(DATABASE).container(CONTAINER);
    const { resource } = await container.item(id).replace({
      id,
      ...data,
    });
    return resource;
  } catch (err) {
    throw new Error(`Error actualizando instituto: ${err.message}`);
  }
};

// Eliminar un instituto
exports.delete = async (id) => {
  try {
    const container = cosmosClient.database(DATABASE).container(CONTAINER);
    const { resource } = await container.item(id).delete();
    return resource;
  } catch (err) {
    throw new Error(`Error eliminando instituto: ${err.message}`);
  }
};
