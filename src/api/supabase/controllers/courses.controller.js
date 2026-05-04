// 🎓LMS: Controlador para gestionar la lógica de Cursos (Fernando)
import { supabase } from '../../../config/database.config.js';
import * as CourseService from '../services/courses.service';

export const getAll = async (req, res) => {
  try {
    const data = await CourseService.getAllCourses();
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params; 
    
    if (!id) throw new Error("ID de curso requerido");

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id) 
      .maybeSingle();

    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: `No se encontró el curso con ID: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};