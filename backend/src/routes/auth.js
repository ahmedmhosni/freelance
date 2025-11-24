const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const queries = require('../db/queries');
const { authLimiter } = require('../middleware/rateLimiter');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const validators = require('../utils/validators');
const logger = require('../utils/logger');

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

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await queries.createUser(name, email, passwordHash, role);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({ 
      success: true,
      message: 'User registered successfully', 
      userId: result.id 
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
