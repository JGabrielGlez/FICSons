// enrollment.routes.ts
import { Router } from 'express'
import { authenticateJWT } from '../middlewares/auth.js'
import { EnrollmentController } from '../controllers/enrollment.controller.js'

const router = Router()

router.get('/enrollments', authenticateJWT, EnrollmentController.getMyEnrollments)
router.post('/enrollments', authenticateJWT, EnrollmentController.requestEnrollment)
router.delete('/enrollments/:id', authenticateJWT, EnrollmentController.cancelEnrollment)

//ruta ejemplo, ya que se desarrollará en otro microservicio
router.get('/courses/:id/can-enroll', authenticateJWT, EnrollmentController.canEnroll)

export default router