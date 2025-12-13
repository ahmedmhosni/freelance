const express = require('express');
const app = express();
const PORT = process.env.PORT || process.env.WEBSITES_PORT || 8080;

// Simple middleware
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).send('Test Server OK');
});

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`✅ Listening on all interfaces (0.0.0.0)`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});