// src/middleware/auth.middleware.js
import { supabase } from "../config/database.config.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_MISSING", message: "Se requiere token de autenticación" }
    });
  }
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_INVALID", message: "Token inválido o expirado" }
    });
  }
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  req.user = { id: user.id, role: profile?.role ?? "student", email: user.email };
  next();
};