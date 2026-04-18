import { Router } from 'express';
import { urlController } from '../controllers/url.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { optionalAuth } from '../middlewares/optionalAuth.middleware';
import { validate } from '../middlewares/validator.middleware';
import { createUrlSchema, updateUrlSchema } from '../utils/validators/url.schema';
import { createUrlLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// Create URL — works for both anonymous and authenticated users
router.post(
  '/',
  createUrlLimiter,
  optionalAuth,
  validate(createUrlSchema),
  urlController.create
);

// Everything below requires authentication
router.use(authenticate);

router.get('/', urlController.list);
router.get('/:id', urlController.getById);
router.patch('/:id', validate(updateUrlSchema), urlController.update);
router.delete('/:id', urlController.remove);

export default router;