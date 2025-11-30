/**
 * Authentication Middleware
 * JWT-based authentication for protected routes
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Extract JWT token from request
 * @param {Object} req - Express request object
 * @returns {string|null} JWT token or null
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  // Also check query parameter for WebSocket connections
  if (req.query && req.query.token) {
    return req.query.token;
  }
  
  return null;
};

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new AuthenticationError('No authentication token provided');
    }
    
    const decoded = jwt.verify(token, config.security.jwtSecret);
    
    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
    };
    
    logger.debug('User authenticated', { userId: decoded.id });
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid authentication token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Authentication token has expired'));
    } else {
      next(new AuthenticationError('Authentication failed'));
    }
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = jwt.verify(token, config.security.jwtSecret);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'user',
      };
    }
    
    next();
  } catch {
    // Token is invalid but optional, continue without user
    next();
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role(s)
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AuthorizationError('Insufficient permissions'));
    }
    
    next();
  };
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
    },
    config.security.jwtSecret,
    { expiresIn: config.security.jwtExpiration }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.security.jwtSecret);
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  generateToken,
  verifyToken,
  extractToken,
};
