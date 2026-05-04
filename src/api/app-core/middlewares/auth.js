// Temporal stub de autenticación para desarrollo.
// Reemplazar por middleware real cuando el microservicio Auth esté disponible.
export function authenticateJWT(req, res, next) {
  try {
    const userId = process.env.DEV_FAKE_USER_ID || '00000000-0000-0000-0000-000000000000';
    req.user = { id: userId };
    next();
  } catch (err) {
    console.error('[auth.stub] error:', err);
    res.status(500).json({ error: 'auth stub error' });
  }
}
