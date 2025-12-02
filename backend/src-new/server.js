/**
 * Server Entry Point
 */

require('dotenv').config();
const app = require('./app');
const logger = require('./shared/utils/logger');
const db = require('./shared/database');

const PORT = process.env.PORT || 5000;

// Test database connection
db.query('SELECT NOW()')
  .then(() => {
    logger.info('Database connection successful');
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    logger.error('Database connection failed:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
