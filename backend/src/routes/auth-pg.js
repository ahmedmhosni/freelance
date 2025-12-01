const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, getOne } = require('../db/postgresql');
const { authLimiter } = require('../middleware/rateLimiter');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const validators = require('../utils/validators');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const {
  generateToken,
  generateTokenExpiry,
  isTokenExpired,
} = require('../utils/tokenGenerator');
const { generateVerificationCode } = require('../utils/codeGenerator');
const emailConfig = require('../config/email.config');

const router = express.Router();

// Register
router.post(
  '/register',
  authLimiter,
  validators.register,
  asyncHandler(async (req, res) => {
    const { name, email, password, role = 'freelancer' } = req.body;

    // Check if user exists
    const existingUser = await getOne('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    if (existingUser) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Generate email verification token AND code
    const verificationToken = generateToken();
    const verificationCode = generateVerificationCode();
    const verificationExpiry = generateTokenExpiry(
      emailConfig.templates.emailVerificationExpiry
    );

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `
      INSERT INTO users (name, email, password, role, email_verified, email_verification_token, 
                        email_verification_code, email_verification_expires, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, name, email
    `,
      [
        name,
        email,
        passwordHash,
        role,
        false,
        verificationToken,
        verificationCode,
        verificationExpiry,
      ]
    );

    const user = result.rows[0];

    // Send verification email
    try {
      await emailService.sendVerificationEmail(
        user,
        verificationToken,
        verificationCode
      );
      logger.info(`Verification email sent to: ${email}`);
    } catch (emailError) {
      logger.error(
        `Failed to send verification email to ${email}:`,
        emailError
      );
    }

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message:
        'Registration successful! Please check your email to verify your account.',
      userId: user.id,
    });
  })
);

// Login
router.post(
  '/login',
  authLimiter,
  validators.login,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Get user by email
    const user = await getOne('SELECT * FROM users WHERE email = $1', [email]);

    if (!user) {
      logger.warn(`Failed login attempt for non-existent user: ${email}`);
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      logger.warn(`Failed login attempt for user: ${email}`);
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check if email is verified
    if (!user.email_verified) {
      logger.warn(`Login attempt with unverified email: ${email}`);
      throw new AppError(
        'Please verify your email before logging in. Check your inbox for the verification code.',
        403,
        'EMAIL_NOT_VERIFIED'
      );
    }

    // Update last login tracking
    const ipAddress = req.ip || req.connection.remoteAddress;
    await query(
      `UPDATE users 
       SET last_login_at = NOW(), 
           last_activity_at = NOW(),
           login_count = COALESCE(login_count, 0) + 1,
           last_login_ip = $1
       WHERE id = $2`,
      [ipAddress, user.id]
    );

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [user.id, 'login', ipAddress, req.headers['user-agent'] || null]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`User logged in: ${email} from IP: ${ipAddress}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  })
);

// Verify Email by Token (Link)
router.get(
  '/verify-email/:token',
  asyncHandler(async (req, res) => {
    const { token } = req.params;

    const user = await getOne(
      'SELECT id, name, email, email_verification_expires FROM users WHERE email_verification_token = $1',
      [token]
    );

    if (!user) {
      throw new AppError('Invalid verification token', 400, 'INVALID_TOKEN');
    }

    if (isTokenExpired(user.email_verification_expires)) {
      throw new AppError(
        'Verification token has expired',
        400,
        'TOKEN_EXPIRED'
      );
    }

    await query(
      `UPDATE users SET email_verified = true, email_verification_token = NULL, 
       email_verification_code = NULL, email_verification_expires = NULL 
       WHERE id = $1`,
      [user.id]
    );

    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailError) {
      logger.error(
        `Failed to send welcome email to ${user.email}:`,
        emailError
      );
    }

    logger.info(`Email verified via link for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  })
);

// Verify Email by Code
router.post(
  '/verify-code',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
      throw new AppError('Email and code are required', 400, 'MISSING_FIELDS');
    }

    if (!/^\d{6}$/.test(code)) {
      throw new AppError(
        'Invalid code format. Code must be 6 digits.',
        400,
        'INVALID_CODE_FORMAT'
      );
    }

    const user = await getOne(
      'SELECT * FROM users WHERE email = $1 AND email_verification_code = $2',
      [email, code]
    );

    if (!user) {
      throw new AppError('Invalid verification code', 400, 'INVALID_CODE');
    }

    if (user.email_verified) {
      return res.json({
        success: true,
        message: 'Email already verified! You can log in.',
      });
    }

    if (isTokenExpired(user.email_verification_expires)) {
      throw new AppError('Verification code has expired', 400, 'CODE_EXPIRED');
    }

    await query(
      `UPDATE users SET email_verified = true, email_verification_token = NULL, 
       email_verification_code = NULL, email_verification_expires = NULL 
       WHERE id = $1`,
      [user.id]
    );

    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailError) {
      logger.error(
        `Failed to send welcome email to ${user.email}:`,
        emailError
      );
    }

    logger.info(`Email verified via code for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  })
);

// Resend Verification Email
router.post(
  '/resend-verification',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400, 'EMAIL_REQUIRED');
    }

    const user = await getOne('SELECT * FROM users WHERE email = $1', [email]);

    if (!user) {
      res.json({
        success: true,
        message: 'If the email exists, a verification link has been sent.',
      });
      return;
    }

    if (user.email_verified) {
      throw new AppError('Email already verified', 400, 'ALREADY_VERIFIED');
    }

    const verificationToken = generateToken();
    const verificationCode = generateVerificationCode();
    const verificationExpiry = generateTokenExpiry(
      emailConfig.templates.emailVerificationExpiry
    );

    await query(
      `UPDATE users SET email_verification_token = $1, email_verification_code = $2, 
       email_verification_expires = $3 WHERE id = $4`,
      [verificationToken, verificationCode, verificationExpiry, user.id]
    );

    await emailService.sendVerificationEmail(
      user,
      verificationToken,
      verificationCode
    );
    logger.info(`Verification email resent to: ${email}`);

    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    });
  })
);

// Forgot Password
router.post(
  '/forgot-password',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400, 'EMAIL_REQUIRED');
    }

    const user = await getOne('SELECT * FROM users WHERE email = $1', [email]);

    if (!user) {
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      });
      return;
    }

    const resetToken = generateToken();
    const resetExpiry = generateTokenExpiry(
      emailConfig.templates.passwordResetExpiry
    );

    await query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [resetToken, resetExpiry, user.id]
    );

    await emailService.sendPasswordResetEmail(user, resetToken);
    logger.info(`Password reset email sent to: ${email}`);

    res.json({
      success: true,
      message: 'Password reset link sent! Please check your email.',
    });
  })
);

// Reset Password
router.post(
  '/reset-password',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new AppError(
        'Token and password are required',
        400,
        'MISSING_FIELDS'
      );
    }

    if (password.length < 8) {
      throw new AppError(
        'Password must be at least 8 characters long',
        400,
        'WEAK_PASSWORD'
      );
    }

    const user = await getOne(
      'SELECT * FROM users WHERE password_reset_token = $1',
      [token]
    );

    if (!user) {
      throw new AppError('Invalid reset token', 400, 'INVALID_TOKEN');
    }

    if (isTokenExpired(user.password_reset_expires)) {
      throw new AppError('Reset token has expired', 400, 'TOKEN_EXPIRED');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await query(
      'UPDATE users SET password = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
      [passwordHash, user.id]
    );

    logger.info(`Password reset successful for user: ${user.email}`);

    res.json({
      success: true,
      message:
        'Password reset successful! You can now log in with your new password.',
    });
  })
);

module.exports = router;
