import { Router } from 'express';
import * as productController from '../controllers/product.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', productController.list);
router.get('/low-stock', productController.lowStock);
router.get('/:id', productController.getById);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.remove);

export default router;
