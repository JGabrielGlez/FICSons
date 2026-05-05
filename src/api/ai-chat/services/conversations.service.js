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
  }
}
