// TODO: Permission helpers and role checks
export function isSuperAdmin(user: any) {
  return user?.role === 'super_admin';
}

export function isAdmin(user: any) {
  return user?.role === 'admin' || isSuperAdmin(user);
}

export function isInstructor(user: any) {
  return user?.role === 'instructor';
}
