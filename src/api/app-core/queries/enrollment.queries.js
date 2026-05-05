import supabase from '../../../app-core/shared/db.js';

export async function getCourseById(courseId) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function queryEnrollmentsByUser(userId) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('id, course_id, status, enrolled_at, completed_at')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function queryExistingEnrollment(userId, courseId) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function insertEnrollment(userId, courseId) {
  const payload = { user_id: userId, course_id: courseId, status: 'active' };
  const { data, error } = await supabase.from('enrollments').insert(payload).single();
  if (error) throw error;
  return data;
}

export async function updateEnrollmentStatus(enrollmentId, userId, status) {
  const { data, error } = await supabase
    .from('enrollments')
    .update({ status })
    .eq('id', enrollmentId)
    .eq('user_id', userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCoursePrerequisites(courseId) {
  const { data, error } = await supabase
    .from('course_prerequisites')
    .select('*')
    .eq('course_id', courseId);
  if (error) throw error;
  return data || [];
}

export async function getEvaluationsByCourse(courseId) {
  const { data, error } = await supabase
    .from('evaluations')
    .select('id')
    .eq('course_id', courseId);
  if (error) throw error;
  return (data || []).map((r) => r.id);
}

export async function getAttemptsForEvaluations(userId, evaluationIds) {
  if (!evaluationIds || evaluationIds.length === 0) return [];
  const { data, error } = await supabase
    .from('evaluation_attempts')
    .select('id, evaluation_id, score, status')
    .in('evaluation_id', evaluationIds)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
