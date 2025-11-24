// Database abstraction layer - works with both SQLite and Azure SQL
const bcrypt = require('bcryptjs');

class DatabaseQueries {
  constructor(db, isSQLite = true) {
    this.db = db;
    this.isSQLite = isSQLite;
  }

  // Helper to run queries based on database type
  async query(sqliteQuery, azureSqlQuery, params = []) {
    if (this.isSQLite) {
      const sqlite = require('./database');
      if (sqliteQuery.trim().toUpperCase().startsWith('SELECT')) {
        return await sqlite.getAll(sqliteQuery, params);
      } else if (sqliteQuery.trim().toUpperCase().startsWith('INSERT')) {
        const result = await sqlite.runQuery(sqliteQuery, params);
        return { id: result.id, changes: result.changes };
      } else {
        const result = await sqlite.runQuery(sqliteQuery, params);
        return { changes: result.changes };
      }
    } else {
      const pool = await this.db;
      const request = pool.request();
      params.forEach((param, index) => {
        request.input(`param${index + 1}`, param);
      });
      const result = await request.query(azureSqlQuery);
      return result.recordset || result;
    }
  }

  // AUTH QUERIES
  async findUserByEmail(email) {
    const sqliteQuery = 'SELECT * FROM users WHERE email = ?';
    const azureQuery = 'SELECT * FROM users WHERE email = @param1';
    const result = await this.query(sqliteQuery, azureQuery, [email]);
    return Array.isArray(result) ? result[0] : result[0];
  }

  async createUser(name, email, passwordHash, role = 'freelancer') {
    const sqliteQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    const azureQuery = 'INSERT INTO users (name, email, password, role) OUTPUT INSERTED.id VALUES (@param1, @param2, @param3, @param4)';
    return await this.query(sqliteQuery, azureQuery, [name, email, passwordHash, role]);
  }

  async findUserById(id) {
    const sqliteQuery = 'SELECT id, name, email, role FROM users WHERE id = ?';
    const azureQuery = 'SELECT id, name, email, role FROM users WHERE id = @param1';
    const result = await this.query(sqliteQuery, azureQuery, [id]);
    return Array.isArray(result) ? result[0] : result[0];
  }

  // QUOTES QUERIES
  async getDailyQuote() {
    const sqliteQuery = 'SELECT * FROM quotes WHERE is_active = 1 ORDER BY RANDOM() LIMIT 1';
    const azureQuery = 'SELECT TOP 1 * FROM quotes WHERE is_active = 1 ORDER BY NEWID()';
    const result = await this.query(sqliteQuery, azureQuery, []);
    return Array.isArray(result) ? result[0] : result[0];
  }

  async getAllQuotes(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sqliteQuery = 'SELECT * FROM quotes ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const azureQuery = `SELECT * FROM quotes ORDER BY created_at DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
    return await this.query(sqliteQuery, azureQuery, [limit, offset]);
  }

  async getQuoteById(id) {
    const sqliteQuery = 'SELECT * FROM quotes WHERE id = ?';
    const azureQuery = 'SELECT * FROM quotes WHERE id = @param1';
    const result = await this.query(sqliteQuery, azureQuery, [id]);
    return Array.isArray(result) ? result[0] : result[0];
  }

  async createQuote(text, author, isActive = 1) {
    const sqliteQuery = 'INSERT INTO quotes (text, author, is_active) VALUES (?, ?, ?)';
    const azureQuery = 'INSERT INTO quotes (text, author, is_active) OUTPUT INSERTED.id VALUES (@param1, @param2, @param3)';
    return await this.query(sqliteQuery, azureQuery, [text, author, isActive]);
  }

  async updateQuote(id, text, author, isActive) {
    const sqliteQuery = 'UPDATE quotes SET text = ?, author = ?, is_active = ? WHERE id = ?';
    const azureQuery = 'UPDATE quotes SET text = @param1, author = @param2, is_active = @param3 WHERE id = @param4';
    return await this.query(sqliteQuery, azureQuery, [text, author, isActive, id]);
  }

  async deleteQuote(id) {
    const sqliteQuery = 'DELETE FROM quotes WHERE id = ?';
    const azureQuery = 'DELETE FROM quotes WHERE id = @param1';
    return await this.query(sqliteQuery, azureQuery, [id]);
  }

  // DASHBOARD QUERIES
  async getDashboardStats(userId) {
    const sqliteQuery = `
      SELECT 
        (SELECT COUNT(*) FROM clients WHERE user_id = ?) as clients,
        (SELECT COUNT(*) FROM projects WHERE user_id = ?) as projects,
        (SELECT COUNT(*) FROM tasks WHERE user_id = ?) as tasks,
        (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE user_id = ?) as totalRevenue,
        (SELECT COUNT(*) FROM projects WHERE user_id = ? AND status = 'active') as activeProjects,
        (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND status != 'done') as activeTasks,
        (SELECT COUNT(*) FROM invoices WHERE user_id = ? AND status = 'pending') as pendingInvoices
    `;
    const azureQuery = `
      SELECT 
        (SELECT COUNT(*) FROM clients WHERE user_id = @param1) as clients,
        (SELECT COUNT(*) FROM projects WHERE user_id = @param1) as projects,
        (SELECT COUNT(*) FROM tasks WHERE user_id = @param1) as tasks,
        (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE user_id = @param1) as totalRevenue,
        (SELECT COUNT(*) FROM projects WHERE user_id = @param1 AND status = 'active') as activeProjects,
        (SELECT COUNT(*) FROM tasks WHERE user_id = @param1 AND status != 'done') as activeTasks,
        (SELECT COUNT(*) FROM invoices WHERE user_id = @param1 AND status = 'pending') as pendingInvoices
    `;
    const result = await this.query(sqliteQuery, azureQuery, [userId, userId, userId, userId, userId, userId, userId]);
    return Array.isArray(result) ? result[0] : result[0];
  }

  async getRecentTasks(userId, limit = 5) {
    const sqliteQuery = `
      SELECT t.*, p.name as project_name 
      FROM tasks t 
      LEFT JOIN projects p ON t.project_id = p.id 
      WHERE t.user_id = ? AND t.status != 'done'
      ORDER BY t.due_date ASC 
      LIMIT ?
    `;
    const azureQuery = `
      SELECT TOP ${limit} t.*, p.name as project_name 
      FROM tasks t 
      LEFT JOIN projects p ON t.project_id = p.id 
      WHERE t.user_id = @param1 AND t.status != 'done'
      ORDER BY t.due_date ASC
    `;
    return await this.query(sqliteQuery, azureQuery, [userId, limit]);
  }
}

// Export singleton instance
let instance = null;

function getQueries() {
  if (!instance) {
    const useAzureSQL = process.env.NODE_ENV === 'production' || process.env.USE_AZURE_SQL === 'true';
    const db = require('./index');
    instance = new DatabaseQueries(db, !useAzureSQL);
  }
  return instance;
}

module.exports = getQueries();
module.exports.DatabaseQueries = DatabaseQueries;
