
// Importamos el enrutador de express
import {Router} from 'express'
// Importamos el controlador (que manda a llamar a los servicios)
import * as institutosController from '../controllers/instituto.controller';

// Creamos el router
const router = Router();
// Creamos las rutas, cualquier cosa que llegue a la ruta (primer parámetro) será enviado a su respectivo controlador (segundo parámetro)
router.get('/', institutosController.getInstitutosList);
router.get('/:id', institutosController.getInstitutoItem);
router.post('/', institutosController.addInstitutoItem);
router.put('/:id', institutosController.updateInstitutoItem);
router.delete('/:id', institutosController.deleteInstitutoItem);
export default router;