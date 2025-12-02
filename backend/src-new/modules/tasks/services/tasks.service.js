/**
 * Tasks Service
 */

const tasksRepository = require('../repositories/tasks.repository');

class TasksService {
  async getAll(userId, filters = {}) {
    return await tasksRepository.findByUserId(userId, filters);
  }

  async getById(taskId, userId) {
    const task = await tasksRepository.findById(taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    return task;
  }

  async create(taskData, userId) {
    return await tasksRepository.create({
      ...taskData,
      user_id: userId,
      status: taskData.status || 'todo'
    });
  }

  async update(taskId, taskData, userId) {
    await this.getById(taskId, userId);
    return await tasksRepository.update(taskId, taskData);
  }

  async delete(taskId, userId) {
    await this.getById(taskId, userId);
    return await tasksRepository.delete(taskId);
  }

  async updateStatus(taskId, status, userId) {
    await this.getById(taskId, userId);
    return await tasksRepository.updateStatus(taskId, status);
  }

  async markComplete(taskId, userId) {
    await this.getById(taskId, userId);
    return await tasksRepository.updateStatus(taskId, 'completed');
  }
}

module.exports = new TasksService();
