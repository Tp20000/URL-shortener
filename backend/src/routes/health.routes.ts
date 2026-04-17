import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import redis from '../config/redis';
import { logger } from '../config/logger';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const healthCheck: Record<string, any> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {},
  };

  // Check PostgreSQL
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.services.database = { status: 'healthy' };
  } catch (error) {
    healthCheck.services.database = { status: 'unhealthy', error: (error as Error).message };
    healthCheck.status = 'degraded';
  }

  // Check Redis
  try {
    const pong = await redis.ping();
    healthCheck.services.redis = { status: pong === 'PONG' ? 'healthy' : 'unhealthy' };
  } catch (error) {
    healthCheck.services.redis = { status: 'unhealthy', error: (error as Error).message };
    healthCheck.status = 'degraded';
  }

  const httpStatus = healthCheck.status === 'ok' ? 200 : 503;
  res.status(httpStatus).json(healthCheck);
});

export default router;