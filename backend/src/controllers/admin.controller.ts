import { Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { AuthRequest, ApiResponse } from '../types';

export const adminController = {
  /**
   * GET /api/admin/stats — System-wide statistics
   */
  async getSystemStats(
    _req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await adminService.getSystemStats();

      const response: ApiResponse = {
        success: true,
        message: 'System stats retrieved',
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/users — List all users
   */
  async listUsers(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const search = req.query['search'] as string | undefined;

      const { users, meta } = await adminService.listUsers(page, limit, search);

      const response: ApiResponse = {
        success: true,
        message: 'Users retrieved',
        data: users,
        meta,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/users/:id — Get single user details
   */
  async getUserDetails(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.params['id'] as string;
      const user = await adminService.getUserDetails(userId);

      const response: ApiResponse = {
        success: true,
        message: 'User details retrieved',
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/admin/users/:id/toggle — Ban/Unban user
   */
  async toggleUserStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.params['id'] as string;
      const user = await adminService.toggleUserStatus(userId, req.user!.id);

      const status = user.isActive ? 'activated' : 'banned';

      const response: ApiResponse = {
        success: true,
        message: `User ${status} successfully`,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/admin/users/:id/role — Change user role
   */
  async changeUserRole(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.params['id'] as string;
      const { role } = req.body;

      if (!role || !['USER', 'ADMIN'].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Role must be USER or ADMIN',
        });
        return;
      }

      const user = await adminService.changeUserRole(userId, role, req.user!.id);

      const response: ApiResponse = {
        success: true,
        message: `User role changed to ${role}`,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/admin/users/:id — Delete user + all data
   */
  async deleteUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.params['id'] as string;
      const result = await adminService.deleteUser(userId, req.user!.id);

      const response: ApiResponse = {
        success: true,
        message: result.message,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/urls — List all URLs
   */
  async listAllUrls(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const search = req.query['search'] as string | undefined;
      const activeParam = req.query['active'] as string | undefined;

      let isActive: boolean | undefined;
      if (activeParam === 'true') isActive = true;
      if (activeParam === 'false') isActive = false;

      const { urls, meta } = await adminService.listAllUrls(
        page,
        limit,
        search,
        isActive
      );

      const response: ApiResponse = {
        success: true,
        message: 'URLs retrieved',
        data: urls,
        meta,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/admin/urls/:id/toggle — Toggle URL active/inactive
   */
  async toggleUrlStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const urlId = req.params['id'] as string;
      const url = await adminService.toggleUrlStatus(urlId);

      const status = url.isActive ? 'activated' : 'deactivated';

      const response: ApiResponse = {
        success: true,
        message: `URL ${status} successfully`,
        data: url,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/admin/urls/:id — Delete any URL
   */
  async deleteUrl(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const urlId = req.params['id'] as string;
      const result = await adminService.deleteAnyUrl(urlId);

      const response: ApiResponse = {
        success: true,
        message: result.message,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};