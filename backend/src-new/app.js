/**
 * Express Application Setup
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./shared/middleware/errorHandler');

// Import modules
const authModule = require('./modules/auth');
const clientsModule = require('./modules/clients');
// Import other modules as they are created

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes - Modular approach
app.use('/api/auth', authModule);
app.use('/api/clients', clientsModule);
// Add other modules here

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
