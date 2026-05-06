// src/api/app-core/controllers/auth.controller.js
// Controladores HTTP para el submódulo de Autenticación y Usuarios

import { signup, getMe, updateUser, deleteUser }
  from "../services/auth.service.js";

export const signupHandler = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password || !req.body.fullName) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_BODY",
                 message: "email, password y fullName son requeridos" }
      });
    }
    const result = await signup(req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getMeHandler = async (req, res, next) => {
  try {
    const data = await getMe(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

export const updateUserHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_PARAMS", message: "El parámetro id es requerido" }
      });
    }
    const data = await updateUser(id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

export const deleteUserHandler = async (req, res, next) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN",
                 message: "Solo administradores pueden eliminar usuarios" }
      });
    }
    await deleteUser(req.params.id);
    return res.status(204).send();
  } catch (err) { next(err); }
};