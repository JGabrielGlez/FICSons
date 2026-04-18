require("dotenv").config();
const { CosmosClient } = require("@azure/cosmos");

// ──────────────────────────────────────────────────────────────
// AZURE COSMOS DB (Tu prioridad)
// ──────────────────────────────────────────────────────────────
const cosmosClient = new CosmosClient({
  endpoint: process.env.AZURE_COSMOS_ENDPOINT || "https://placeholder.azure.com",
  key: process.env.AZURE_COSMOS_KEY || "placeholder",
});

const connectAzure = async () => {
  try {
    // Intentamos una operación simple para verificar conexión
    await cosmosClient.databases.readAll().fetchAll();
    console.log("✅ Azure Cosmos DB conectado");
  } catch (err) {
    console.error("❌ Error Azure:", err.message);
    // No lanzamos el error para que el servidor intente subir
  }
};

// ──────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL: SOLO AZURE
// ──────────────────────────────────────────────────────────────
const connectDatabases = async () => {
  console.log("Iniciando conexión a base de datos...");
  await connectAzure();
};

// Exportamos objetos vacíos para las otras BDs para que no den error de "undefined"
module.exports = {
  connectDatabases,
  mongoose: {}, 
  supabaseClient: {}, 
  neo4jDriver: {},
  cosmosClient,
};
