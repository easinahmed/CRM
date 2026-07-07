import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import customerRoutes from './customers.js';
import leadRoutes from './leads.js';
import dealRoutes from './deals.js';
import productRoutes from './products.js';
import orderRoutes from './orders.js';
import invoiceRoutes from './invoices.js';
import employeeRoutes from './employees.js';
import purchaseRoutes from './purchases.js';
import transactionRoutes from './transactions.js';
import dashboardRoutes from './dashboard.js';
import settingsRoutes from './settings.js';

import * as categoryController from '../controllers/category.js';
import * as brandController from '../controllers/brand.js';
import * as supplierController from '../controllers/supplier.js';
import * as leaveController from '../controllers/leave.js';
import notificationRoutes from './notifications.js';
import reportRoutes from './reports.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/customers', customerRoutes);
router.use('/leads', leadRoutes);
router.use('/deals', dealRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/employees', employeeRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/transactions', transactionRoutes);
router.use('/settings', settingsRoutes);

router.get('/categories', authenticate, categoryController.list);
router.get('/categories/:id', authenticate, categoryController.getById);
router.post('/categories', authenticate, categoryController.create);
router.put('/categories/:id', authenticate, categoryController.update);
router.delete('/categories/:id', authenticate, categoryController.remove);

router.get('/brands', authenticate, brandController.list);
router.get('/brands/:id', authenticate, brandController.getById);
router.post('/brands', authenticate, brandController.create);
router.put('/brands/:id', authenticate, brandController.update);
router.delete('/brands/:id', authenticate, brandController.remove);

router.get('/suppliers', authenticate, supplierController.list);
router.get('/suppliers/:id', authenticate, supplierController.getById);
router.post('/suppliers', authenticate, supplierController.create);
router.put('/suppliers/:id', authenticate, supplierController.update);
router.delete('/suppliers/:id', authenticate, supplierController.remove);

router.get('/leaves', authenticate, leaveController.list);
router.post('/leaves', authenticate, leaveController.create);
router.post('/leaves/:id/approve', authenticate, leaveController.approve);
router.post('/leaves/:id/reject', authenticate, leaveController.reject);

router.use('/reports', authenticate, reportRoutes);
router.use('/notifications', authenticate, notificationRoutes);

export default router;
