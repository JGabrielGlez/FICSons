import boom from "@hapi/boom";
import { supabase } from "../../config/database.config.js";
import { Evaluation, EvaluationQuestion, EvaluationOption, EvaluationAttempt } from "../models/Evaluation.js";

// Crea una evaluación completa: cabecera + preguntas + opciones
export const createEvaluation = async (courseId, data) => {
  try {
    const evalRecord = new Evaluation({ ...data, courseId });

    const { data: evaluation, error: evalError } = await supabase
      .from("evaluations")
      .insert(evalRecord)
      .select()
      .single();

    if (evalError) throw evalError;

    // Insertar preguntas y sus opciones en orden
    for (let i = 0; i < (data.questions ?? []).length; i++) {
      const q = data.questions[i];
      const questionRecord = new EvaluationQuestion(q, evaluation.id, i);

      const { data: question, error: qError } = await supabase
        .from("evaluation_questions")
        .insert(questionRecord)
        .select()
        .single();

      if (qError) throw qError;

      const options = (q.options ?? []).map(
        (opt) => new EvaluationOption(opt, question.id)
      );

      if (options.length > 0) {
        const { error: optError } = await supabase
          .from("evaluation_options")
          .insert(options);

        if (optError) throw optError;
      }
    }

    return evaluation;
  } catch (error) {
    throw boom.internal(error.message);
  }
};

// Devuelve la evaluación al alumno — SIN el campo is_correct (CRÍTICO)
export const getEvaluationForStudent = async (id) => {
  try {
    const { data: evaluation, error } = await supabase
      .from("evaluations")
      .select(`
        id, title, passing_score, max_attempts, is_active,
        evaluation_questions (
          id, question_type, prompt, position,
          evaluation_options ( id, option_text )
        )
      `)
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return evaluation;
  } catch (error) {
    throw boom.internal(error.message);
  }
};

// Inicia un nuevo intento, verificando que no se supere el límite
export const startAttempt = async (evaluationId, userId) => {
  try {
    const { data: evaluation, error: evalError } = await supabase
      .from("evaluations")
      .select("id, max_attempts")
      .eq("id", evaluationId)
      .eq("is_active", true)
      .single();

    if (evalError?.code === "PGRST116" || !evaluation) {
      throw boom.notFound("Evaluación no encontrada");
    }
    if (evalError) throw evalError;

    const { count, error: countError } = await supabase
      .from("evaluation_attempts")
      .select("*", { count: "exact", head: true })
      .eq("evaluation_id", evaluationId)
      .eq("user_id", userId);

    if (countError) throw countError;

    if (count >= evaluation.max_attempts) {
      throw boom.forbidden("Se alcanzó el número máximo de intentos permitidos");
    }

    const attemptRecord = new EvaluationAttempt(evaluationId, userId, count + 1);

    const { data: attempt, error: attemptError } = await supabase
      .from("evaluation_attempts")
      .insert(attemptRecord)
      .select()
      .single();

    if (attemptError) throw attemptError;

    // expires_at es solo informativo para el cliente (1 hora desde inicio)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    return { attempt_id: attempt.id, started_at: attempt.started_at, expires_at: expiresAt };
  } catch (error) {
    if (boom.isBoom(error)) throw error;
    throw boom.internal(error.message);
  }
};

// Califica las respuestas del alumno completamente en el servidor
export const submitAttempt = async (evaluationId, attemptId, userId, answers) => {
  try {
    // Validar que el intento exista, pertenezca al usuario y esté abierto
    const { data: attempt, error: attemptError } = await supabase
      .from("evaluation_attempts")
      .select("id, status")
      .eq("id", attemptId)
      .eq("user_id", userId)
      .eq("evaluation_id", evaluationId)
      .single();

    if (attemptError?.code === "PGRST116" || !attempt) {
      throw boom.notFound("Intento no encontrado");
    }
    if (attemptError) throw attemptError;

    if (attempt.status !== "in_progress") {
      throw boom.conflict("Este intento ya fue enviado anteriormente");
    }

    // Obtener passing_score de la evaluación
    const { data: evaluation, error: evalError } = await supabase
      .from("evaluations")
      .select("passing_score")
      .eq("id", evaluationId)
      .single();

    if (evalError) throw evalError;

    // Obtener preguntas con opciones correctas — solo el servidor ve is_correct
    const { data: questions, error: questionsError } = await supabase
      .from("evaluation_questions")
      .select(`id, evaluation_options ( id, is_correct )`)
      .eq("evaluation_id", evaluationId);

    if (questionsError) throw questionsError;

    // Calificar cada respuesta comparando con la opción correcta
    let correctCount = 0;
    const details = questions.map((question) => {
      const correctOption = question.evaluation_options.find((o) => o.is_correct);
      const userAnswer = answers.find((a) => a.question_id === question.id);
      const isCorrect = !!(userAnswer && correctOption && userAnswer.option_id === correctOption.id);

      if (isCorrect) correctCount++;
      return { question_id: question.id, correct: isCorrect };
    });

    const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
    const passed = score >= evaluation.passing_score;

    // Persistir resultado del intento
    const { error: updateError } = await supabase
      .from("evaluation_attempts")
      .update({
        score: Math.round(score * 100) / 100,
        status: passed ? "passed" : "failed",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", attemptId);

    if (updateError) throw updateError;

    return {
      attempt_id: attemptId,
      score: Math.round(score * 100) / 100,
      passed,
      feedback_summary: {
        total_questions: questions.length,
        correct_answers: correctCount,
        details,
      },
    };
  } catch (error) {
    if (boom.isBoom(error)) throw error;
    throw boom.internal(error.message);
  }
};

// Devuelve el historial de intentos de un usuario agrupado por evaluación
export const getEvaluationHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("evaluation_attempts")
      .select(`
        id, attempt_number, score, status, started_at, submitted_at,
        evaluations ( id, title, passing_score )
      `)
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (error) throw error;

    // Agrupar por evaluación y calcular mejor puntaje
    const grouped = {};
    for (const attempt of data) {
      const evalId = attempt.evaluations.id;
      if (!grouped[evalId]) {
        grouped[evalId] = {
          evaluation_title: attempt.evaluations.title,
          attempts: 0,
          best_score: null,
          passed: false,
          last_attempt_at: null,
        };
      }
      grouped[evalId].attempts++;
      if (attempt.score !== null && (grouped[evalId].best_score === null || attempt.score > grouped[evalId].best_score)) {
        grouped[evalId].best_score = attempt.score;
      }
      if (attempt.status === "passed") grouped[evalId].passed = true;
      if (!grouped[evalId].last_attempt_at || attempt.started_at > grouped[evalId].last_attempt_at) {
        grouped[evalId].last_attempt_at = attempt.started_at;
      }
    }

    return Object.values(grouped);
  } catch (error) {
    throw boom.internal(error.message);
  }
};
