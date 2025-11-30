/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

const logger = require('../config/logger');
const { AppError } = require('../utils/errors');
const { errorResponse } = require('../utils/response');
const config = require('../config');

/**
 * Not Found Handler
 * Catches requests to undefined routes
 */
const notFoundHandler = (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  return errorResponse(
    res,
    `Route ${req.originalUrl} not found`,
    404,
    'NOT_FOUND'
  );
};

/**
 * Global Error Handler
 * Processes all errors and returns appropriate responses
 */
const errorHandler = (err, req, res, _next) => {
  // Log the error
  if (err.isOperational) {
    logger.warn('Operational error:', {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error('Unexpected error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    const multerErrors = {
      LIMIT_FILE_SIZE: 'File size exceeds the maximum allowed limit',
      LIMIT_FILE_COUNT: 'Too many files uploaded',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
      LIMIT_PART_COUNT: 'Too many parts in multipart form',
      LIMIT_FIELD_KEY: 'Field name too long',
      LIMIT_FIELD_VALUE: 'Field value too long',
      LIMIT_FIELD_COUNT: 'Too many fields',
    };

    return errorResponse(
      res,
      multerErrors[err.code] || 'File upload error',
      400,
      'FILE_UPLOAD_ERROR'
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(
      res,
      'Invalid authentication token',
      401,
      'AUTHENTICATION_ERROR'
    );
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(
      res,
      'Authentication token has expired',
      401,
      'TOKEN_EXPIRED'
    );
  }

  // Handle validation errors (Joi, express-validator)
  if (err.name === 'ValidationError' || err.isJoi) {
    return errorResponse(
      res,
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      err.details || [{ message: err.message }]
    );
  }

  // Handle syntax errors in JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(
      res,
      'Invalid JSON in request body',
      400,
      'INVALID_JSON'
    );
  }

  // Default error response (don't expose internal errors in production)
  const message = config.server.env === 'production'
    ? 'An unexpected error occurred'
    : err.message || 'An unexpected error occurred';

  return errorResponse(
    res,
    message,
    err.status || err.statusCode || 500,
    'INTERNAL_ERROR'
  );
};

/**
 * Async handler wrapper
 * Wraps async route handlers to properly catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncHandler,
};
