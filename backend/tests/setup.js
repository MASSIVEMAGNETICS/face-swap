/**
 * Jest Test Setup
 */

// Suppress console logs during tests
if (process.env.NODE_ENV !== 'debug') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.PORT = '0'; // Let the OS assign a port
