// Database adapter - switches between PostgreSQL, SQLite, and Azure SQL
require('dotenv').config();
const sql = require('mssql');

const usePostgres = process.env.USE_POSTGRES === 'true';
const useAzureSQL = process.env.NODE_ENV === 'production' || process.env.USE_AZURE_SQL === 'true';

if (usePostgres) {
  console.log('🐘 Using PostgreSQL Database');
  module.exports = require('./postgresql');
  module.exports.queries = require('./queries-pg');
} else if (useAzureSQL) {
  console.log('🔵 Using Azure SQL Database');
  module.exports = require('./azuresql');
} else {
  console.log('🟢 Using SQLite Database (Local Development)');
  
  // SQLite wrapper that mimics Azure SQL interface
  const sqlite = require('./database');
  
  // Create a pool-like interface for SQLite
  const sqlitePool = {
    request: () => {
      const inputs = {};
      return {
        input: (name, type, value) => {
          // Store the value, ignore the SQL type
          inputs[name] = value;
          return sqlitePool.request();
        },
        query: async (queryText) => {
          try {
            // Convert Azure SQL query to SQLite
            let sqliteQuery = queryText;
            
            // Replace @param with ? and collect values in order
            const paramNames = [];
            sqliteQuery = sqliteQuery.replace(/@(\w+)/g, (match, paramName) => {
              paramNames.push(paramName);
              return '?';
            });
            
            // Remove OUTPUT INSERTED.id clause (SQLite uses RETURNING)
            sqliteQuery = sqliteQuery.replace(/OUTPUT INSERTED\.(\w+)/gi, '');
            
            // Get values in the order they appear in query
            const values = paramNames.map(name => inputs[name]);
            
            // Execute query
            if (sqliteQuery.trim().toUpperCase().startsWith('SELECT')) {
              const rows = await sqlite.getAll(sqliteQuery, values);
              return { recordset: rows, rowsAffected: [rows.length] };
            } else if (sqliteQuery.trim().toUpperCase().startsWith('INSERT')) {
              const result = await sqlite.runQuery(sqliteQuery, values);
              return { 
                recordset: [{ id: result.id }], 
                rowsAffected: [result.changes] 
              };
            } else {
              const result = await sqlite.runQuery(sqliteQuery, values);
              return { 
                recordset: [], 
                rowsAffected: [result.changes] 
              };
            }
          } catch (error) {
            console.error('SQLite query error:', error);
            throw error;
          }
        }
      };
    }
  };
  
  // Export the pool as a promise (to match Azure SQL interface)
  module.exports = Promise.resolve(sqlitePool);
  
  // Also export sql object for type compatibility
  module.exports.sql = sql;
}
