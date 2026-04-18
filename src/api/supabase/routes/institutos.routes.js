import {Router} from 'express'
import * as institutosController from '../controllers/instituto.controller';


const router = Router();
router.get('/',institutosController.getInstitutosList);
router.get('/:id', InstitutosController.getInstitutoItem); 
export default router;