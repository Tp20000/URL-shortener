import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types';

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = authService.verifyToken(token);

      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }
  } catch {
    // Token invalid — treat as anonymous, don't block
  }

  next();
};