import { Router } from 'express';
import * as productController from '../controllers/product.js';
import { authenticate } from '../middleware/auth.js';
import { validateCreateProduct, validateUpdateProduct, convertReferenceFields } from '../validators/product.js';

const router = Router();
router.use(authenticate);

router.get('/', productController.list);
router.get('/low-stock', productController.lowStock);
router.get('/:id', productController.getById);
router.post('/', validateCreateProduct, convertReferenceFields, productController.create);
router.put('/:id', validateUpdateProduct, convertReferenceFields, productController.update);
router.delete('/:id', productController.remove);

export default router;
