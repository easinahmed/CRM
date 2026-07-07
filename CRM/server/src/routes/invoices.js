import { Router } from 'express';
import * as invoiceController from '../controllers/invoice.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', invoiceController.list);
router.get('/:id', invoiceController.getById);
router.post('/', invoiceController.create);
router.put('/:id', invoiceController.update);

export default router;
