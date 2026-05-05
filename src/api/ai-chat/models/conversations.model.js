import { z } from "zod";

// Esquema para validar una conversación (según estructura real de la tabla)
export const AIConversationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  context_ref: z.any().optional(),
  summary: z.any().optional(),
  token_usage: z.any().optional(),
  created_at: z.string(),
  updated_at: z.string(),
}).passthrough();

export const validateConversation = (data) => {
  const result = AIConversationSchema.safeParse(data);
  return result;
};