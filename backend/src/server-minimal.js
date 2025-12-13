require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || process.env.WEBSITES_PORT || 8080;

// Trust proxy for Azure
app.set('trust proxy', true);

// Basic middleware
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Roastify API - Minimal Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Minimal server running successfully'
  });
});

app.get('/status', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Azure health check
app.get('/robots933456.txt', (req, res) => {
  res.status(200).send('User-agent: *\nDisallow:');
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Timestamp: ${new Date().toISOString()}`);
});

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down');
  process.exit(0);
});