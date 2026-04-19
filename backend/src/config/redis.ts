import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

const createRedisClient = () => {
  const redisUrl = env.redisUrl;
  const isSSL = redisUrl.startsWith('rediss://');

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    tls: isSSL ? { rejectUnauthorized: false } : undefined,
  });

  client.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  client.on('error', (err) => {
    logger.error('❌ Redis error:', err.message);
  });

  return client;
};

const redis = createRedisClient();
export default redis;