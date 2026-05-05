// src/api/ai-chat/controllers/conversations.controller.js
// FIC: Controlador para listar conversaciones de IA / Controller for listing AI conversations


import { listConversations } from "../services/conversations.service.js";


/**
 * GET /api/ai-chat/conversations
 * Retorna todas las conversaciones del usuario autenticado
 */
export const listConversationsHandler = async (req, res, next) => {
  try {
    const data = await listConversations(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
