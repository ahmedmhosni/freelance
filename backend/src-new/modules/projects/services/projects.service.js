/**
 * Projects Service
 */

const projectsRepository = require('../repositories/projects.repository');

class ProjectsService {
  async getAll(userId, filters = {}) {
    return await projectsRepository.findByUserId(userId, filters);
  }

  async getById(projectId, userId) {
    const project = await projectsRepository.findById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    return project;
  }

  async create(projectData, userId) {
    return await projectsRepository.create({
      ...projectData,
      user_id: userId,
      status: projectData.status || 'planning'
    });
  }

  async update(projectId, projectData, userId) {
    await this.getById(projectId, userId);
    return await projectsRepository.update(projectId, projectData);
  }

  async delete(projectId, userId) {
    await this.getById(projectId, userId);
    return await projectsRepository.delete(projectId);
  }

  async updateStatus(projectId, status, userId) {
    await this.getById(projectId, userId);
    return await projectsRepository.updateStatus(projectId, status);
  }
}

module.exports = new ProjectsService();
