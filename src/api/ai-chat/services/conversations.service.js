import supabase from "../../../app-core/shared/db.js";
//  Obtener una conversación específica del usuario por ID

export async function getConversationById(userId, conversationId) {
  try {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single();

    if (error) {
      // PGRST116 = no rows found
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error al obtener conversación: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error("[conversations.service] Error en getConversationById:", err);
    throw err;
  }}


  export async function listConversations(userId) {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("id, title, mode, messages, total_tokens, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error)
      throw new Error(`Error al listar conversaciones: ${error.message}`);

    return (data ?? []).map((conv) => {
      const messages = Array.isArray(conv.messages) ? conv.messages : [];
      const last = messages[messages.length - 1];
      return {
        id: conv.id,
        title: conv.title,
        mode: conv.mode,
        message_count: messages.length,
        last_message: last ? String(last.content ?? "").slice(0, 100) : null,
        total_tokens: conv.total_tokens,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      };
    });
  }

