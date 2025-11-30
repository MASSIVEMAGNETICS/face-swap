/**
 * Application Configuration
 * Centralized configuration management for the Face Swap Studio API
 */

require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 3001,
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'face-swap-studio-secret-key-change-in-production',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ],
    tempDir: process.env.UPLOAD_TEMP_DIR || 'uploads/temp',
    processedDir: process.env.UPLOAD_PROCESSED_DIR || 'uploads/processed',
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },

  // Processing Configuration
  processing: {
    maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS, 10) || 3,
    jobTimeout: parseInt(process.env.JOB_TIMEOUT, 10) || 300000, // 5 minutes
    thumbnailSize: { width: 200, height: 200 },
    previewSize: { width: 800, height: 800 },
  },
};

// Freeze configuration to prevent modifications
Object.freeze(config);

module.exports = config;
