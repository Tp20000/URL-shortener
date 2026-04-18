import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler.middleware';
import { paginate } from '../utils/helpers';
import { cacheService } from './cache.service';

export const adminService = {
  /**
   * System-wide stats overview
   */
  async getSystemStats() {
    const now = new Date();

    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersLast7Days,
      totalUrls,
      activeUrls,
      urlsCreatedToday,
      totalClicks,
      clicksLast24h,
      clicksLast7Days,
      clicksLast30Days,
      topUrlsAllTime,
      topUsersbyUrls,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: last24h } } }),
      prisma.user.count({ where: { createdAt: { gte: last7Days } } }),

      prisma.url.count(),
      prisma.url.count({
        where: {
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      }),
      prisma.url.count({ where: { createdAt: { gte: last24h } } }),

      prisma.click.count(),
      prisma.click.count({ where: { createdAt: { gte: last24h } } }),
      prisma.click.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.click.count({ where: { createdAt: { gte: last30Days } } }),

      // Top 10 URLs all time
      prisma.url.findMany({
        orderBy: { clickCount: 'desc' },
        take: 10,
        select: {
          id: true,
          shortCode: true,
          originalUrl: true,
          customAlias: true,
          title: true,
          clickCount: true,
          createdAt: true,
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      }),

      // Top 5 users by URL count
      prisma.user.findMany({
        orderBy: { urls: { _count: 'desc' } },
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          _count: { select: { urls: true } },
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsersToday,
        newLast7Days: newUsersLast7Days,
      },
      urls: {
        total: totalUrls,
        active: activeUrls,
        createdToday: urlsCreatedToday,
      },
      clicks: {
        total: totalClicks,
        last24h: clicksLast24h,
        last7Days: clicksLast7Days,
        last30Days: clicksLast30Days,
      },
      topUrls: topUrlsAllTime,
      topUsers: topUsersbyUrls,
    };
  },

  /**
   * List all users (paginated + searchable)
   */
  async listUsers(page: number = 1, limit: number = 10, search?: string) {
    const { skip, take, page: safePage, limit: safeLimit } = paginate(page, limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { urls: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  },

  /**
   * Get single user details with their URLs
   */
  async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        urls: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            shortCode: true,
            originalUrl: true,
            customAlias: true,
            title: true,
            isActive: true,
            clickCount: true,
            createdAt: true,
          },
        },
        _count: { select: { urls: true } },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get total clicks for this user
    const totalClicks = await prisma.click.count({
      where: { url: { userId } },
    });

    return { ...user, totalClicks };
  },

  /**
   * Toggle user active status (ban/unban)
   */
  async toggleUserStatus(userId: string, adminId: string) {
    if (userId === adminId) {
      throw new AppError('You cannot ban yourself', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true, role: true, email: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'ADMIN') {
      throw new AppError('Cannot ban another admin', 403);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return updated;
  },

  /**
   * Change user role
   */
  async changeUserRole(userId: string, role: 'USER' | 'ADMIN', adminId: string) {
    if (userId === adminId) {
      throw new AppError('You cannot change your own role', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return updated;
  },

  /**
   * Delete a user and all their data
   */
  async deleteUser(userId: string, adminId: string) {
    if (userId === adminId) {
      throw new AppError('You cannot delete yourself', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'ADMIN') {
      throw new AppError('Cannot delete another admin', 403);
    }

    // Get all user URLs to clear cache
    const urls = await prisma.url.findMany({
      where: { userId },
      select: { shortCode: true, customAlias: true },
    });

    // Delete in order: clicks → urls → user
    await prisma.$transaction([
      prisma.click.deleteMany({
        where: { url: { userId } },
      }),
      prisma.url.deleteMany({
        where: { userId },
      }),
      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    // Clear cache for all deleted URLs
    for (const url of urls) {
      await cacheService.deleteUrl(url.shortCode);
      if (url.customAlias) {
        await cacheService.deleteUrl(url.customAlias);
      }
    }

    return { message: `User ${user.email} and all their data deleted` };
  },

  /**
   * List all URLs system-wide (paginated + searchable)
   */
  async listAllUrls(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean
  ) {
    const { skip, take, page: safePage, limit: safeLimit } = paginate(page, limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { shortCode: { contains: search, mode: 'insensitive' } },
        { originalUrl: { contains: search, mode: 'insensitive' } },
        { customAlias: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [urls, total] = await Promise.all([
      prisma.url.findMany({
        where,
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
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      }),
      prisma.url.count({ where }),
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
   * Admin delete any URL
   */
  async deleteAnyUrl(urlId: string) {
    const url = await prisma.url.findUnique({
      where: { id: urlId },
      select: { id: true, shortCode: true, customAlias: true },
    });

    if (!url) {
      throw new AppError('URL not found', 404);
    }

    await prisma.url.delete({ where: { id: urlId } });

    await cacheService.deleteUrl(url.shortCode);
    if (url.customAlias) {
      await cacheService.deleteUrl(url.customAlias);
    }

    return { message: 'URL deleted successfully' };
  },

  /**
   * Admin toggle any URL active/inactive
   */
  async toggleUrlStatus(urlId: string) {
    const url = await prisma.url.findUnique({
      where: { id: urlId },
      select: {
        id: true,
        shortCode: true,
        customAlias: true,
        originalUrl: true,
        isActive: true,
        expiresAt: true,
      },
    });

    if (!url) {
      throw new AppError('URL not found', 404);
    }

    const updated = await prisma.url.update({
      where: { id: urlId },
      data: { isActive: !url.isActive },
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        customAlias: true,
        isActive: true,
        clickCount: true,
      },
    });

    // Cache management
    if (updated.isActive) {
      const ttl = url.expiresAt
        ? Math.floor((url.expiresAt.getTime() - Date.now()) / 1000)
        : undefined;
      await cacheService.setUrl(updated.shortCode, updated.originalUrl, ttl);
      if (updated.customAlias) {
        await cacheService.setUrl(updated.customAlias, updated.originalUrl, ttl);
      }
    } else {
      await cacheService.deleteUrl(updated.shortCode);
      if (updated.customAlias) {
        await cacheService.deleteUrl(updated.customAlias);
      }
    }

    return updated;
  },
};