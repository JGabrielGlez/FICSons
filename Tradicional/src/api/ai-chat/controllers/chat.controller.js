import { z } from "zod";
import { streamChat, hasActiveEvaluation, getDailyUsage } from "../services/chat.service.js";

// 💬FIC: Esquema de validación del cuerpo de la petición / Request body validation schema
const chatSchema = z.object({
  message: z
    .string()
    .min(1, "El mensaje no puede estar vacío")
    .max(1000, "El mensaje no puede exceder 1000 caracteres")
    .transform((val) => val.trim()),
  context: z.object({}).passthrough().optional(),
});

// 💬FIC: Controlador principal del endpoint de chat con IA / Main controller for AI chat endpoint
export async function chatController(req, res) {
  // 💬FIC: Validar cuerpo de la petición con Zod / Validate request body with Zod
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_BODY",
        message: "Datos de entrada inválidos",
        details: parsed.error.errors,
      },
    });
  }

  const { message, context = {} } = parsed.data;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_MISSING", message: "Token de autenticación requerido" },
    });
  }

  // 💬FIC: Kill-switch: bloquear IA si el usuario tiene evaluación activa / Kill-switch: block AI if user has active evaluation
  const evaluationActive = await hasActiveEvaluation(userId);
  if (evaluationActive) {
    return res.status(403).json({
      success: false,
      error: { code: "EVALUATION_ACTIVE", message: "La IA está desactivada durante una evaluación" },
    });
  }

  // 💬FIC: Verificar rate limit diario de 90 consultas / Check 90 daily queries rate limit
  const usage = await getDailyUsage(userId);
  if (usage.remaining <= 0) {
    return res.status(429).json({
      success: false,
      error: { code: "RATE_LIMIT_EXCEEDED", message: "Has alcanzado el límite de 90 consultas diarias" },
    });
  }

  // 💬FIC: Iniciar streaming SSE con Gemini / Start SSE streaming with Gemini
  await streamChat(userId, message, context, res);
}
