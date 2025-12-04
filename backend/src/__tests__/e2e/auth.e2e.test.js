const request = require('supertest');
const express = require('express');
const { bootstrap } = require('../../core/bootstrap');

describe('E2E: Authentication Flow', () => {
  let app;
  let container;
  let authToken;
  let testUserId;

  beforeAll(async () => {
    // Bootstrap the application
    const result = await bootstrap();
    app = result.app;
    container = result.container;

    // Clean up test data
    const database = container.resolve('database');
    await database.execute('DELETE FROM users WHERE email LIKE $1', ['%e2etest%']);
  });

  afterAll(async () => {
    // Clean up
    const database = container.resolve('database');
    await database.execute('DELETE FROM users WHERE email LIKE $1', ['%e2etest%']);
    await database.close();
  });

  describe('User Registration', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v2/auth/register')
        .send({
          email: 'e2etest@example.com',
          password: 'SecurePass123!',
          name: 'E2E Test User'
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('e2etest@example.com');
      
      authToken = response.body.token;
      testUserId = response.body.user.id;
    });

    test('should not register user with duplicate email', async () => {
      const response = await request(app)
        .post('/api/v2/auth/register')
        .send({
          email: 'e2etest@example.com',
          password: 'SecurePass123!',
          name: 'Duplicate User'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });

    test('should validate password requirements', async () => {
      const response = await request(app)
        .post('/api/v2/auth/register')
        .send({
          email: 'e2etest2@example.com',
          password: 'weak',
          name: 'Test User'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('User Login', () => {
    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'e2etest@example.com',
          password: 'SecurePass123!'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('e2etest@example.com');
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'e2etest@example.com',
          password: 'WrongPassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Protected Routes', () => {
    test('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/v2/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testUserId);
      expect(response.body).toHaveProperty('email', 'e2etest@example.com');
    });

    test('should reject access without token', async () => {
      await request(app)
        .get('/api/v2/auth/me')
        .expect(401);
    });

    test('should reject access with invalid token', async () => {
      await request(app)
        .get('/api/v2/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });

  describe('Token Refresh', () => {
    test('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/v2/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.token).not.toBe(authToken);
    });
  });

  describe('Logout', () => {
    test('should logout successfully', async () => {
      await request(app)
        .post('/api/v2/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
