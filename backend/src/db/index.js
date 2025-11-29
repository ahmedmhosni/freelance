// Database adapter - Exclusively PostgreSQL
require('dotenv').config();

console.log('🐘 Using PostgreSQL Database');
module.exports = require('./postgresql');
module.exports.queries = require('./queries-pg');
