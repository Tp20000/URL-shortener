import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import { globalLimiter } from './middlewares/rateLimiter.middleware';

import healthRoutes from './routes/health.routes';

const app = express();

// ─── Security ────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ─────────────────────────────────────────────
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// ─── Rate Limiting ───────────────────────────────────────
app.use(globalLimiter);

// ─── Routes ──────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: '🔗 URL Shortener API is running',
    version: '1.0.0',
    docs: '/api/health',
  });
});

app.use('/api/health', healthRoutes);

// ─── Future routes will be added here ────────────────────
// app.use('/api/auth', authRoutes);
// app.use('/api/urls', urlRoutes);
// app.use('/api/analytics', analyticsRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/', redirectRoutes);  // catch-all for short codes

// ─── Error Handling ──────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────
const startServer = async () => {
  try {
    app.listen(env.port, () => {
      logger.info(`🚀 Server running on port ${env.port}`);
      logger.info(`📊 Health check: ${env.baseUrl}/api/health`);
      logger.info(`🌍 Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;