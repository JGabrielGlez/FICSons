// 🎓LMS: Modelo compartido para la entidad de Cursos (Fernando)
//  Este esquema valida los datos tanto en el Backend como en las respuestas de la BD.
import { z } from 'zod';

/**
 * Esquema de validación para un Curso
 * Define las restricciones de tipo y formato para cada campo[cite: 4].
 */
export const CourseSchema = z.object({
  id: z.string().uuid().optional(), // El ID es opcional al crear, pero obligatorio al recibir[cite: 4]
  title: z.string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(100, "El título es demasiado largo")
    .trim(),
  slug: z.string()
    .min(3, "El slug es obligatorio para la URL amigable")
    .toLowerCase(),
  description: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  thumbnail_url: z.string().url("Debe ser una URL válida").nullable().optional(),
  tags: z.array(z.string()).default([]),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

/**
 * @typedef {z.infer<typeof CourseSchema>} Course
 * Tipo inferido para uso en el resto de la aplicación.
 */

export default CourseSchema;