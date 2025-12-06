const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError, ConflictError, ForbiddenError, ValidationError } = require('../../../core/errors');

/**
 * Authentication Service
 * Handles authentication business logic
 */
class AuthService {
  constructor(database, config) {
    this.db = database;
    this.config = config;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<User>}
   */
  async register(userData) {
    const { name, email, password, role = 'freelancer' } = userData;

    // Validate password strength
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      throw new ValidationError('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new ValidationError('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new ValidationError('Password must contain at least one number');
    }

    // Check if user exists
    const existingUser = await this.db.queryOne(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user (auto-verify in test environment)
    const emailVerified = process.env.NODE_ENV === 'test' ? true : false;
    const result = await this.db.queryOne(`
      INSERT INTO users (name, email, password, role, email_verified, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, name, email, role, email_verified, created_at
    `, [name, email, passwordHash, role, emailVerified]);

    return new User(result);
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user: User, token: string}>}
   */
  async login(email, password) {
    // Get user by email
    const userData = await this.db.queryOne(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (!userData) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, userData.password);
    if (!validPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if email is verified
    if (!userData.email_verified) {
      throw new ForbiddenError('Please verify your email before logging in');
    }

    // Update last login
    await this.db.execute(
      `UPDATE users 
       SET last_login_at = NOW(), 
           last_activity_at = NOW(),
           login_count = COALESCE(login_count, 0) + 1
       WHERE id = $1`,
      [userData.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: userData.id, email: userData.email, role: userData.role },
      this.jwtSecret,
      { expiresIn: '7d' }
    );

    const user = new User(userData);
    return { user, token };
  }

  /**
   * Generate JWT token for user
   * @param {User} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Decoded token payload
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<User>}
   */
  async getUserById(userId) {
    const userData = await this.db.queryOne(
      'SELECT id, name, email, role, email_verified, created_at, last_login_at, profile_picture FROM users WHERE id = $1',
      [userId]
    );

    if (!userData) {
      const { NotFoundError } = require('../../../core/errors');
      throw new NotFoundError('User not found');
    }

    return new User(userData);
  }

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Validate new password strength
    if (newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(newPassword)) {
      throw new ValidationError('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(newPassword)) {
      throw new ValidationError('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(newPassword)) {
      throw new ValidationError('Password must contain at least one number');
    }

    // Get user with password
    const userData = await this.db.queryOne(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (!userData) {
      throw new UnauthorizedError('User not found');
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, userData.password);
    if (!validPassword) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.db.execute(
      'UPDATE users SET password = $1 WHERE id = $2',
      [passwordHash, userId]
    );
  }

  /**
   * Refresh JWT token
   * @param {string} token - Current JWT token
   * @returns {Promise<string>} New JWT token
   */
  async refreshToken(token) {
    const decoded = await this.verifyToken(token);
    
    // Generate new token
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      this.jwtSecret,
      { expiresIn: '7d' }
    );

    return newToken;
  }
}

module.exports = AuthService;
