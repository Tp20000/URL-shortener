import { logger } from '../config/logger';
import prisma from '../config/database';
import { cacheService } from '../services/cache.service';

// ─── Job: Cleanup Expired URLs ────────────────────────────
async function cleanupExpiredUrls(): Promise<void> {
  try {
    logger.info('🗑️ [Scheduler] Running expired URL cleanup...');
    const now = new Date();

    // Mark expired-but-still-active URLs as inactive
    const deactivated = await prisma.url.updateMany({
      where: {
        expiresAt: { lt: now },
        isActive: true,
      },
      data: { isActive: false },
    });

    // Permanently delete URLs expired more than 7 days ago
    const deleted = await prisma.url.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        isActive: false,
      },
    });

    if (deactivated.count > 0 || deleted.count > 0) {
      logger.info(
        `✅ [Scheduler] Cleanup done: ${deactivated.count} deactivated, ${deleted.count} permanently deleted`
      );
    } else {
      logger.info('✅ [Scheduler] Cleanup done: nothing to clean');
    }
  } catch (error: any) {
    logger.error(`❌ [Scheduler] Cleanup failed: ${error.message}`);
  }
}

// ─── Job: Aggregate Click Stats ───────────────────────────
async function aggregateClickStats(): Promise<void> {
  try {
    const [totalUrls, totalClicks, last24h] = await Promise.all([
      prisma.url.count(),
      prisma.click.count(),
      prisma.click.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    logger.info(
      `📈 [Scheduler] Stats — URLs: ${totalUrls}, Total clicks: ${totalClicks}, Last 24h: ${last24h}`
    );
  } catch (error: any) {
    logger.error(`❌ [Scheduler] Aggregation failed: ${error.message}`);
  }
}

// ─── Job: Refresh Hot URL Cache ───────────────────────────
async function refreshHotUrlCache(): Promise<void> {
  try {
    // Get top 50 most-clicked active URLs and warm their cache
    const hotUrls = await prisma.url.findMany({
      where: { isActive: true },
      orderBy: { clickCount: 'desc' },
      take: 50,
      select: {
        shortCode: true,
        customAlias: true,
        originalUrl: true,
        expiresAt: true,
      },
    });

    for (const url of hotUrls) {
      const ttl = url.expiresAt
        ? Math.floor((url.expiresAt.getTime() - Date.now()) / 1000)
        : 86400; // 24h default

      if (ttl > 0) {
        await cacheService.setUrl(url.shortCode, url.originalUrl, ttl);
        if (url.customAlias) {
          await cacheService.setUrl(url.customAlias, url.originalUrl, ttl);
        }
      }
    }

    if (hotUrls.length > 0) {
      logger.info(
        `♻️ [Scheduler] Cache warmed for ${hotUrls.length} hot URLs`
      );
    }
  } catch (error: any) {
    logger.error(`❌ [Scheduler] Cache refresh failed: ${error.message}`);
  }
}

// ─── Scheduler Registry ───────────────────────────────────
interface ScheduledJob {
  name: string;
  fn: () => Promise<void>;
  intervalMs: number;
  timer?: NodeJS.Timeout;
}

const jobs: ScheduledJob[] = [
  {
    name: 'cleanup-expired-urls',
    fn: cleanupExpiredUrls,
    intervalMs: 60 * 60 * 1000, // every 1 hour
  },
  {
    name: 'aggregate-click-stats',
    fn: aggregateClickStats,
    intervalMs: 5 * 60 * 1000, // every 5 minutes
  },
  {
    name: 'refresh-hot-cache',
    fn: refreshHotUrlCache,
    intervalMs: 30 * 60 * 1000, // every 30 minutes
  },
];

// ─── Start All Scheduled Jobs ─────────────────────────────
export function startScheduler(): void {
  logger.info('⏰ [Scheduler] Starting native job scheduler...');

  for (const job of jobs) {
    // Run once immediately on startup (after 5s delay)
    const startupDelay = setTimeout(async () => {
      logger.info(`▶️ [Scheduler] Running initial: ${job.name}`);
      await job.fn();
    }, 5000);

    // Then run on interval
    job.timer = setInterval(async () => {
      logger.info(`⏰ [Scheduler] Running scheduled: ${job.name}`);
      await job.fn();
    }, job.intervalMs);

    // Prevent timers from keeping process alive unnecessarily
    job.timer.unref();
    startupDelay.unref();

    logger.info(
      `✅ [Scheduler] Registered: ${job.name} (every ${job.intervalMs / 1000}s)`
    );
  }

  logger.info('✅ [Scheduler] All jobs scheduled successfully');
}

// ─── Stop All Scheduled Jobs ──────────────────────────────
export function stopScheduler(): void {
  logger.info('⏸️ [Scheduler] Stopping all jobs...');
  for (const job of jobs) {
    if (job.timer) {
      clearInterval(job.timer);
    }
  }
  logger.info('✅ [Scheduler] All jobs stopped');
}

// ─── Manual Triggers (for admin panel) ───────────────────
export const manualTriggers = {
  cleanup: cleanupExpiredUrls,
  aggregate: aggregateClickStats,
  cacheRefresh: refreshHotUrlCache,
};