import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import { globalLimiter } from './middlewares/rateLimiter.middleware';

import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import urlRoutes from './routes/url.routes';
import analyticsRoutes from './routes/analytics.routes';
import qrcodeRoutes from './routes/qrcode.routes';
import adminRoutes from './routes/admin.routes';
import redirectRoutes from './routes/redirect.routes';

import { startScheduler, stopScheduler } from './jobs/scheduler';

const app = express();

// ─── Security ─────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────
const allowedOrigins = [
  env.frontendUrl,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) {
      if (!origin) return callback(null, true);
      if (env.isProd) return callback(null, true);
      if (allowedOrigins.some((o) => origin.startsWith(o as string))) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ──────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  })
);

// ─── Rate Limiting ────────────────────────────────────────
app.use(globalLimiter);

// ─── Routes ───────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: '🔗 URL Shortener API is running',
    version: '1.0.0',
    docs: '/api/health',
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/qr', qrcodeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/', redirectRoutes);

// ─── Error Handling ───────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
const startServer = async () => {
  startScheduler();

  app.listen(env.port, () => {
    logger.info(`🚀 Server running on port ${env.port}`);
    logger.info(`📊 Health: ${env.baseUrl}/api/health`);
    logger.info(`🌍 Environment: ${env.nodeEnv}`);
    logger.info('⏰ Scheduler: ✅ Active');
  });

  const shutdown = async (signal: string) => {
    logger.info(`⚠️ ${signal} — shutting down...`);
    stopScheduler();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();

export default app;