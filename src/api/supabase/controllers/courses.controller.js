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

// POST: Crear un nuevo curso (Instructor)
export const create = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT: Actualizar curso (Owner/Collab)
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('courses')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: 'updated', data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE: Borrar curso
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET: Ver colaboradores del equipo
export const getTeam = async (req, res) => {
  try {
    const { id } = req.params;
    // 💬FIC: Asumiendo que existe una tabla intermedia 'course_instructors'
    const { data, error } = await supabase
      .from('course_instructors')
      .select('user_id, role')
      .eq('course_id', id);

    if (error) throw error;
    res.status(200).json({ instructors: data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// POST: Agregar colaborador
export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, role } = req.body;
    const { data, error } = await supabase
      .from('course_instructors')
      .insert([{ course_id: id, user_id, role }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};