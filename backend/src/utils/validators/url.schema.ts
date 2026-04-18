import { z } from 'zod';

export const createUrlSchema = z.object({
  body: z.object({
    originalUrl: z
      .string()
      .min(1, 'URL is required')
      .max(2048, 'URL too long')
      .refine(
        (url) => {
          try {
            const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
            return ['http:', 'https:'].includes(parsed.protocol);
          } catch {
            return false;
          }
        },
        { message: 'Invalid URL format' }
      ),
    customAlias: z
      .string()
      .min(3, 'Alias must be at least 3 characters')
      .max(50, 'Alias must be at most 50 characters')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Alias can only contain letters, numbers, hyphens and underscores'
      )
      .optional(),
    title: z.string().max(255, 'Title too long').optional(),
    expiresAt: z
      .string()
      .refine(
        (date) => {
          const parsed = new Date(date);
          return !isNaN(parsed.getTime()) && parsed > new Date();
        },
        { message: 'Expiration date must be a valid future date' }
      )
      .optional(),
  }),
});

export const updateUrlSchema = z.object({
  body: z.object({
    originalUrl: z
      .string()
      .min(1)
      .max(2048)
      .refine(
        (url) => {
          try {
            const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
            return ['http:', 'https:'].includes(parsed.protocol);
          } catch {
            return false;
          }
        },
        { message: 'Invalid URL format' }
      )
      .optional(),
    title: z.string().max(255).optional(),
    expiresAt: z
      .string()
      .refine(
        (date) => {
          const parsed = new Date(date);
          return !isNaN(parsed.getTime()) && parsed > new Date();
        },
        { message: 'Expiration must be a valid future date' }
      )
      .optional()
      .nullable(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid URL ID'),
  }),
});