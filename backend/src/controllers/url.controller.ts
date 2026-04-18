import { Response, NextFunction } from 'express';
import { urlService } from '../services/url.service';
import { AuthRequest, ApiResponse, CreateUrlDto } from '../types';
import { env } from '../config/env';

export const urlController = {
  /**
   * POST /api/urls — Create short URL
   */
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateUrlDto = req.body;
      const userId = req.user?.id;

      const url = await urlService.createUrl(data, userId);

      const shortUrl = url.customAlias
        ? `${env.baseUrl}/${url.customAlias}`
        : `${env.baseUrl}/${url.shortCode}`;

      const response: ApiResponse = {
        success: true,
        message: 'Short URL created successfully',
        data: {
          ...url,
          shortUrl,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/urls — Get user's URLs (paginated)
   */
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { urls, meta } = await urlService.getUserUrls(req.user!.id, page, limit);

      // Add shortUrl to each result
      const urlsWithShortUrl = urls.map((url) => ({
        ...url,
        shortUrl: url.customAlias
          ? `${env.baseUrl}/${url.customAlias}`
          : `${env.baseUrl}/${url.shortCode}`,
      }));

      const response: ApiResponse = {
        success: true,
        message: 'URLs retrieved successfully',
        data: urlsWithShortUrl,
        meta,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/urls/:id — Get single URL details
   */
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string; // ← FIXED

      const url = await urlService.getUrlById(id, req.user!.id);

      const shortUrl = url.customAlias
        ? `${env.baseUrl}/${url.customAlias}`
        : `${env.baseUrl}/${url.shortCode}`;

      const response: ApiResponse = {
        success: true,
        message: 'URL retrieved successfully',
        data: { ...url, shortUrl },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/urls/:id — Update URL
   */
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string; // ← FIXED

      const url = await urlService.updateUrl(id, req.user!.id, req.body);

      const shortUrl = url.customAlias
        ? `${env.baseUrl}/${url.customAlias}`
        : `${env.baseUrl}/${url.shortCode}`;

      const response: ApiResponse = {
        success: true,
        message: 'URL updated successfully',
        data: { ...url, shortUrl },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/urls/:id — Delete URL
   */
  async remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string; // ← FIXED

      const result = await urlService.deleteUrl(id, req.user!.id);

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