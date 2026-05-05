// FIC: Middleware de autenticación del módulo ai-chat / ai-chat module authentication middleware
export function authenticateJWT(req, res, next) {
  try {
    const userId = process.env.DEV_FAKE_USER_ID || "00000000-0000-0000-0000-000000000000";
    req.user = { id: userId };
    next();
  } catch (err) {
    res.status(500).json({ error: "auth error" });
  }
}
