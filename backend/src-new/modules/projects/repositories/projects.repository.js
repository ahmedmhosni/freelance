/**
 * Projects Repository
 */

const db = require('../../../shared/database');

class ProjectsRepository {
  async findByUserId(userId, filters = {}) {
    let query = `
      SELECT p.*, c.name as client_name 
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.user_id = $1
    `;
    
    const params = [userId];
    let paramIndex = 2;

    if (filters.clientId) {
      query += ` AND p.client_id = $${paramIndex}`;
      params.push(filters.clientId);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND p.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  }

  async findById(projectId) {
    const query = `
      SELECT p.*, c.name as client_name 
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = $1
    `;
    const result = await db.query(query, [projectId]);
    return result.rows[0];
  }

  async create(projectData) {
    const query = `
      INSERT INTO projects (
        user_id, client_id, name, description, 
        status, start_date, end_date, budget, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;
    
    const values = [
      projectData.user_id,
      projectData.client_id,
      projectData.name,
      projectData.description,
      projectData.status,
      projectData.start_date,
      projectData.end_date,
      projectData.budget
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async update(projectId, projectData) {
    const query = `
      UPDATE projects 
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        client_id = COALESCE($3, client_id),
        status = COALESCE($4, status),
        start_date = COALESCE($5, start_date),
        end_date = COALESCE($6, end_date),
        budget = COALESCE($7, budget),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    
    const values = [
      projectData.name,
      projectData.description,
      projectData.client_id,
      projectData.status,
      projectData.start_date,
      projectData.end_date,
      projectData.budget,
      projectId
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async updateStatus(projectId, status) {
    const query = `
      UPDATE projects 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [status, projectId]);
    return result.rows[0];
  }

  async delete(projectId) {
    const query = 'DELETE FROM projects WHERE id = $1';
    await db.query(query, [projectId]);
    return true;
  }
}

module.exports = new ProjectsRepository();
