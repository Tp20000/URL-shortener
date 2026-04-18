import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler.middleware';

export const analyticsService = {
  /**
   * Get full analytics for a single URL
   */
  async getUrlAnalytics(urlId: string, userId: string, days: number = 30) {
    const url = await prisma.url.findUnique({
      where: { id: urlId },
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        customAlias: true,
        title: true,
        clickCount: true,
        userId: true,
        createdAt: true,
      },
    });

    if (!url) {
      throw new AppError('URL not found', 404);
    }

    if (url.userId !== userId) {
      throw new AppError('You do not have access to this URL', 403);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      clicksOverTime,
      browserStats,
      osStats,
      deviceStats,
      refererStats,
      totalClicks,
      uniqueClicks,
    ] = await Promise.all([
      this.getClicksOverTime(urlId, startDate),
      this.getGroupedStats(urlId, 'browser', startDate),
      this.getGroupedStats(urlId, 'os', startDate),
      this.getGroupedStats(urlId, 'device', startDate),
      this.getRefererStats(urlId, startDate),
      this.getTotalClicks(urlId, startDate),
      this.getUniqueClicks(urlId, startDate),
    ]);

    return {
      url: {
        id: url.id,
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        customAlias: url.customAlias,
        title: url.title,
        createdAt: url.createdAt,
      },
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
      summary: {
        totalClicks,
        uniqueVisitors: uniqueClicks,
        allTimeClicks: url.clickCount,
      },
      clicksOverTime,
      browsers: browserStats,
      operatingSystems: osStats,
      devices: deviceStats,
      referrers: refererStats,
    };
  },

  /**
   * Clicks grouped by day
   */
  async getClicksOverTime(urlId: string, startDate: Date) {
    const clicks = await prisma.$queryRaw<
      Array<{ date: string; count: bigint }>
    >`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM clicks
      WHERE url_id = ${urlId}
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return clicks.map((row) => ({
      date: row.date,
      count: Number(row.count),
    }));
  },

  /**
   * Group stats by a specific field
   */
  async getGroupedStats(
    urlId: string,
    field: 'browser' | 'os' | 'device',
    startDate: Date
  ) {
    const results = await prisma.click.groupBy({
      by: [field],
      where: {
        urlId,
        createdAt: { gte: startDate },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const total = results.reduce((sum, r) => sum + r._count.id, 0);

    return results.map((row) => ({
      name: row[field] || 'unknown',
      count: row._count.id,
      percentage:
        total > 0
          ? Math.round((row._count.id / total) * 100 * 10) / 10
          : 0,
    }));
  },

  /**
   * Top referrers — FIXED: proper Prisma filter
   */
  async getRefererStats(urlId: string, startDate: Date) {
    const results = await prisma.click.groupBy({
      by: ['referer'],
      where: {
        urlId,
        createdAt: { gte: startDate },
        referer: { not: '' },
        NOT: { referer: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    return results.map((row) => {
      let domain = 'Direct';
      if (row.referer) {
        try {
          domain = new URL(row.referer).hostname;
        } catch {
          domain = row.referer;
        }
      }
      return {
        referer: domain,
        count: row._count.id,
      };
    });
  },

  /**
   * Total clicks in period
   */
  async getTotalClicks(urlId: string, startDate: Date): Promise<number> {
    return prisma.click.count({
      where: {
        urlId,
        createdAt: { gte: startDate },
      },
    });
  },

  /**
   * Unique visitors by IP
   */
  async getUniqueClicks(urlId: string, startDate: Date): Promise<number> {
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT ip_address) as count
      FROM clicks
      WHERE url_id = ${urlId}
        AND created_at >= ${startDate}
        AND ip_address IS NOT NULL
    `;

    return Number(result[0]?.count || 0);
  },

  /**
   * Dashboard overview stats for a user
   */
  async getUserDashboardStats(userId: string) {
    const now = new Date();
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUrls,
      activeUrls,
      totalClicks,
      clicksLast30Days,
      clicksLast7Days,
      clicksToday,
      recentClicks,
      topUrls,
    ] = await Promise.all([
      prisma.url.count({ where: { userId } }),

      prisma.url.count({
        where: {
          userId,
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      }),

      prisma.click.count({
        where: { url: { userId } },
      }),

      prisma.click.count({
        where: {
          url: { userId },
          createdAt: { gte: last30Days },
        },
      }),

      prisma.click.count({
        where: {
          url: { userId },
          createdAt: { gte: last7Days },
        },
      }),

      prisma.click.count({
        where: {
          url: { userId },
          createdAt: { gte: today },
        },
      }),

      prisma.click.findMany({
        where: { url: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          ipAddress: true,
          device: true,
          browser: true,
          os: true,
          referer: true,
          createdAt: true,
          url: {
            select: {
              shortCode: true,
              originalUrl: true,
              title: true,
            },
          },
        },
      }),

      prisma.url.findMany({
        where: { userId },
        orderBy: { clickCount: 'desc' },
        take: 5,
        select: {
          id: true,
          shortCode: true,
          originalUrl: true,
          customAlias: true,
          title: true,
          clickCount: true,
        },
      }),
    ]);

    return {
      overview: {
        totalUrls,
        activeUrls,
        totalClicks,
        clicksLast30Days,
        clicksLast7Days,
        clicksToday,
      },
      recentClicks,
      topUrls,
    };
  },
};