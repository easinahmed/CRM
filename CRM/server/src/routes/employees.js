import { Router } from 'express';
import * as employeeController from '../controllers/employee.js';
import * as attendanceController from '../controllers/attendance.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { ROLES } from '../utils/constants.js';

const router = Router();
router.use(authenticate);

router.get('/', employeeController.list);
router.get('/:id', employeeController.getById);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR), employeeController.create);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.remove);

router.post('/attendance/checkin', attendanceController.checkIn);
router.post('/attendance/:employeeId/checkout', attendanceController.checkOut);
router.get('/attendance/list', attendanceController.list);

export default router;
