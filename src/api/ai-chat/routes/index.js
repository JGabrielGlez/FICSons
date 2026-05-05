import chatRouter from "./chat.routes.js";

// FIC: Registra todas las rutas del módulo ai-chat en la app / Registers all ai-chat module routes in the app
export default function routerAiChat(app) {
  app.use("/api/ai-chat", chatRouter);
}
