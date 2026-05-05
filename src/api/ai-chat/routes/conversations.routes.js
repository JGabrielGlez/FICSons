
import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.js";
import { getConversationHandler } from "../controllers/conversations.controller.js";

// GET /api/v1/ai/conversations/:id
const router = Router();

router.get(
  "/conversations/:id",
  authenticateJWT,
  getConversationHandler
);

export default router;