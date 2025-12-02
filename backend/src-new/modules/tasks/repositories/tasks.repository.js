/**
 * Tasks Repository
 */

const db = require('../../../shared/database');

class TasksRepository {
  async findByUserId(userId, filters = {}) {
    let query = `
      SELECT t.*, p.name as project_name 
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = $1
    `;
    
    const params = [userId];
    let paramIndex = 2;

    if (filters.projectId) {
      query += ` AND t.project_id = $${paramIndex}`;
      params.push(filters.projectId);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.priority) {
      query += ` AND t.priority = $${paramIndex}`;
      params.push(filters.priority);
      paramIndex++;
    }

    query += ' ORDER BY t.due_date ASC, t.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  }

  async findById(taskId) {
    const query = `
      SELECT t.*, p.name as project_name 
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = $1
    `;
    const result = await db.query(query, [taskId]);
    return result.rows[0];
  }

  async create(taskData) {
    const query = `
      INSERT INTO tasks (
        user_id, project_id, title, description, 
        status, priority, due_date, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    
    const values = [
      taskData.user_id,
      taskData.project_id,
      taskData.title,
      taskData.description,
      taskData.status,
      taskData.priority,
      taskData.due_date
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async update(taskId, taskData) {
    const query = `
      UPDATE tasks 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        project_id = COALESCE($3, project_id),
        status = COALESCE($4, status),
        priority = COALESCE($5, priority),
        due_date = COALESCE($6, due_date),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [
      taskData.title,
      taskData.description,
      taskData.project_id,
      taskData.status,
      taskData.priority,
      taskData.due_date,
      taskId
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async updateStatus(taskId, status) {
    const query = `
      UPDATE tasks 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [status, taskId]);
    return result.rows[0];
  }

  async delete(taskId) {
    const query = 'DELETE FROM tasks WHERE id = $1';
    await db.query(query, [taskId]);
    return true;
  }
}

module.exports = new TasksRepository();
