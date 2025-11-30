/**
 * Winston Logger Configuration
 * Production-grade logging with multiple transports
 */

const winston = require('winston');
const path = require('path');
const config = require('./index');

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  
  if (stack) {
    log += `\n${stack}`;
  }
  
  if (Object.keys(metadata).length > 0) {
    log += ` ${JSON.stringify(metadata)}`;
  }
  
  return log;
});

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  defaultMeta: { service: 'face-swap-studio' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Add file transports in production
if (config.server.env === 'production') {
  const logsDir = path.join(__dirname, '../../logs');
  
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
  }));
  
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
  }));
}

// Create stream for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
