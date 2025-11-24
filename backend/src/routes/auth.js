const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const db = require('../db');
const queries = require('../db/queries');
const { authLimiter } = require('../middleware/rateLimiter');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const validators = require('../utils/validators');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const { generateToken, generateTokenExpiry, isTokenExpired } = require('../utils/tokenGenerator');
const emailConfig = require('../config/email.config');

const router = express.Router();

// Register
router.post('/register', 
  authLimiter,
  validators.register,
  asyncHandler(async (req, res) => {
    const { name, email, password, role = 'freelancer' } = req.body;

    // Check if user exists
    const existingUser = await queries.findUserByEmail(email);
    
    if (existingUser) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Generate email verification token
    const verificationToken = generateToken();
    const verificationExpiry = generateTokenExpiry(emailConfig.templates.emailVerificationExpiry);

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12);
    
    const pool = await db;
    const request = pool.request();
    request.input('name', sql.NVarChar, name);
    request.input('email', sql.NVarChar, email);
    request.input('password', sql.NVarChar, passwordHash);
    request.input('role', sql.NVarChar, role);
    request.input('verificationToken', sql.NVarChar, verificationToken);
    request.input('verificationExpiry', sql.DateTime2, verificationExpiry);

    const result = await request.query(`
      INSERT INTO users (name, email, password, role, email_verified, email_verification_token, email_verification_expires, created_at)
      OUTPUT INSERTED.id, INSERTED.name, INSERTED.email
      VALUES (@name, @email, @password, @role, 0, @verificationToken, @verificationExpiry, GETDATE())
    `);

    const user = result.recordset[0];

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user, verificationToken);
      logger.info(`Verification email sent to: ${email}`);
    } catch (emailError) {
      logger.error(`Failed to send verification email to ${email}:`, emailError);
      // Don't fail registration if email fails
    }

    logger.info(`New user registered: ${email}`);

    res.status(201).json({ 
      success: true,
      message: 'Registration successful! Please check your email to verify your account.', 
      userId: user.id 
    });
  })
);

// Login
router.post('/login',
  authLimiter,
  validators.login,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Get user by email
    const user = await queries.findUserByEmail(email);
    
    if (!user) {
      logger.warn(`Failed login attempt for non-existent user: ${email}`);
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      logger.warn(`Failed login attempt for user: ${email}`);
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  })
);

module.exports = router;


// Verify Email
router.get('/verify-email/:token',
  asyncHandler(async (req, res) => {
    const { token } = req.params;

    const pool = await db;
    const request = pool.request();
    request.input('token', sql.NVarChar, token);

    const result = await request.query(`
      SELECT id, name, email, email_verification_expires
      FROM users
      WHERE email_verification_token = @token
    `);

    const user = result.recordset[0];

    if (!user) {
      throw new AppError('Invalid verification token', 400, 'INVALID_TOKEN');
    }

    // Check if token expired
    if (isTokenExpired(user.email_verification_expires)) {
      throw new AppError('Verification token has expired', 400, 'TOKEN_EXPIRED');
    }

    // Update user as verified
    const updateRequest = pool.request();
    updateRequest.input('userId', sql.Int, user.id);
    
    await updateRequest.query(`
      UPDATE users
      SET email_verified = 1,
          email_verification_token = NULL,
          email_verification_expires = NULL
      WHERE id = @userId
    `);

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailError) {
      logger.error(`Failed to send welcome email to ${user.email}:`, emailError);
    }

    logger.info(`Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  })
);

// Resend Verification Email
router.post('/resend-verification',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400, 'EMAIL_REQUIRED');
    }

    const pool = await db;
    const request = pool.request();
    request.input('email', sql.NVarChar, email);

    const result = await request.query(`
      SELECT id, name, email, email_verified
      FROM users
      WHERE email = @email
    `);

    const user = result.recordset[0];

    if (!user) {
      // Don't reveal if email exists
      res.json({
        success: true,
        message: 'If the email exists, a verification link has been sent.'
      });
      return;
    }

    if (user.email_verified) {
      throw new AppError('Email already verified', 400, 'ALREADY_VERIFIED');
    }

    // Generate new token
    const verificationToken = generateToken();
    const verificationExpiry = generateTokenExpiry(emailConfig.templates.emailVerificationExpiry);

    const updateRequest = pool.request();
    updateRequest.input('userId', sql.Int, user.id);
    updateRequest.input('token', sql.NVarChar, verificationToken);
    updateRequest.input('expiry', sql.DateTime2, verificationExpiry);

    await updateRequest.query(`
      UPDATE users
      SET email_verification_token = @token,
          email_verification_expires = @expiry
      WHERE id = @userId
    `);

    // Send verification email
    await emailService.sendVerificationEmail(user, verificationToken);

    logger.info(`Verification email resent to: ${email}`);

    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });
  })
);

// Forgot Password
router.post('/forgot-password',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400, 'EMAIL_REQUIRED');
    }

    const pool = await db;
    const request = pool.request();
    request.input('email', sql.NVarChar, email);

    const result = await request.query(`
      SELECT id, name, email
      FROM users
      WHERE email = @email
    `);

    const user = result.recordset[0];

    if (!user) {
      // Don't reveal if email exists (security best practice)
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
      return;
    }

    // Generate password reset token
    const resetToken = generateToken();
    const resetExpiry = generateTokenExpiry(emailConfig.templates.passwordResetExpiry);

    const updateRequest = pool.request();
    updateRequest.input('userId', sql.Int, user.id);
    updateRequest.input('token', sql.NVarChar, resetToken);
    updateRequest.input('expiry', sql.DateTime2, resetExpiry);

    await updateRequest.query(`
      UPDATE users
      SET password_reset_token = @token,
          password_reset_expires = @expiry
      WHERE id = @userId
    `);

    // Send password reset email
    await emailService.sendPasswordResetEmail(user, resetToken);

    logger.info(`Password reset email sent to: ${email}`);

    res.json({
      success: true,
      message: 'Password reset link sent! Please check your email.'
    });
  })
);

// Reset Password
router.post('/reset-password',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new AppError('Token and password are required', 400, 'MISSING_FIELDS');
    }

    // Validate password strength
    const validators = require('../utils/validators');
    const { body, validationResult } = require('express-validator');
    
    // Manual password validation
    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400, 'WEAK_PASSWORD');
    }

    const pool = await db;
    const request = pool.request();
    request.input('token', sql.NVarChar, token);

    const result = await request.query(`
      SELECT id, name, email, password_reset_expires
      FROM users
      WHERE password_reset_token = @token
    `);

    const user = result.recordset[0];

    if (!user) {
      throw new AppError('Invalid reset token', 400, 'INVALID_TOKEN');
    }

    // Check if token expired
    if (isTokenExpired(user.password_reset_expires)) {
      throw new AppError('Reset token has expired', 400, 'TOKEN_EXPIRED');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    const updateRequest = pool.request();
    updateRequest.input('userId', sql.Int, user.id);
    updateRequest.input('password', sql.NVarChar, passwordHash);

    await updateRequest.query(`
      UPDATE users
      SET password = @password,
          password_reset_token = NULL,
          password_reset_expires = NULL
      WHERE id = @userId
    `);

    logger.info(`Password reset successful for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  })
);
