/**
 * Jest Configuration
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/logger.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 15,
      lines: 30,
      statements: 30,
    },
  },
  verbose: true,
  testTimeout: 30000,
  setupFilesAfterEnv: ['./tests/setup.js'],
};
