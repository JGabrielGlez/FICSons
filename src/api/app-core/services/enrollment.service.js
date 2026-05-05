import * as queries from "../queries/enrollment.queries.js";

export async function checkPrerequisites(userId, courseId) {
  const prereqs = await queries.getCoursePrerequisites(courseId);
  if (!prereqs || prereqs.length === 0) {
    return { allowed: true, missing: [] };
  }

  const missing = [];

  for (const p of prereqs) {
    const prereqCourseId =
      p.prerequisite_course_id ||
      p.prerequisite_course ||
      p.prerequisite_course_id;
    const minScore = p.min_score != null ? Number(p.min_score) : 0;

    // get evaluation ids for the prereq course
    const evalIds = await queries.getEvaluationsByCourse(prereqCourseId);

    if (!evalIds || evalIds.length === 0) {
      // no evaluations found -> consider prerequisite missing
      missing.push(prereqCourseId);
      continue;
    }

    const attempts = await queries.getAttemptsForEvaluations(userId, evalIds);
    const passed = attempts.some((a) => {
      if (!a) return false;
      if (a.status === "passed") return true;
      if (a.score != null && Number(a.score) >= minScore) return true;
      return false;
    });

    if (!passed) missing.push(prereqCourseId);
  }

  return { allowed: missing.length === 0, missing };
}

export async function requestEnrollment(userId, courseId) {
  const course = await queries.getCourseById(courseId);
  if (!course) {
    const err = new Error("Course not found");
    err.status = 404;
    throw err;
  }

  const prereqCheck = await checkPrerequisites(userId, courseId);
  if (!prereqCheck.allowed) {
    return {
      enrollment_status: "blocked",
      missing_prerequisites: prereqCheck.missing,
    };
  }

  const existing = await queries.queryExistingEnrollment(userId, courseId);
  if (existing) {
    return { enrollment_status: "enrolled", missing_prerequisites: [] };
  }

  await queries.insertEnrollment(userId, courseId);
  return { enrollment_status: "enrolled", missing_prerequisites: [] };
}

export async function getMyEnrollments(userId) {
  const rows = await queries.queryEnrollmentsByUser(userId);
  return (rows || []).map((r) => ({
    id: r.id,
    courseId: r.course_id,
    status: r.status,
    enrolled_at: r.enrolled_at,
    completed_at: r.completed_at,
    progress_pct: null,
  }));
}

export async function dropEnrollment(enrollmentId, userId) {
  const updated = await queries.updateEnrollmentStatus(
    enrollmentId,
    userId,
    "dropped",
  );
  // If updated is null, no row matched (not found or not user's)
  return updated ? true : false;
}
