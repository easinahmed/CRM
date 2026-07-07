import { Router } from 'express';
import * as transactionController from '../controllers/transaction.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', transactionController.list);
router.get('/summary', transactionController.summary);
router.post('/', transactionController.create);

export default router;
