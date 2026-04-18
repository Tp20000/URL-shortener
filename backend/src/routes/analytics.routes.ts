import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// Dashboard overview
router.get('/dashboard', analyticsController.getDashboard);

// URL-specific analytics
router.get('/urls/:id', analyticsController.getUrlAnalytics);

export default router;