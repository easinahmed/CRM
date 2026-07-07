import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/stats', dashboardController.stats);
router.get('/revenue-chart', dashboardController.revenueChart);

export default router;
