import redis from '../config/redis';
import { logger } from '../config/logger';

const DEFAULT_TTL = 60 * 60 * 24; // 24 hours in seconds

export const cacheService = {
  /**
   * Cache a URL mapping: shortCode → originalUrl
   */
  async setUrl(shortCode: string, originalUrl: string, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds || DEFAULT_TTL;
      await redis.set(`url:${shortCode}`, originalUrl, 'EX', ttl);
    } catch (error) {
      logger.error('Redis SET error:', error);
    }
  },

  /**
   * Get cached URL by shortCode
   */
  async getUrl(shortCode: string): Promise<string | null> {
    try {
      return await redis.get(`url:${shortCode}`);
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  },

  /**
   * Delete cached URL
   */
  async deleteUrl(shortCode: string): Promise<void> {
    try {
      await redis.del(`url:${shortCode}`);
    } catch (error) {
      logger.error('Redis DEL error:', error);
    }
  },

  /**
   * Increment click counter in Redis (fast atomic counter)
   * We'll flush to DB periodically or on read
   */
  async incrementClick(shortCode: string): Promise<number> {
    try {
      return await redis.incr(`clicks:${shortCode}`);
    } catch (error) {
      logger.error('Redis INCR error:', error);
      return 0;
    }
  },

  /**
   * Get click count from Redis
   */
  async getClickCount(shortCode: string): Promise<number> {
    try {
      const count = await redis.get(`clicks:${shortCode}`);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      logger.error('Redis GET clicks error:', error);
      return 0;
    }
  },

  /**
   * Generic cache set
   */
  async set(key: string, value: string, ttlSeconds: number = DEFAULT_TTL): Promise<void> {
    try {
      await redis.set(key, value, 'EX', ttlSeconds);
    } catch (error) {
      logger.error('Redis SET error:', error);
    }
  },

  /**
   * Generic cache get
   */
  async get(key: string): Promise<string | null> {
    try {
      return await redis.get(key);
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  },

  /**
   * Generic cache delete
   */
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Redis DEL error:', error);
    }
  },
};