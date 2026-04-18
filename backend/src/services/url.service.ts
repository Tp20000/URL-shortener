import prisma from '../config/database';
import { generateShortId } from '../utils/shortId';
import { sanitizeUrl, paginate } from '../utils/helpers';
import { cacheService } from './cache.service';
import { AppError } from '../middlewares/errorHandler.middleware';
import { CreateUrlDto } from '../types';
import { logger } from '../config/logger';
import { parseUserAgent } from '../utils/uaParser'; // ← our own utility

// Reserved words that can't be used as aliases
const RESERVED_WORDS = [
  'api', 'admin', 'login', 'register', 'dashboard',
  'analytics', 'settings', 'health', 'docs', 'auth',
  'logout', 'signup', 'signin', 'app', 'static',
  'public', 'assets', 'css', 'js', 'img',
];

export const urlService = {
  /**
   * Create a shortened URL
   */
  async createUrl(data: CreateUrlDto, userId?: string) {
    const originalUrl = sanitizeUrl(data.originalUrl);

    // Handle custom alias
    if (data.customAlias) {
      const alias = data.customAlias.toLowerCase();

      if (RESERVED_WORDS.includes(alias)) {
        throw new AppError(
          `"${alias}" is a reserved word and cannot be used as an alias`,
          400
        );
      }

      const existingAlias = await prisma.url.findUnique({
        where: { customAlias: alias },
      });

      if (existingAlias) {
        throw new AppError('Custom alias already taken', 409);
      }

      const existingCode = await prisma.url.findUnique({
        where: { shortCode: alias },
      });

      if (existingCode) {
        throw new AppError('This alias conflicts with an existing short code', 409);
      }
    }

    // Generate unique short code with collision retry
    let shortCode = generateShortId();
    let retries = 0;
    const MAX_RETRIES = 5;

    while (retries < MAX_RETRIES) {
      const existing = await prisma.url.findUnique({
        where: { shortCode },
      });

      if (!existing) break;

      shortCode = generateShortId();
      retries++;
      logger.warn(`Short code collision, retry ${retries}: ${shortCode}`);
    }

    if (retries >= MAX_RETRIES) {
      throw new AppError('Failed to generate unique short code. Please try again.', 500);
    }

    // Create URL record
    const url = await prisma.url.create({
      data: {
        shortCode,
        originalUrl,
        customAlias: data.customAlias?.toLowerCase() || null,
        title: data.title || null,
        userId: userId || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        customAlias: true,
        title: true,
        isActive: true,
        expiresAt: true,
        clickCount: true,
        createdAt: true,
      },
    });

    // Cache in Redis for fast redirects
    const ttl = data.expiresAt
      ? Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000)
      : undefined;

    await cacheService.setUrl(url.shortCode, url.originalUrl, ttl);

    if (url.customAlias) {
      await cacheService.setUrl(url.customAlias, url.originalUrl, ttl);
    }

    return url;
  },

  /**
   * Resolve a short code / alias to original URL (for redirect)
   */
  async resolveUrl(code: string): Promise<{ id: string; originalUrl: string } | null> {
    // 1. Check Redis cache first
    const cachedUrl = await cacheService.getUrl(code);

    if (cachedUrl) {
      const urlRecord = await prisma.url.findFirst({
        where: {
          OR: [{ shortCode: code }, { customAlias: code }],
          isActive: true,
        },
        select: { id: true, originalUrl: true, expiresAt: true },
      });

      if (!urlRecord) return null;

      if (urlRecord.expiresAt && urlRecord.expiresAt < new Date()) {
        await cacheService.deleteUrl(code);
        return null;
      }

      return { id: urlRecord.id, originalUrl: cachedUrl };
    }

    // 2. Cache miss — query DB
    const urlRecord = await prisma.url.findFirst({
      where: {
        OR: [{ shortCode: code }, { customAlias: code }],
        isActive: true,
      },
      select: { id: true, originalUrl: true, expiresAt: true, shortCode: true },
    });

    if (!urlRecord) return null;

    if (urlRecord.expiresAt && urlRecord.expiresAt < new Date()) {
      return null;
    }

    const ttl = urlRecord.expiresAt
      ? Math.floor((urlRecord.expiresAt.getTime() - Date.now()) / 1000)
      : undefined;

    await cacheService.setUrl(code, urlRecord.originalUrl, ttl);

    return { id: urlRecord.id, originalUrl: urlRecord.originalUrl };
  },

  /**
   * Record a click (writes to DB + increments Redis counter)
   */
  async recordClick(
    urlId: string,
    shortCode: string,
    reqData: {
      ip?: string;
      userAgent?: string;
      referer?: string;
    }
  ) {
    // Use our own zero-dependency UA parser
    const { device, browser, os } = parseUserAgent(reqData.userAgent || '');

    await prisma.click.create({
      data: {
        urlId,
        ipAddress: reqData.ip || null,
        userAgent: reqData.userAgent || null,
        referer: reqData.referer || null,
        device,
        browser,
        os,
        country: null, // geo-lookup planned for later
        city: null,
      },
    });

    // Increment DB click counter atomically
    await prisma.url.update({
      where: { id: urlId },
      data: { clickCount: { increment: 1 } },
    });

    // Increment Redis counter (for fast reads)
    await cacheService.incrementClick(shortCode);
  },

  /**
   * Get all URLs for a user (paginated)
   */
  async getUserUrls(userId: string, page: number = 1, limit: number = 10) {
    const { skip, take, page: safePage, limit: safeLimit } = paginate(page, limit);

    const [urls, total] = await Promise.all([
      prisma.url.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          shortCode: true,
          originalUrl: true,
          customAlias: true,
          title: true,
          isActive: true,
          expiresAt: true,
          clickCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.url.count({ where: { userId } }),
    ]);

    return {
      urls,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  },

  /**
   * Get a single URL by ID (owned by user or admin)
   */
  async getUrlById(id: string, userId?: string) {
    const url = await prisma.url.findUnique({
      where: { id },
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        customAlias: true,
        title: true,
        isActive: true,
        expiresAt: true,
        clickCount: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!url) {
      throw new AppError('URL not found', 404);
    }

    if (userId && url.userId !== userId) {
      throw new AppError('You do not have access to this URL', 403);
    }

    return url;
  },

  /**
   * Update a URL
   */
  async updateUrl(
    id: string,
    userId: string,
    data: {
      originalUrl?: string;
      title?: string;
      expiresAt?: string | null;
      isActive?: boolean;
    }
  ) {
    const existing = await this.getUrlById(id, userId);

    const updateData: Record<string, unknown> = {};

    if (data.originalUrl !== undefined) {
      updateData['originalUrl'] = sanitizeUrl(data.originalUrl);
    }
    if (data.title !== undefined) {
      updateData['title'] = data.title;
    }
    if (data.expiresAt !== undefined) {
      updateData['expiresAt'] = data.expiresAt ? new Date(data.expiresAt) : null;
    }
    if (data.isActive !== undefined) {
      updateData['isActive'] = data.isActive;
    }

    const updated = await prisma.url.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        customAlias: true,
        title: true,
        isActive: true,
        expiresAt: true,
        clickCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Invalidate and rebuild cache
    if (data.originalUrl !== undefined || data.isActive === false) {
      await cacheService.deleteUrl(existing.shortCode);
      if (existing.customAlias) {
        await cacheService.deleteUrl(existing.customAlias);
      }

      if (updated.isActive) {
        const ttl = updated.expiresAt
          ? Math.floor((updated.expiresAt.getTime() - Date.now()) / 1000)
          : undefined;
        await cacheService.setUrl(updated.shortCode, updated.originalUrl, ttl);
        if (updated.customAlias) {
          await cacheService.setUrl(updated.customAlias, updated.originalUrl, ttl);
        }
      }
    }

    return updated;
  },

  /**
   * Delete a URL
   */
  async deleteUrl(id: string, userId: string) {
    const existing = await this.getUrlById(id, userId);

    await prisma.url.delete({ where: { id } });

    await cacheService.deleteUrl(existing.shortCode);
    if (existing.customAlias) {
      await cacheService.deleteUrl(existing.customAlias);
    }

    return { message: 'URL deleted successfully' };
  },
};