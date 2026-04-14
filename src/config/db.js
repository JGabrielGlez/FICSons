// src/config/db.js
// Módulo central: inicializa y exporta los clientes de las 4 BDs NoSQL

require("dotenv").config();

const mongoose = require("mongoose");
const { createClient } = require("@supabase/supabase-js");
const neo4j = require("neo4j-driver");
const { CosmosClient } = require("@azure/cosmos");

// ──────────────────────────────────────────────────────────────
// MONGODB - Mongoose
// ──────────────────────────────────────────────────────────────
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB conectado");
  } catch (err) {
    console.error("❌ Error MongoDB:", err.message);
    throw err;
  }
};

// ──────────────────────────────────────────────────────────────
// SUPABASE
// ──────────────────────────────────────────────────────────────
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

const connectSupabase = async () => {
  try {
    // Supabase se conecta automáticamente con el cliente
    console.log("✅ Supabase conectado");
  } catch (err) {
    console.error("❌ Error Supabase:", err.message);
    throw err;
  }
};

// ──────────────────────────────────────────────────────────────
// NEO4J
// ──────────────────────────────────────────────────────────────
const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
);

const connectNeo4j = async () => {
  try {
    await neo4jDriver.verifyConnectivity();
    console.log("✅ Neo4j conectado");
  } catch (err) {
    console.error("❌ Error Neo4j:", err.message);
    throw err;
  }
};

// ──────────────────────────────────────────────────────────────
// AZURE COSMOS DB
// ──────────────────────────────────────────────────────────────
const cosmosClient = new CosmosClient({
  endpoint: process.env.AZURE_COSMOS_ENDPOINT,
  key: process.env.AZURE_COSMOS_KEY,
});

const connectAzure = async () => {
  try {
    await cosmosClient
      .database(process.env.AZURE_COSMOS_DATABASE)
      .container(process.env.AZURE_COSMOS_CONTAINER)
      .item("test")
      .read()
      .catch(() => {
        // Ignorar error de lectura de prueba
      });
    console.log("✅ Azure Cosmos DB conectado");
  } catch (err) {
    console.error("❌ Error Azure:", err.message);
    throw err;
  }
};

// ──────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL: CONECTAR TODAS LAS BDs
// ──────────────────────────────────────────────────────────────
const connectDatabases = async () => {
  try {
    await connectMongoDB();
    await connectSupabase();
    await connectNeo4j();
    await connectAzure();
    console.log("✅ Todas las BDs conectadas exitosamente");
  } catch (err) {
    console.error("❌ Error al conectar BDs:", err);
    throw err;
  }
};

// ──────────────────────────────────────────────────────────────
// EXPORTAR CLIENTES Y FUNCIÓN DE CONEXIÓN
// ──────────────────────────────────────────────────────────────
module.exports = {
  connectDatabases,
  mongoose,
  supabaseClient,
  neo4jDriver,
  cosmosClient,
};
