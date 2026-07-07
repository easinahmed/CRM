import { Router } from 'express';
import * as userController from '../controllers/user.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { ROLES } from '../utils/constants.js';

const router = Router();
router.use(authenticate);

router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), userController.list);
router.put('/profile', userController.updateProfile);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), userController.updateUser);

export default router;
