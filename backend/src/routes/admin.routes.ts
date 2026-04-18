import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/auth.middleware';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(requireRole(['ADMIN']));

// System stats
router.get('/stats', adminController.getSystemStats);

// User management
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id/toggle', adminController.toggleUserStatus);
router.patch('/users/:id/role', adminController.changeUserRole);
router.delete('/users/:id', adminController.deleteUser);

// URL management
router.get('/urls', adminController.listAllUrls);
router.patch('/urls/:id/toggle', adminController.toggleUrlStatus);
router.delete('/urls/:id', adminController.deleteUrl);

export default router;