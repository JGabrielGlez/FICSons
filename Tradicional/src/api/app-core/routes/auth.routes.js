// src/api/app-core/routes/auth.routes.js
// Definición de rutas para el submódulo de Autenticación y Usuarios

import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import {
  signupHandler,
  getMeHandler,
  updateUserHandler,
  deleteUserHandler,
} from "../controllers/auth.controller.js";

const router = Router();

// ── Rutas públicas (sin token) ───────────────────────────────────────
router.post("/auth/signup", signupHandler);

// ── Rutas protegidas (requieren token JWT) ───────────────────────────
router.get("/users/me",     authMiddleware, getMeHandler);
router.put("/users/:id",    authMiddleware, updateUserHandler);
router.delete("/users/:id", authMiddleware, deleteUserHandler);

export default router;