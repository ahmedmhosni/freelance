const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath =
  process.env.DATABASE_URL || path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database with schema
const initDatabase = () => {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error initializing database:', err);
    } else {
      console.log('✓ SQLite Database initialized successfully');
    }
  });
};

// Promisify database methods
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const getAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Azure SQL-compatible interface
async function getPool() {
  return {
    request: () => ({
      input: () => this,
      query: async (queryText) => {
        // Convert Azure SQL query to SQLite
        const sqliteQuery = queryText.replace(/@param(\d+)/g, '?');
        const rows = await getAll(sqliteQuery);
        return { recordset: rows, rowsAffected: [rows.length] };
      },
    }),
  };
}

async function query(queryText, params = []) {
  // Convert Azure SQL query to SQLite
  const sqliteQuery = queryText.replace(/@param(\d+)/g, '?');
  const rows = await getAll(sqliteQuery, params);
  return { recordset: rows, rowsAffected: [rows.length] };
}

async function closePool() {
  return new Promise((resolve) => {
    db.close((err) => {
      if (err) console.error('Error closing database:', err);
      resolve();
    });
  });
}

initDatabase();

module.exports = { db, runQuery, getOne, getAll, getPool, query, closePool };
