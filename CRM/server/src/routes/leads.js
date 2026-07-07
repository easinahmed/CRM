import { Router } from 'express';
import * as leadController from '../controllers/lead.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', leadController.list);
router.get('/:id', leadController.getById);
router.post('/', leadController.create);
router.put('/:id', leadController.update);
router.delete('/:id', leadController.remove);
router.post('/:id/convert', leadController.convert);
router.post('/bulk-delete', leadController.bulkDelete);

export default router;
