/**
 * Projects Controller
 */

const projectsService = require('../services/projects.service');

class ProjectsController {
  async getAll(req, res, next) {
    try {
      const { clientId, status } = req.query;
      const projects = await projectsService.getAll(req.user.id, { clientId, status });
      res.json(projects);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const project = await projectsService.getById(req.params.id, req.user.id);
      res.json(project);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const project = await projectsService.create(req.body, req.user.id);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const project = await projectsService.update(req.params.id, req.body, req.user.id);
      res.json(project);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await projectsService.delete(req.params.id, req.user.id);
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const project = await projectsService.updateStatus(
        req.params.id, 
        req.body.status, 
        req.user.id
      );
      res.json(project);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProjectsController();
