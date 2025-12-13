require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || process.env.WEBSITES_PORT || 8080;

// Trust proxy for Azure
app.set('trust proxy', true);

// Basic security and middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'https://roastify.online',
    'https://white-sky-0a7e9f003.3.azurestaticapps.net',
    'https://white-sky-0a7e9f003.4.azurestaticapps.net'
  ],
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple logging
app.use(morgan('combined'));

// Health endpoints
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.get('/status', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic API routes (without database for now)
app.get('/api/maintenance/status', (req, res) => {
  res.json({ maintenance: false, message: 'System operational' });
});

app.get('/api/quotes/daily', (req, res) => {
  res.json({ 
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  });
});

app.get('/api/announcements/featured', (req, res) => {
  res.json([]);
});

app.get('/api/changelog/current-version', (req, res) => {
  res.json({ version: '1.0.3', date: new Date().toISOString() });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Simplified server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Listening on all interfaces`);
});