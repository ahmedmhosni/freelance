// PostgreSQL Helper - Simplified query interface
const { pool } = require('./postgres');

/**
 * Execute a query with parameters
 * @param {string} text - SQL query with $1, $2, etc placeholders
 * @param {Array} params - Array of parameter values
 * @returns {Promise<Object>} - { rows, rowCount }
 */
async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount,
    };
  } catch (error) {
    console.error('PostgreSQL Query Error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Get a single row
 */
async function getOne(text, params = []) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

/**
 * Get all rows
 */
async function getAll(text, params = []) {
  const result = await query(text, params);
  return result.rows;
}

/**
 * Insert and return the inserted row
 */
async function insert(text, params = []) {
  const result = await query(text + ' RETURNING *', params);
  return result.rows[0];
}

/**
 * Update and return affected rows
 */
async function update(text, params = []) {
  const result = await query(text, params);
  return result.rowCount;
}

/**
 * Delete and return affected rows
 */
async function remove(text, params = []) {
  const result = await query(text, params);
  return result.rowCount;
}

module.exports = {
  query,
  getOne,
  getAll,
  insert,
  update,
  remove,
};
