/**
 * Custom Application Error Classes
 * Provides structured error handling throughout the application
 */

class AppError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
      },
    };
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      error: {
        ...super.toJSON().error,
        details: this.details,
      },
    };
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

class ProcessingError extends AppError {
  constructor(message = 'Processing failed') {
    super(message, 500, 'PROCESSING_ERROR');
  }
}

class FileUploadError extends AppError {
  constructor(message = 'File upload failed') {
    super(message, 400, 'FILE_UPLOAD_ERROR');
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ProcessingError,
  FileUploadError,
};
