import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// 💬FIC: Clientes inicializados lazy para que dotenv ya haya cargado las variables / Lazy clients so dotenv has loaded env vars
function getGenAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

// 💬FIC: Palabras clave para detectar modo tutor / Keywords to detect tutor mode
const TUTOR_KEYWORDS = ["explica", "explícame", "qué es", "cómo funciona", "duda", "no entiendo", "ayuda con"];

// 💬FIC: Palabras clave para detectar modo académico / Keywords to detect academic mode
const ACADEMIC_KEYWORDS = ["curso", "calificación", "evaluación", "progreso", "pendiente", "promedio", "mis cursos", "inscrito"];

// 💬FIC: Detecta el modo de respuesta según contexto y mensaje / Detects response mode based on context and message
export async function detectMode(message, context = {}) {
  const lowerMsg = message.toLowerCase();

  if (context.lesson_id && TUTOR_KEYWORDS.some((k) => lowerMsg.includes(k))) {
    return "tutor";
  }

  if (ACADEMIC_KEYWORDS.some((k) => lowerMsg.includes(k))) {
    return "academic";
  }

  // 💬FIC: Si las heurísticas no son claras, usar Gemini para clasificar / If heuristics are unclear, use Gemini to classify
  try {
    const genAI = getGenAI();
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Clasifica este mensaje en una sola palabra (tutor, academic o data): "${message}"`,
    });
    const classification = result.text.trim().toLowerCase();
    if (["tutor", "academic", "data"].includes(classification)) return classification;
  } catch (_) {
    // 💬FIC: Si Gemini falla en clasificación, usar modo por defecto / If Gemini fails classification, use default mode
  }

  return "data";
}

// 💬FIC: Carga el contexto de Supabase según el modo detectado / Loads Supabase context based on detected mode
export async function loadContext(mode, userId, context = {}) {
  const supabase = getSupabase();

  if (mode === "tutor" && context.lesson_id) {
    const { data } = await supabase
      .from("lessons")
      .select("title, content, module_id")
      .eq("id", context.lesson_id)
      .single();
    return data ? `Lección actual: ${data.title}. Contenido: ${data.content}` : "";
  }

  if (mode === "academic") {
    const { data } = await supabase.rpc("app.get_user_academic_summary", { p_user: userId });
    return data ? JSON.stringify(data) : "";
  }

  if (mode === "data") {
    const { data } = await supabase.rpc("app.get_courses_data_context");
    return data ? JSON.stringify(data) : "";
  }

  return "";
}

// 💬FIC: Construye el system prompt según el modo / Builds the system prompt based on mode
function buildSystemPrompt(mode, contextInfo) {
  const base = `Eres Ada, asistente académica del LMS FICSons. Responde siempre en español.
Contexto disponible: ${contextInfo || "ninguno"}
Responde ÚNICAMENTE con JSON válido con esta estructura:
{"mode":"${mode}","response_type":"text","text":"tu respuesta aquí","suggested_queries":["pregunta1","pregunta2"]}`;

  if (mode === "tutor") {
    return `Eres Ada, tutora académica socrática. Guía al estudiante con preguntas, no des respuestas directas. No respondas preguntas de evaluaciones activas.\n${base}`;
  }
  if (mode === "academic") {
    return `Eres Ada, asistente académica. Usa SOLO los datos provistos del usuario, no inventes información.\n${base}`;
  }
  return `Eres Ada, consultora de datos del LMS. Solo lectura, no modifiques datos.\n${base}`;
}

// 💬FIC: Verifica si el usuario tiene evaluación activa (kill-switch) / Checks if user has active evaluation (kill-switch)
export async function hasActiveEvaluation(userId) {
  const { data, error } = await getSupabase().rpc("app.has_active_evaluation", { p_user: userId });
  if (error) return false;
  return !!data;
}

// 💬FIC: Verifica el uso diario y el rate limit / Checks daily usage and rate limit
export async function getDailyUsage(userId) {
  const { data, error } = await getSupabase().rpc("app.get_daily_ai_usage", { p_user: userId });
  if (error || !data || data.length === 0) {
    return { used_today: 0, daily_limit: 90, remaining: 90 };
  }
  return data[0];
}

// 💬FIC: Registra el evento de uso en la base de datos / Registers usage event in the database
export async function logUsage(userId, conversationId, mode, totalTokens) {
  const costUsd = (totalTokens / 1_000_000) * 0.3;
  await getSupabase().from("ai_usage_events").insert({
    user_id: userId,
    conversation_id: conversationId || null,
    mode,
    total_tokens: totalTokens,
    cost_usd: costUsd,
  });
}

// 💬FIC: Ejecuta el chat con streaming SSE hacia el cliente / Runs chat with SSE streaming to client
export async function streamChat(userId, message, context, res) {
  const genAI = getGenAI();
  const mode = await detectMode(message, context);
  const contextInfo = await loadContext(mode, userId, context);
  const systemPrompt = buildSystemPrompt(mode, contextInfo);

  // 💬FIC: Configura headers para Server-Sent Events / Set headers for Server-Sent Events
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent("meta", { status: "processing", mode });

  let fullText = "";
  let totalTokens = 0;

  try {
    const stream = await genAI.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: message,
      config: { systemInstruction: systemPrompt },
    });

    for await (const chunk of stream) {
      const chunkText = chunk.text ?? "";
      fullText += chunkText;
      if (chunkText) sendEvent("chunk", { text: chunkText });
      if (chunk.usageMetadata?.totalTokenCount) {
        totalTokens = chunk.usageMetadata.totalTokenCount;
      }
    }

    // 💬FIC: Parsea el JSON de la respuesta o usa texto plano como fallback / Parse response JSON or use plain text as fallback
    let structured;
    try {
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      structured = jsonMatch ? JSON.parse(jsonMatch[0]) : { mode, response_type: "text", text: fullText, suggested_queries: [] };
    } catch (_) {
      structured = { mode, response_type: "text", text: fullText, suggested_queries: [] };
    }

    sendEvent("structured", structured);
    sendEvent("done", { status: "completed", total_tokens: totalTokens });

    await logUsage(userId, context?.conversation_id, mode, totalTokens);
  } catch (err) {
    console.error("[ai-chat] Gemini error:", err?.message || err);
    sendEvent("error", { message: "Error al procesar la respuesta de IA", code: "INTERNAL_ERROR" });
  } finally {
    res.end();
  }
}
