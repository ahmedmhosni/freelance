/**
 * Clients Repository
 */

const db = require('../../../shared/database');

class ClientsRepository {
  async findByUserId(userId) {
    const query = `
      SELECT * FROM clients 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  async findById(clientId) {
    const query = 'SELECT * FROM clients WHERE id = $1';
    const result = await db.query(query, [clientId]);
    return result.rows[0];
  }

  async create(clientData) {
    const query = `
      INSERT INTO clients (
        user_id, name, email, phone, company, 
        address, notes, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    
    const values = [
      clientData.user_id,
      clientData.name,
      clientData.email,
      clientData.phone,
      clientData.company,
      clientData.address,
      clientData.notes
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async update(clientId, clientData) {
    const query = `
      UPDATE clients 
      SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        company = COALESCE($4, company),
        address = COALESCE($5, address),
        notes = COALESCE($6, notes),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [
      clientData.name,
      clientData.email,
      clientData.phone,
      clientData.company,
      clientData.address,
      clientData.notes,
      clientId
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async delete(clientId) {
    const query = 'DELETE FROM clients WHERE id = $1';
    await db.query(query, [clientId]);
    return true;
  }
}

module.exports = new ClientsRepository();
