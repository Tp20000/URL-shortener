import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').max(255),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').max(255),
    password: z.string().min(1, 'Password is required').max(100),
  }),
});