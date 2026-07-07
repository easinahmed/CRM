import { Router } from 'express';
import * as settingsController from '../controllers/settings.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { ROLES } from '../utils/constants.js';

const router = Router();
router.use(authenticate);

router.get('/', settingsController.get);
router.put('/', authorize(ROLES.SUPER_ADMIN), settingsController.update);

export default router;
