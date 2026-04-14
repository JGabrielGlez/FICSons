// src/institutos/supabase/instituto.routes.js
// Definición de rutas para Supabase: /api/supabase/institutos

const express = require("express");
const router = express.Router();
const controller = require("./instituto.controller");

// GET /api/supabase/institutos
router.get("/institutos", controller.getAll);

// GET /api/supabase/institutos/:id
router.get("/institutos/:id", controller.getById);

// POST /api/supabase/institutos
router.post("/institutos", controller.create);

// PUT /api/supabase/institutos/:id
router.put("/institutos/:id", controller.update);

// DELETE /api/supabase/institutos/:id
router.delete("/institutos/:id", controller.delete);

module.exports = router;
