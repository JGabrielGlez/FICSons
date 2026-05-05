
import { z } from "zod";

// Esquema para validar mensajes individuales
const AIMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  created_at: z.string().optional(),
});

// Tipo para una conversación completa con todos sus mensajes
export const AIConversationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().nullable(),
  mode: z.enum(["tutor", "academic", "data"]).nullable(),
  lesson_id: z.string().uuid().nullable(),
  course_id: z.string().uuid().nullable(),
  messages: z.array(AIMessageSchema).default([]),
  total_tokens: z.number().int().default(0),
  created_at: z.string(),
  updated_at: z.string(),
});

export const validateConversation = (data) => {
  const result = AIConversationSchema.safeParse(data);
  return result;
};