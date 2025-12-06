const BaseRepository = require('../../../shared/base/BaseRepository');
const InvoiceItem = require('../models/InvoiceItem');

/**
 * Invoice Item Repository
 * Handles database operations for invoice items
 */
class InvoiceItemRepository extends BaseRepository {
  constructor(database) {
    super(database, 'invoice_items');
  }

  /**
   * Get all items for an invoice
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<InvoiceItem[]>}
   */
  async getByInvoiceId(invoiceId) {
    const query = `
      SELECT 
        ii.*,
        p.name as project_name,
        t.title as task_title
      FROM invoice_items ii
      LEFT JOIN projects p ON ii.project_id = p.id
      LEFT JOIN tasks t ON ii.task_id = t.id
      WHERE ii.invoice_id = $1
      ORDER BY ii.created_at ASC
    `;
    
    const rows = await this.db.queryMany(query, [invoiceId]);
    return rows.map(row => new InvoiceItem(row));
  }

  /**
   * Create a new invoice item
   * @param {Object} data - Invoice item data
   * @returns {Promise<InvoiceItem>}
   */
  async create(data) {
    const query = `
      INSERT INTO invoice_items (
        invoice_id, project_id, task_id, description,
        quantity, unit_price, hours_worked, rate_per_hour, amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    
    const result = await this.db.queryOne(query, [
      data.invoiceId,
      data.projectId || null,
      data.taskId || null,
      data.description,
      data.quantity || 1,
      data.unitPrice || 0,
      data.hoursWorked || null,
      data.ratePerHour || null,
      data.amount
    ]);
    
    return this.getById(result.id);
  }

  /**
   * Get invoice item by ID
   * @param {number} id - Item ID
   * @returns {Promise<InvoiceItem|null>}
   */
  async getById(id) {
    const query = `
      SELECT 
        ii.*,
        p.name as project_name,
        t.title as task_title
      FROM invoice_items ii
      LEFT JOIN projects p ON ii.project_id = p.id
      LEFT JOIN tasks t ON ii.task_id = t.id
      WHERE ii.id = $1
    `;
    
    const row = await this.db.queryOne(query, [id]);
    return row ? new InvoiceItem(row) : null;
  }

  /**
   * Update an invoice item
   * @param {number} id - Item ID
   * @param {Object} data - Updated data
   * @returns {Promise<InvoiceItem>}
   */
  async update(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    if (data.projectId !== undefined) {
      fields.push(`project_id = $${paramIndex++}`);
      values.push(data.projectId || null);
    }
    if (data.taskId !== undefined) {
      fields.push(`task_id = $${paramIndex++}`);
      values.push(data.taskId || null);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.quantity !== undefined) {
      fields.push(`quantity = $${paramIndex++}`);
      values.push(data.quantity);
    }
    if (data.unitPrice !== undefined) {
      fields.push(`unit_price = $${paramIndex++}`);
      values.push(data.unitPrice);
    }
    if (data.hoursWorked !== undefined) {
      fields.push(`hours_worked = $${paramIndex++}`);
      values.push(data.hoursWorked || null);
    }
    if (data.ratePerHour !== undefined) {
      fields.push(`rate_per_hour = $${paramIndex++}`);
      values.push(data.ratePerHour || null);
    }
    if (data.amount !== undefined) {
      fields.push(`amount = $${paramIndex++}`);
      values.push(data.amount);
    }
    
    if (fields.length === 0) {
      return this.getById(id);
    }
    
    values.push(id);
    const query = `UPDATE invoice_items SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
    
    await this.db.execute(query, values);
    return this.getById(id);
  }

  /**
   * Delete an invoice item
   * @param {number} id - Item ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const query = 'DELETE FROM invoice_items WHERE id = $1';
    const result = await this.db.execute(query, [id]);
    return result > 0;
  }

  /**
   * Delete all items for an invoice
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<number>} Number of deleted items
   */
  async deleteByInvoiceId(invoiceId) {
    const query = 'DELETE FROM invoice_items WHERE invoice_id = $1';
    const result = await this.db.execute(query, [invoiceId]);
    return result;
  }

  /**
   * Get total amount for an invoice from its items
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<number>}
   */
  async getTotalAmount(invoiceId) {
    const query = 'SELECT SUM(amount) as total FROM invoice_items WHERE invoice_id = $1';
    const row = await this.db.queryOne(query, [invoiceId]);
    return parseFloat(row?.total || 0);
  }
}

module.exports = InvoiceItemRepository;
