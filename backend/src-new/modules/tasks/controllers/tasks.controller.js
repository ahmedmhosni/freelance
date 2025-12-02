/**
 * Tasks Controller
 */

const tasksService = require('../services/tasks.service');

class TasksController {
  async getAll(req, res, next) {
    try {
      const { projectId, status, priority } = req.query;
      const tasks = await tasksService.getAll(req.user.id, { projectId, status, priority });
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const task = await tasksService.getById(req.params.id, req.user.id);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const task = await tasksService.create(req.body, req.user.id);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const task = await tasksService.update(req.params.id, req.body, req.user.id);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await tasksService.delete(req.params.id, req.user.id);
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const task = await tasksService.updateStatus(req.params.id, req.body.status, req.user.id);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async markComplete(req, res, next) {
    try {
      const task = await tasksService.markComplete(req.params.id, req.user.id);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TasksController();
