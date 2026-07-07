import { Router } from 'express';
import * as purchaseController from '../controllers/purchase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', purchaseController.list);
router.get('/:id', purchaseController.getById);
router.post('/', purchaseController.create);
router.put('/:id', purchaseController.update);

export default router;
