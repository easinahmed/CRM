import { Router } from 'express';
import * as customerController from '../controllers/customer.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { ROLES } from '../utils/constants.js';

const router = Router();
router.use(authenticate);

router.get('/', customerController.list);
router.get('/:id', customerController.getById);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES), customerController.create);
router.put('/:id', customerController.update);
router.delete('/:id', customerController.remove);
router.post('/bulk-delete', customerController.bulkDelete);
router.post('/:id/restore', customerController.restore);
router.delete('/:id/permanent', authorize(ROLES.SUPER_ADMIN), customerController.destroy);

export default router;
