// 🎓LMS: Definición de rutas para el módulo de Cursos
import { Router } from 'express';
import * as CourseController from '../controllers/courses.controller';

const router = Router();

// Ruta para obtener el catálogo completo
router.get('/', CourseController.getAll);
router.get('/:id', CourseController.getById);

export default router;