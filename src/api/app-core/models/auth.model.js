// src/api/app-core/models/auth.model.js
// Modelos de datos para el submódulo de Autenticación y Usuarios

export function validateSignup(body) {
  const errors = [];
  if (!body.email || !body.email.includes("@"))
    errors.push("email inválido");
  if (!body.password || body.password.length < 6)
    errors.push("password debe tener mínimo 6 caracteres");
  if (!body.fullName || body.fullName.trim() === "")
    errors.push("fullName es requerido");
  const validRoles = ["student", "instructor", "admin"];
  if (body.role && !validRoles.includes(body.role))
    errors.push("role debe ser: student, instructor o admin");
  return errors;
}

export function validateUpdateUser(body) {
  const errors = [];
  if (body.fullName !== undefined && body.fullName.trim() === "")
    errors.push("fullName no puede estar vacío");
  if (body.avatar_url !== undefined && !body.avatar_url.startsWith("http"))
    errors.push("avatar_url debe ser una URL válida");
  return errors;
}