import { Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { AuthRequest, ApiResponse } from '../types';

export const analyticsController = {
  /**
   * GET /api/analytics/urls/:id — Full analytics for a URL
   */
  async getUrlAnalytics(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const urlId = req.params['id'] as string;
      const days = parseInt(req.query['days'] as string) || 30;

      const analytics = await analyticsService.getUrlAnalytics(
        urlId,
        req.user!.id,
        days
      );

      const response: ApiResponse = {
        success: true,
        message: 'Analytics retrieved successfully',
        data: analytics,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/analytics/dashboard — User dashboard overview
   */
  async getDashboard(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await analyticsService.getUserDashboardStats(req.user!.id);

      const response: ApiResponse = {
        success: true,
        message: 'Dashboard stats retrieved successfully',
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};