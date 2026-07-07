import { Router } from 'express';
import * as reportController from '../controllers/report.js';

const router = Router();

router.get('/sales', reportController.sales);
router.get('/customers', reportController.customers);
router.get('/inventory', reportController.inventory);
router.get('/profit-loss', reportController.profitLoss);
router.get('/employees', reportController.employees);

export default router;
