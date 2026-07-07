import { Router } from 'express';
import * as notificationController from '../controllers/notification.js';

const router = Router();

router.get('/', notificationController.list);
router.put('/read-all', notificationController.markAllRead);
router.put('/:id/read', notificationController.markRead);

export default router;
