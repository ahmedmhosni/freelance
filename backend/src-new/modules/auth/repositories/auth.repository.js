/**
 * Auth Repository
 * Data access layer for authentication
 */

const db = require('../../../shared/database');

class AuthRepository {
  async create(userData) {
    const query = `
      INSERT INTO users (email, password, name, role, verification_token, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    
    const values = [
      userData.email,
      userData.password,
      userData.name,
      userData.role || 'user',
      userData.verificationToken
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async findByVerificationToken(token) {
    const query = 'SELECT * FROM users WHERE verification_token = $1';
    const result = await db.query(query, [token]);
    return result.rows[0];
  }

  async findByResetToken(token) {
    const query = `
      SELECT * FROM users 
      WHERE reset_token = $1 
      AND reset_token_expires > NOW()
    `;
    const result = await db.query(query, [token]);
    return result.rows[0];
  }

  async updateResetToken(userId, token) {
    const query = `
      UPDATE users 
      SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour'
      WHERE id = $2
    `;
    await db.query(query, [token, userId]);
  }

  async clearResetToken(userId) {
    const query = `
      UPDATE users 
      SET reset_token = NULL, reset_token_expires = NULL
      WHERE id = $1
    `;
    await db.query(query, [userId]);
  }

  async updatePassword(userId, hashedPassword) {
    const query = 'UPDATE users SET password = $1 WHERE id = $2';
    await db.query(query, [hashedPassword, userId]);
  }

  async markAsVerified(userId) {
    const query = `
      UPDATE users 
      SET is_verified = true, verification_token = NULL
      WHERE id = $1
    `;
    await db.query(query, [userId]);
  }

  async updateVerificationToken(userId, token) {
    const query = 'UPDATE users SET verification_token = $1 WHERE id = $2';
    await db.query(query, [token, userId]);
  }
}

module.exports = new AuthRepository();
