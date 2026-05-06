// Representa la estructura de una evaluación al crearla
export class Evaluation {
  constructor(data) {
    this.course_id    = data.courseId    ?? null;
    this.module_id    = data.moduleId    ?? null;
    this.lesson_id    = data.lessonId    ?? null;
    this.title        = data.title;
    this.passing_score = data.passingScore ?? 70;
    this.max_attempts  = data.maxAttempts  ?? 1;
    this.is_active     = true;
  }
}

// Representa una pregunta dentro de una evaluación
export class EvaluationQuestion {
  constructor(data, evaluationId, position) {
    this.evaluation_id  = evaluationId;
    this.question_type  = data.question_type;
    this.prompt         = data.prompt;
    this.position       = position;
  }
}

// Representa una opción de respuesta (is_correct solo se usa server-side)
export class EvaluationOption {
  constructor(data, questionId) {
    this.question_id  = questionId;
    this.option_text  = data.option_text;
    this.is_correct   = data.is_correct ?? false;
  }
}

// Representa un intento de evaluación por parte de un alumno
export class EvaluationAttempt {
  constructor(evaluationId, userId, attemptNumber) {
    this.evaluation_id  = evaluationId;
    this.user_id        = userId;
    this.attempt_number = attemptNumber;
    this.status         = 'in_progress';
    this.started_at     = new Date().toISOString();
  }
}
