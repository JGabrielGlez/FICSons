// Backend auth helpers (TASK T016 - JWT Verification)
// 
// TODO: IMPLEMENT JWT VERIFICATION
// ==================================
// 
// These helpers are used in Express middleware and Edge Functions
// to extract user info from Supabase JWT tokens.
// 
// 1. getUserFromRequest(req):
//    - Extract "Authorization: Bearer <token>" header
//    - Verify token signature with Supabase public key
//    - Parse JWT payload to get user_id, role, email
//    - Return { id, role, email } or null if invalid
// 
// 2. requireAuth(req):
//    - Call getUserFromRequest(req)
//    - If null, throw 401 Unauthorized
//    - Otherwise, return user object
// 
// Reference:
// - Supabase docs: https://supabase.com/docs/guides/auth
// - JWT decode: https://jwt.io/
// - Task details: specs/002-backend-api-core/tasks.md#T016

export function getUserFromRequest(req: any) {
  // TODO: Extract JWT token from Authorization header
  // TODO: Verify signature using Supabase public key
  // TODO: Parse and return user claims
  
  // PLACEHOLDER
  return req.user || null;
}

export function requireAuth(req: any) {
  const user = getUserFromRequest(req);
  if (!user) throw new Error("Unauthorized");
  return user;
}
