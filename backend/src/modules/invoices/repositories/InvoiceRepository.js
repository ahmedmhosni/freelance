const BaseRepository = require('../../../shared/base/BaseRepository');
const Invoice = require('../models/Invoice');

/**
 * Invoice Repository
 * Handles all data access operations for invoices
 */
class InvoiceRepository extends BaseRepository {
  constructor(database) {
    super(database, 'invoices');
  }

  /**
   * Find all invoices for a specific user
   * @param {number} userId - User ID
   * @param {Object} filters - Additional filters (clientId, status)
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array<Invoice>>} Array of Invoice instances
   */
  async findByUserId(userId, filters = {}, options = {}) {
    const { clientId, status } = filters;
    const { limit, offset, orderBy = 'created_at', order = 'DESC' } = options;
    
    let sql = `
      SELECT i.*, 
        c.name as client_name, 
        p.name as project_name,
        (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as item_count
      FROM ${this.tableName} i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.user_id = $1
    `;
    
    const params = [userId];
    let paramIndex = 2;
    
    // Add client filter
    if (clientId) {
      sql += ` AND i.client_id = $${paramIndex}`;
      params.push(clientId);
      paramIndex++;
    }
    
    // Add status filter
    if (status) {
      sql += ` AND i.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    // Add ordering
    sql += ` ORDER BY i.${orderBy} ${order}`;
    
    // Add pagination
    if (limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(limit);
      paramIndex++;
    }
    
    if (offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(offset);
    }
    
    const rows = await this.db.queryMany(sql, params);
    return rows.map(row => new Invoice(row));
  }

  /**
   * Find an invoice by ID and user ID (for authorization)
   * @param {number} id - Invoice ID
   * @param {number} userId - User ID
   * @returns {Promise<Invoice|null>} Invoice instance or null
   */
  async findByIdAndUserId(id, userId) {
    const sql = `
      SELECT i.*, 
        c.name as client_name, 
        p.name as project_name,
        (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as item_count
      FROM ${this.tableName} i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.id = $1 AND i.user_id = $2
    `;
    
    const row = await this.db.queryOne(sql, [id, userId]);
    return row ? new Invoice(row) : null;
  }

  /**
   * Find all invoices for a specific client
   * @param {number} clientId - Client ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<Array<Invoice>>} Array of Invoice instances
   */
  async findByClientId(clientId, userId) {
    const sql = `
      SELECT i.*, 
        c.name as client_name, 
        p.name as project_name,
        (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as item_count
      FROM ${this.tableName} i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.client_id = $1 AND i.user_id = $2
      ORDER BY i.created_at DESC
    `;
    
    const rows = await this.db.queryMany(sql, [clientId, userId]);
    return rows.map(row => new Invoice(row));
  }

  /**
   * Find invoices by status
   * @param {string} status - Invoice status
   * @param {number} userId - User ID
   * @returns {Promise<Array<Invoice>>} Array of Invoice instances
   */
  async findByStatus(status, userId) {
    const sql = `
      SELECT i.*, 
        c.name as client_name, 
        p.name as project_name,
        (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as item_count
      FROM ${this.tableName} i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.status = $1 AND i.user_id = $2
      ORDER BY i.created_at DESC
    `;
    
    const rows = await this.db.queryMany(sql, [status, userId]);
    return rows.map(row => new Invoice(row));
  }

  /**
   * Find overdue invoices (due date in past and not paid/cancelled)
   * @param {number} userId - User ID
   * @returns {Promise<Array<Invoice>>} Array of overdue Invoice instances
   */
  async findOverdue(userId) {
    const sql = `
      SELECT i.*, 
        c.name as client_name, 
        p.name as project_name,
        (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as item_count
      FROM ${this.tableName} i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.user_id = $1 
        AND i.due_date < NOW()
        AND i.status NOT IN ('paid', 'cancelled')
      ORDER BY i.due_date ASC
    `;
    
    const rows = await this.db.queryMany(sql, [userId]);
    return rows.map(row => new Invoice(row));
  }

  /**
   * Find invoice by invoice number
   * @param {string} invoiceNumber - Invoice number
   * @returns {Promise<Invoice|null>} Invoice instance or null
   */
  async findByInvoiceNumber(invoiceNumber) {
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE invoice_number = $1
      LIMIT 1
    `;
    
    const row = await this.db.queryOne(sql, [invoiceNumber]);
    return row ? new Invoice(row) : null;
  }

  /**
   * Create a new invoice
   * @param {Object} data - Invoice data
   * @returns {Promise<Invoice>} Created Invoice instance
   */
  async create(data) {
    const row = await super.create(data);
    return new Invoice(row);
  }

  /**
   * Update an invoice
   * @param {number} id - Invoice ID
   * @param {Object} data - Updated data
   * @returns {Promise<Invoice|null>} Updated Invoice instance or null
   */
  async update(id, data) {
    const row = await super.update(id, data);
    return row ? new Invoice(row) : null;
  }

  /**
   * Count invoices by status for a user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Object with counts by status
   */
  async countByStatus(userId) {
    const sql = `
      SELECT 
        status,
        COUNT(*) as count
      FROM ${this.tableName}
      WHERE user_id = $1
      GROUP BY status
    `;
    
    const rows = await this.db.queryMany(sql, [userId]);
    
    // Convert to object format
    const counts = {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0
    };
    
    rows.forEach(row => {
      counts[row.status] = parseInt(row.count, 10);
    });
    
    return counts;
  }

  /**
   * Calculate total revenue (paid invoices) for a user
   * @param {number} userId - User ID
   * @param {Object} filters - Optional filters (startDate, endDate, clientId)
   * @returns {Promise<number>} Total revenue
   */
  async calculateRevenue(userId, filters = {}) {
    const { startDate, endDate, clientId } = filters;
    
    let sql = `
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM ${this.tableName}
      WHERE user_id = $1 AND status = 'paid'
    `;
    
    const params = [userId];
    let paramIndex = 2;
    
    if (startDate) {
      sql += ` AND paid_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      sql += ` AND paid_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    if (clientId) {
      sql += ` AND client_id = $${paramIndex}`;
      params.push(clientId);
    }
    
    const row = await this.db.queryOne(sql, params);
    return parseFloat(row.revenue) || 0;
  }

  /**
   * Calculate pending amount (sent/overdue invoices) for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>} Total pending amount
   */
  async calculatePendingAmount(userId) {
    const sql = `
      SELECT COALESCE(SUM(total), 0) as pending
      FROM ${this.tableName}
      WHERE user_id = $1 AND status IN ('sent', 'overdue')
    `;
    
    const row = await this.db.queryOne(sql, [userId]);
    return parseFloat(row.pending) || 0;
  }

  /**
   * Search invoices by invoice number or client name
   * @param {string} searchTerm - Search term
   * @param {number} userId - User ID
   * @returns {Promise<Array<Invoice>>} Array of matching Invoice instances
   */
  async search(searchTerm, userId) {
    const sql = `
      SELECT i.*, 
        c.name as client_name, 
        p.name as project_name,
        (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as item_count
      FROM ${this.tableName} i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.user_id = $1 
        AND (
          i.invoice_number ILIKE $2 
          OR c.name ILIKE $2
        )
      ORDER BY i.created_at DESC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const rows = await this.db.queryMany(sql, [userId, searchPattern]);
    return rows.map(row => new Invoice(row));
  }
}

module.exports = InvoiceRepository;
