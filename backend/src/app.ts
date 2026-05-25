import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

import { config } from './utils/config';
import { logger } from './utils/logger';
import { chatRoutes } from './routes/chat.routes';
import { adminRoutes } from './routes/admin.routes';
import { metricsRoutes } from './routes/metrics.routes';
import { SmartRouter } from './core/router';
import { KeyManager } from './core/key-manager';
import { ProxyManager } from './core/proxy-manager';
import { HealthChecker } from './core/health-checker';

// Initialize database and cache
const prisma = new PrismaClient();
const redis = new Redis(config.redis.url);

// Initialize core components
const keyManager = new KeyManager(prisma, redis);
const proxyManager = new ProxyManager(redis);
const router = new SmartRouter(keyManager, proxyManager);
const healthChecker = new HealthChecker(keyManager, router);

// Create Express app
const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => {
      logger.info('HTTP Request', { message: message.trim() });
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: config.app.version
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'XAPI - AI API Gateway',
    version: config.app.version,
    description: 'Unified AI API gateway with multi-platform support'
  });
});

// API routes
app.use('/v1', chatRoutes(router));
app.use('/api/admin', adminRoutes(keyManager, proxyManager, healthChecker));
app.use('/api/metrics', metricsRoutes());

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error', { error: error.message, stack: error.stack });
  
  res.status(error.status || 500).json({
    error: {
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      code: 'ROUTE_NOT_FOUND'
    }
  });
});

// Start health checker
healthChecker.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  healthChecker.stop();
  await prisma.$disconnect();
  await redis.quit();
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  healthChecker.stop();
  await prisma.$disconnect();
  await redis.quit();
  
  process.exit(0);
});

export { app, prisma, redis, keyManager, proxyManager, router, healthChecker };
