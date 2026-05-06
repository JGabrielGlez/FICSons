// Backend permission helpers (TASK T036 - Permission Checks)
// 
// TODO: IMPLEMENT ROLE-BASED ACCESS CONTROL
// ===========================================
// 
// 1. isSuperAdmin(user):
//    - Return user.role === 'super_admin'
// 
// 2. isAdmin(user):
//    - Return user.role === 'admin' OR isSuperAdmin(user)
// 
// 3. isInstructor(user):
//    - Return user.role === 'instructor'
// 
// 4. isStudent(user): (TODO: add this)
//    - Return user.role === 'student'
// 
// 5. hasPermission(user, resource, action):
//    - Example: hasPermission(user, 'course', 'edit')
//    - Check if user.role allows action on resource
//    - Return boolean
// 
// Usage in Express middleware (T037):
//    const requireAdmin = (req, res, next) => {
//      const user = getUserFromRequest(req);
//      if (!isAdmin(user)) return res.status(403).json({ message: 'Forbidden' });
//      next();
//    };
// 
// Reference:
// - Task T036: specs/002-backend-api-core/tasks.md#T036
// - Task T037: specs/002-backend-api-core/tasks.md#T037
// - Data Model: specs/002-backend-api-core/data-model.md#roles

export function isSuperAdmin(user: any) {
  return user?.role === 'super_admin';
}

export function isAdmin(user: any) {
  return user?.role === 'admin' || isSuperAdmin(user);
}

export function isInstructor(user: any) {
  return user?.role === 'instructor';
}

// TODO: Add more permission helpers
// export function isStudent(user: any) { ... }
// export function hasPermission(user, resource, action) { ... }
// export function requirePermission(resource, action) { ... } (Express middleware)
