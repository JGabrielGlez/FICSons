// 🎓LMS: Definición de rutas para el módulo de Cursos
import { Router } from 'express';
import * as CourseController from '../controllers/courses.controller';

const router = Router();

// Ruta para obtener el catálogo completo
router.get('/', CourseController.getAll);
router.get('/:id', CourseController.getById);

// Rutas de Instructor (Requieren Bearer Token)
router.post('/instructor/courses', CourseController.create);
router.put('/instructor/courses/:id', CourseController.update);
router.delete('/instructor/courses/:id', CourseController.remove);

// Gestión de Equipo
router.get('/instructor/courses/:id/team', CourseController.getTeam);
router.post('/instructor/courses/:id/team', CourseController.addMember);

export default router;