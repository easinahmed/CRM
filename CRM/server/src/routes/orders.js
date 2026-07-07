import { Router } from 'express';
import * as orderController from '../controllers/order.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', orderController.list);
router.get('/:id', orderController.getById);
router.post('/', orderController.create);
router.put('/:id', orderController.update);
router.delete('/:id', orderController.remove);

export default router;
