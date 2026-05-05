import { getConversationById } from "../services/conversations.service.js";
import { validateConversation } from "../models/conversations.model.js";

//  Regex para validar UUIDs
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/v1/ai/conversations/:id - Obtener mensajes de una conversación

export async function getConversationHandler(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    console.log('[getConversationHandler] userId =', userId);
    console.log('[getConversationHandler] id =', id);

    //Validar que userId existe
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTH_MISSING",
          message: "Token de autenticación requerido",
        },
      });
    }

    //Validar que el ID es un UUID válido
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_UUID",
          message: "El id no es un UUID válido",
        },
      });
    }

    // Obtener la conversación de la base de datos
    const conversation = await getConversationById(userId, id);

    // Si no existe, devolver 404
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Conversación no encontrada",
        },
      });
    }

    //Validar que la conversación tiene el formato correcto
    const validation = validateConversation(conversation);
    if (!validation.success) {
      return res.status(500).json({
        success: false,
        error: {
          code: "INVALID_DATA",
          message: "Los datos de la conversación no son válidos",
          details: validation.error.flatten(),
        },
      });
    }

    // Devolver la conversación con estatus 200
    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    console.error(
      "[conversations.controller] Error en getConversationHandler:",
      err,
    );
    next(err);
  }
}
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
