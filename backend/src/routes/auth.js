const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { sql, getPool } = require('../db/azuresql');

const router = express.Router();

// Register
router.post('/register', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role = 'freelancer' } = req.body;

  try {
    const pool = await getPool();
    
    // Check if user exists
    const checkRequest = pool.request();
    checkRequest.input('email', sql.NVarChar, email);
    const checkResult = await checkRequest.query('SELECT id FROM users WHERE email = @email');
    
    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password and insert user
    const passwordHash = await bcrypt.hash(password, 10);
    const insertRequest = pool.request();
    insertRequest.input('name', sql.NVarChar, name);
    insertRequest.input('email', sql.NVarChar, email);
    insertRequest.input('passwordHash', sql.NVarChar, passwordHash);
    insertRequest.input('role', sql.NVarChar, role);
    
    const insertResult = await insertRequest.query(
      'INSERT INTO users (name, email, password_hash, role) OUTPUT INSERTED.id VALUES (@name, @email, @passwordHash, @role)'
    );

    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: insertResult.recordset[0].id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const pool = await getPool();
    
    // Get user by email
    const request = pool.request();
    request.input('email', sql.NVarChar, email);
    const result = await request.query('SELECT * FROM users WHERE email = @email');
    
    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
