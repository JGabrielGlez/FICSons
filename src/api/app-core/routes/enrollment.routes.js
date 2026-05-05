// enrollment.routes.ts
import { Router } from 'express'
import { authenticateJWT } from '../middlewares/auth.js'
import { EnrollmentController } from '../controllers/enrollment.controller.js'

const router = Router()

router.get('/enrollments', authenticateJWT, EnrollmentController.getMyEnrollments)
router.post('/enrollments', authenticateJWT, EnrollmentController.requestEnrollment)
router.delete('/enrollments/:id', authenticateJWT, EnrollmentController.cancelEnrollment)

// Esta ruta está en /api/courses/:id/can-enroll — puede que viva en otro router
// Consulta con tu equipo si el router de courses la monta o si la montas tú
router.get('/courses/:id/can-enroll', authenticateJWT, EnrollmentController.canEnroll)

export default router