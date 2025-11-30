/**
 * API Health Check Tests
 */

const request = require('supertest');
const { createApp } = require('../src/app');

describe('API Health Check', () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
  });

  describe('GET /api/health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.version).toBe('1.0.0');
    });
  });

  describe('GET /api', () => {
    it('should return API info', async () => {
      const response = await request(app)
        .get('/api')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Face Swap Studio API');
      expect(response.body.data.endpoints).toBeDefined();
    });
  });

  describe('GET /api/nonexistent', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
