import { Router, Request, Response, NextFunction } from 'express';
import { urlService } from '../services/url.service';
import { redirectLimiter } from '../middlewares/rateLimiter.middleware';
import { logger } from '../config/logger';

const router = Router();

// Skip paths that should not be treated as short codes
const SKIP_PATHS = ['api', 'favicon.ico', 'robots.txt', 'sitemap.xml', 'health'];

router.get(
  '/:code',
  redirectLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const code = req.params['code'] as string; // ← FIXED: bracket + cast

      if (SKIP_PATHS.includes(code)) {
        next();
        return;
      }

      const urlData = await urlService.resolveUrl(code); // ← now string

      if (!urlData) {
        res.status(404).json({
          success: false,
          message: 'Short URL not found or has expired',
        });
        return;
      }

      // Record click asynchronously — do NOT block the redirect
      urlService
        .recordClick(urlData.id, code, { // ← now string
          ip:
            (req.headers['x-forwarded-for'] as string) ||
            req.ip ||
            req.socket.remoteAddress ||
            '',
          userAgent: req.headers['user-agent'] || '',
          referer:
            (req.headers['referer'] as string) ||
            (req.headers['referrer'] as string) ||
            '',
        })
        .catch((err: Error) => {
          logger.error('Failed to record click:', err.message);
        });

      // 302 temporary redirect
      res.redirect(302, urlData.originalUrl);
    } catch (error) {
      next(error);
    }
  }
);

export default router;