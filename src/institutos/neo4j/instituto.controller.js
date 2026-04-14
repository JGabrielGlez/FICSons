// src/institutos/neo4j/instituto.controller.js
// Controlador para manejar req/res de Neo4j

const service = require("./instituto.service");

// GET /api/neo4j/institutos
exports.getAll = async (req, res) => {
  try {
    const institutos = await service.getAll();
    res.json({ success: true, data: institutos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/neo4j/institutos/:id
exports.getById = async (req, res) => {
  try {
    const instituto = await service.getById(req.params.id);
    if (!instituto) {
      return res
        .status(404)
        .json({ success: false, error: "Instituto no encontrado" });
    }
    res.json({ success: true, data: instituto });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/neo4j/institutos
exports.create = async (req, res) => {
  try {
    const instituto = await service.create(req.body);
    res.status(201).json({ success: true, data: instituto });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// PUT /api/neo4j/institutos/:id
exports.update = async (req, res) => {
  try {
    const instituto = await service.update(req.params.id, req.body);
    if (!instituto) {
      return res
        .status(404)
        .json({ success: false, error: "Instituto no encontrado" });
    }
    res.json({ success: true, data: instituto });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// DELETE /api/neo4j/institutos/:id
exports.delete = async (req, res) => {
  try {
    const instituto = await service.delete(req.params.id);
    if (!instituto) {
      return res
        .status(404)
        .json({ success: false, error: "Instituto no encontrado" });
    }
    res.json({ success: true, message: "Instituto eliminado" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
