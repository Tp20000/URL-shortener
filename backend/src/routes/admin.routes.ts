import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { manualTriggers } from '../jobs/scheduler';
import { logger } from '../config/logger';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(requireRole(['ADMIN']));

// ─── System Stats ─────────────────────────────────────────
router.get('/stats', adminController.getSystemStats);

// ─── User Management ──────────────────────────────────────
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id/toggle', adminController.toggleUserStatus);
router.patch('/users/:id/role', adminController.changeUserRole);
router.delete('/users/:id', adminController.deleteUser);

// ─── URL Management ───────────────────────────────────────
router.get('/urls', adminController.listAllUrls);
router.patch('/urls/:id/toggle', adminController.toggleUrlStatus);
router.delete('/urls/:id', adminController.deleteUrl);

// ─── Manual Job Triggers (for testing) ───────────────────
router.post('/trigger/cleanup', async (_req, res, next) => {
  try {
    logger.info('🔧 [Admin] Manual cleanup triggered');
    await manualTriggers.cleanup();
    res.json({ success: true, message: 'Cleanup job completed' });
  } catch (error) {
    next(error);
  }
});

router.post('/trigger/aggregate', async (_req, res, next) => {
  try {
    logger.info('🔧 [Admin] Manual aggregation triggered');
    await manualTriggers.aggregate();
    res.json({ success: true, message: 'Aggregation job completed' });
  } catch (error) {
    next(error);
  }
});

router.post('/trigger/cache-refresh', async (_req, res, next) => {
  try {
    logger.info('🔧 [Admin] Manual cache refresh triggered');
    await manualTriggers.cacheRefresh();
    res.json({ success: true, message: 'Cache refresh completed' });
  } catch (error) {
    next(error);
  }
});

export default router;