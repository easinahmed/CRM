import { Router } from 'express';
import * as dealController from '../controllers/deal.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', dealController.list);
router.get('/pipeline', dealController.pipeline);
router.get('/:id', dealController.getById);
router.post('/', dealController.create);
router.put('/:id', dealController.update);
router.patch('/:id/stage', dealController.updateStage);
router.delete('/:id', dealController.remove);

export default router;
