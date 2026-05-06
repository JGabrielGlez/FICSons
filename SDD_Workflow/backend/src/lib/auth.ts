// TODO: Auth helpers (JWT validation, session extraction)
export function getUserFromRequest(req: any) {
  // Placeholder: integrate with Supabase auth JWT verification in Edge Functions
  return req.user || null;
}

export function requireAuth(req: any) {
  const user = getUserFromRequest(req);
  if (!user) throw new Error('Unauthorized');
  return user;
}
