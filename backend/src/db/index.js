// Database adapter - switches between SQLite (local) and Azure SQL (production)
require('dotenv').config();

const useAzureSQL = process.env.NODE_ENV === 'production' || process.env.USE_AZURE_SQL === 'true';

if (useAzureSQL) {
  console.log('🔵 Using Azure SQL Database');
  module.exports = require('./azuresql');
} else {
  console.log('🟢 Using SQLite Database (Local Development)');
  module.exports = require('./database');
}
