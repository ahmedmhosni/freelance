/**
 * Invoices Repository
 */

const db = require('../../../shared/database');

class InvoicesRepository {
  async findByUserId(userId, filters = {}) {
    let query = `
      SELECT i.*, c.name as client_name 
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.user_id = $1
    `;
    
    const params = [userId];
    let paramIndex = 2;

    if (filters.clientId) {
      query += ` AND i.client_id = $${paramIndex}`;
      params.push(filters.clientId);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND i.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    query += ' ORDER BY i.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  }

  async findById(invoiceId) {
    const query = `
      SELECT i.*, c.name as client_name, c.email as client_email
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.id = $1
    `;
    const result = await db.query(query, [invoiceId]);
    return result.rows[0];
  }

  async create(invoiceData) {
    const query = `
      INSERT INTO invoices (
        user_id, client_id, invoice_number, issue_date, 
        due_date, status, total, notes, items, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;
    
    const values = [
      invoiceData.user_id,
      invoiceData.client_id,
      invoiceData.invoice_number,
      invoiceData.issue_date,
      invoiceData.due_date,
      invoiceData.status,
      invoiceData.total,
      invoiceData.notes,
      JSON.stringify(invoiceData.items)
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async update(invoiceId, invoiceData) {
    const query = `
      UPDATE invoices 
      SET 
        client_id = COALESCE($1, client_id),
        invoice_number = COALESCE($2, invoice_number),
        issue_date = COALESCE($3, issue_date),
        due_date = COALESCE($4, due_date),
        status = COALESCE($5, status),
        total = COALESCE($6, total),
        notes = COALESCE($7, notes),
        items = COALESCE($8, items),
        updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `;
    
    const values = [
      invoiceData.client_id,
      invoiceData.invoice_number,
      invoiceData.issue_date,
      invoiceData.due_date,
      invoiceData.status,
      invoiceData.total,
      invoiceData.notes,
      invoiceData.items ? JSON.stringify(invoiceData.items) : null,
      invoiceId
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async updateStatus(invoiceId, status) {
    const query = `
      UPDATE invoices 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [status, invoiceId]);
    return result.rows[0];
  }

  async delete(invoiceId) {
    const query = 'DELETE FROM invoices WHERE id = $1';
    await db.query(query, [invoiceId]);
    return true;
  }
}

module.exports = new InvoicesRepository();
