// 🎓LMS: Servicio para gestionar el catálogo de cursos (ES)
import { supabase } from '../../../config/database.config';

export const getAllCourses = async () => {
  const { data, error } = await supabase
    .from('courses') // 💬FIC: Usar el nombre exacto de la tabla
    .select('*');
  if (error) throw error;
  return data;
};