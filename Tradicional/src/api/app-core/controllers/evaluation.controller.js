import boom from "@hapi/boom";
import * as EvaluationService from "../services/evaluation.service.js";

// POST /api/instructor/courses/:courseId/evaluations
export const createEvaluation = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const data = req.body;
    const evaluation = await EvaluationService.createEvaluation(courseId, data);
    res.status(201).json(evaluation);
  } catch (error) {
    next(error);
  }
};

// GET /api/evaluations/:id  — sin is_correct para el alumno
export const getEvaluation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evaluation = await EvaluationService.getEvaluationForStudent(id);
    if (!evaluation) {
      throw boom.notFound("Evaluación no encontrada");
    }
    res.status(200).json(evaluation);
  } catch (error) {
    next(error);
  }
};

// POST /api/evaluations/:id/attempts
export const startAttempt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
      throw boom.badRequest("El campo userId es requerido");
    }
    const result = await EvaluationService.startAttempt(id, userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/evaluations/:id/submit
export const submitAttempt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { attempt_id, userId, answers } = req.body;
    if (!attempt_id || !userId || !Array.isArray(answers)) {
      throw boom.badRequest("Se requieren attempt_id, userId y answers[]");
    }
    const result = await EvaluationService.submitAttempt(id, attempt_id, userId, answers);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id/evaluation-history
export const getEvaluationHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const history = await EvaluationService.getEvaluationHistory(id);
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};
