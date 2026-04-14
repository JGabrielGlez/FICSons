// src/institutos/neo4j/instituto.service.js
// Lógica de negocio para Neo4j usando Cypher queries

const { neo4jDriver } = require("../../config/db");

const session = () => neo4jDriver.session();

// Obtener todos los institutos
exports.getAll = async () => {
  const s = session();
  try {
    const result = await s.run("MATCH (n:Instituto) RETURN n");
    return result.records.map((record) => record.get("n").properties);
  } catch (err) {
    throw new Error(`Error obteniendo institutos: ${err.message}`);
  } finally {
    await s.close();
  }
};

// Obtener un instituto por ID
exports.getById = async (id) => {
  const s = session();
  try {
    const result = await s.run(
      "MATCH (n:Instituto) WHERE n.id = $id RETURN n",
      { id },
    );
    return result.records.length > 0
      ? result.records[0].get("n").properties
      : null;
  } catch (err) {
    throw new Error(`Error obteniendo instituto: ${err.message}`);
  } finally {
    await s.close();
  }
};

// Crear un nuevo instituto
exports.create = async (data) => {
  const s = session();
  try {
    const result = await s.run("CREATE (n:Instituto $props) RETURN n", {
      props: data,
    });
    return result.records[0].get("n").properties;
  } catch (err) {
    throw new Error(`Error creando instituto: ${err.message}`);
  } finally {
    await s.close();
  }
};

// Actualizar un instituto
exports.update = async (id, data) => {
  const s = session();
  try {
    const result = await s.run(
      "MATCH (n:Instituto) WHERE n.id = $id SET n += $props RETURN n",
      { id, props: data },
    );
    return result.records.length > 0
      ? result.records[0].get("n").properties
      : null;
  } catch (err) {
    throw new Error(`Error actualizando instituto: ${err.message}`);
  } finally {
    await s.close();
  }
};

// Eliminar un instituto
exports.delete = async (id) => {
  const s = session();
  try {
    const result = await s.run(
      "MATCH (n:Instituto) WHERE n.id = $id DELETE n RETURN n",
      { id },
    );
    return result.records.length > 0
      ? result.records[0].get("n").properties
      : null;
  } catch (err) {
    throw new Error(`Error eliminando instituto: ${err.message}`);
  } finally {
    await s.close();
  }
};
