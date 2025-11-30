/**
 * Face Swap Studio API
 * Production-ready Express application
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config');
const logger = require('./config/logger');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { ensureDirectory } = require('./utils/fileUtils');

/**
 * Create Express application
 */
const createApp = async () => {
  const app = express();

  // Ensure upload directories exist
  await ensureDirectory(config.upload.tempDir);
  await ensureDirectory(config.upload.processedDir);

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Disabled for development - enable in production
  }));

  // CORS configuration
  app.use(cors(config.cors));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMax,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_ERROR',
        message: 'Too many requests, please try again later',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // Static files for processed images
  app.use('/uploads', express.static(path.join(__dirname, '..', config.upload.processedDir)));

  // API routes
  app.use('/api', routes);

  // Serve frontend in production
  if (config.server.env === 'production') {
    const frontendPath = path.join(__dirname, '../../frontend/build');
    app.use(express.static(frontendPath));
    
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

/**
 * Start the server
 */
const startServer = async () => {
  try {
    const app = await createApp();

    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info(`🚀 Face Swap Studio API server running on ${config.server.host}:${config.server.port}`);
      logger.info(`Environment: ${config.server.env}`);
      logger.info(`API available at: http://${config.server.host}:${config.server.port}/api`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

module.exports = { createApp, startServer };

// Start server if running directly
if (require.main === module) {
  startServer();
}
