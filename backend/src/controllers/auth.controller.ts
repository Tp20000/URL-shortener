import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest, ApiResponse, RegisterDto, LoginDto } from '../types';
import { AppError } from '../middlewares/errorHandler.middleware';

export const authController = {
  async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: RegisterDto = req.body;
      const { user, token } = await authService.register(data);

      const response: ApiResponse = {
        success: true,
        message: 'User registered successfully',
        data: { user, token },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LoginDto = req.body;
      const { user, token } = await authService.login(data);

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: { user, token },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const user = await authService.getUserById(req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'User profile retrieved',
        data: { user },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};