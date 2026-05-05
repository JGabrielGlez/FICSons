// src/api/ai-chat/routes/conversations.routes.js
// FIC: Rutas para listar conversaciones de IA / Routes for listing AI conversations


import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.js";
import { listConversationsHandler } from "../controllers/conversations.controller.js";


const router = Router();


// GET /api/ai-chat/conversations — Listar conversaciones del usuario autenticado
router.get("/conversations", authenticateJWT, listConversationsHandler);


export default router;
