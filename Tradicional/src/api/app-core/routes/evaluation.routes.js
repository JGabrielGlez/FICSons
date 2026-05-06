import { Router } from "express";
import {
  createEvaluation,
  getEvaluation,
  startAttempt,
  submitAttempt,
  getEvaluationHistory,
} from "../controllers/evaluation.controller.js";

const router = Router();

// Instructor: crear evaluación para un curso
router.post("/instructor/courses/:courseId/evaluations", createEvaluation);

// Alumno: ver evaluación sin respuestas correctas (CRÍTICO)
router.get("/evaluations/:id", getEvaluation);

// Alumno: iniciar un intento
router.post("/evaluations/:id/attempts", startAttempt);

// Alumno: enviar respuestas y recibir calificación
router.post("/evaluations/:id/submit", submitAttempt);

// Usuario: historial de evaluaciones
router.get("/users/:id/evaluation-history", getEvaluationHistory);

export default router;
