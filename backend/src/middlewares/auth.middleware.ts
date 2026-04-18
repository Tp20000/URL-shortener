import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest, TokenPayload } from '../types';
import { AppError } from './errorHandler.middleware';

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authorization token missing', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload: TokenPayload = authService.verifyToken(token);

    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (roles: ('USER' | 'ADMIN')[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Forbidden: insufficient permissions', 403);
    }

    next();
  };
};