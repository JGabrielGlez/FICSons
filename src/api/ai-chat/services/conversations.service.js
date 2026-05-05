// src/api/ai-chat/services/conversations.service.js
// FIC: Lógica de negocio para listar conversaciones de IA / Business logic for listing AI conversations


import { supabase } from "../../../config/database.config.js";


/**
 * Lista las conversaciones del usuario autenticado
 * @param {string} userId - UUID del usuario autenticado
 * @returns {Promise<AIConversationSummary[]>}
 */
export async function listConversations(userId) {
  const { data, error } = await supabase
    .from("ai_conversations")
    .select("id, title, mode, messages, total_tokens, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(20);


  if (error) throw new Error(`Error al listar conversaciones: ${error.message}`);


  return (data ?? []).map(conv => {
    const messages = Array.isArray(conv.messages) ? conv.messages : [];
    const last     = messages[messages.length - 1];
    return {
      id:            conv.id,
      title:         conv.title,
      mode:          conv.mode,
      message_count: messages.length,
      last_message:  last ? String(last.content ?? "").slice(0, 100) : null,
      total_tokens:  conv.total_tokens,
      created_at:    conv.created_at,
      updated_at:    conv.updated_at,
    };
  });
}
