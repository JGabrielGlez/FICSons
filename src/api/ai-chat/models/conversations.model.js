// src/api/ai-chat/models/conversations.model.js
// FIC: Tipos y estructura de datos para conversaciones de IA / Types and data structure for AI conversations


/**
 * Resumen de conversación para el listado
 * @typedef {Object} AIConversationSummary
 * @property {string} id            - UUID único de la conversación
 * @property {string|null} title    - Título editable
 * @property {string|null} mode     - Modo de IA: tutor | academic | data
 * @property {number} message_count - Número de mensajes
 * @property {string|null} last_message - Preview del último mensaje (max 100 chars)
 * @property {number} total_tokens  - Tokens consumidos en Gemini
 * @property {string} created_at    - Fecha de creación (ISO8601)
 * @property {string} updated_at    - Fecha de última actualización (ISO8601)
 */


/**
 * Estructura de cada mensaje dentro de una conversación
 * @typedef {Object} AIMessage
 * @property {"user"|"assistant"|"system"} role - Rol del emisor
 * @property {string} content                   - Contenido del mensaje
 * @property {string} [created_at]              - Timestamp ISO8601
 * @property {"tutor"|"academic"|"data"} [mode] - Modo de IA al momento del mensaje
 */

