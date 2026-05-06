
import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.js";
import { getConversationHandler } from "../controllers/conversations.controller.js";
import { listConversationsHandler } from "../controllers/conversations.controller.js";


// GET /api/v1/ai/conversations/:id
const router = Router();

router.get(
  "/conversations/:id",
  authenticateJWT,
  getConversationHandler
);

// src/api/ai-chat/routes/conversations.routes.js
// FIC: Rutas para listar conversaciones de IA / Routes for listing AI conversations

// GET /api/ai-chat/conversations — Listar conversaciones del usuario autenticado
router.get("/conversations", authenticateJWT, listConversationsHandler);


export default router;
