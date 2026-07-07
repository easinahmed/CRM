import { Router } from 'express';
import * as authController from '../controllers/auth.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
} from '../validators/auth.js';

const router = Router();

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.put('/change-password', authenticate, changePasswordValidation, validate, authController.changePassword);

export default router;
