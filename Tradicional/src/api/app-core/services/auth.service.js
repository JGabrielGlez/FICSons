// src/api/app-core/services/auth.service.js
// Lógica de negocio para Autenticación y Usuarios

import { supabase } from "../../../config/database.config.js";
import { validateSignup, validateUpdateUser } from "../models/auth.model.js";

// ── POST /api/auth/signup ─────────────────────────────────────────────
export async function signup(body) {
  const errors = validateSignup(body);
  if (errors.length > 0) {
    const err = new Error("Datos inválidos");
    err.code = "INVALID_BODY";
    err.status = 400;
    err.details = errors;
    throw err;
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email:    body.email,
    password: body.password,
  });
  if (authError) {
    const err = new Error(authError.message);
    err.status = authError.status === 422 ? 409 : 400;
    err.code = "EMAIL_EXISTS";
    throw err;
  }

  const user = authData.user;

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id:           user.id,
      email:        body.email,
      display_name: body.fullName,
      role:         body.role ?? "student",
    });
  if (profileError) throw new Error(profileError.message);

  return {
    user: { id: user.id, email: user.email,
            fullName: body.fullName, role: body.role ?? "student" },
    token: authData.session?.access_token ?? null,
  };
}

// ── GET /api/users/me ────────────────────────────────────────────────
export async function getMe(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, avatar_url, created_at")
    .eq("id", userId)
    .single();
  if (error) {
    const err = new Error("Usuario no encontrado");
    err.status = 404; err.code = "NOT_FOUND";
    throw err;
  }
  return data;
}

// ── PUT /api/users/:id ───────────────────────────────────────────────
export async function updateUser(id, body) {
  const errors = validateUpdateUser(body);
  if (errors.length > 0) {
    const err = new Error("Datos inválidos");
    err.code = "INVALID_BODY"; err.status = 400; err.details = errors;
    throw err;
  }

  const updates = {};
  if (body.fullName)   updates.display_name = body.fullName;
  if (body.avatar_url) updates.avatar_url   = body.avatar_url;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    const err = new Error("Usuario no encontrado");
    err.status = 404; err.code = "NOT_FOUND";
    throw err;
  }
  return data;
}

// ── DELETE /api/users/:id ────────────────────────────────────────────
export async function deleteUser(id) {
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) {
    const err = new Error("Usuario no encontrado");
    err.status = 404; err.code = "NOT_FOUND";
    throw err;
  }
}