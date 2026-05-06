import { Router } from "express";
import { chatController } from "../controllers/chat.controller.js";
import { authenticateJWT } from "../middlewares/auth.js";

// FIC: Router del módulo ai-chat / ai-chat module router
const router = Router();

// FIC: POST /api/ai-chat/chat - Endpoint principal de chat con IA Ada / Main AI Ada chat endpoint
router.post("/chat", authenticateJWT, chatController);

export default router;
