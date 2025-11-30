/**
 * API Routes Index
 * Central routing configuration
 */

const express = require('express');
const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const uploadRoutes = require('./uploadRoutes');
const swapRoutes = require('./swapRoutes');
const { successResponse } = require('../utils/response');

const router = express.Router();

/**
 * API Health Check
 * GET /api/health
 */
router.get('/health', (req, res) => {
  return successResponse(res, {
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  }, 'API is healthy');
});

/**
 * API Info
 * GET /api
 */
router.get('/', (req, res) => {
  return successResponse(res, {
    name: 'Face Swap Studio API',
    version: '1.0.0',
    description: 'Production-ready face swap studio API',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      upload: '/api/upload',
      swap: '/api/swap',
    },
  }, 'Welcome to Face Swap Studio API');
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/upload', uploadRoutes);
router.use('/swap', swapRoutes);

module.exports = router;
