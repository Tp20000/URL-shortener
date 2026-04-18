import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';
import { ApiResponse } from '../types';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = (error as ZodError).issues.map((e: ZodIssue) => ({
          field: e.path.slice(1).join('.'), // strip 'body' prefix from path
          message: e.message,
        }));

        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          error: JSON.stringify(messages),
        };

        res.status(400).json(response);
        return;
      }
      next(error);
    }
  };
};