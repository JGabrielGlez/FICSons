// FIC: Middleware de autenticación del módulo ai-chat / ai-chat module authentication middleware
export function authenticateJWT(req, res, next) {
  try {
    const userId = process.env.DEV_FAKE_USER_ID || "a0000000-0000-0000-0000-000000000005";
    req.user = { id: userId };
        console.log('[authenticateJWT MIDDLEWARE] req.user después de asignar =', req.user);  // ← Y aquí

    next();
  } catch (err) {
    res.status(500).json({ error: "auth error" });
  }
}
