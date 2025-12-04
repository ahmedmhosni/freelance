/**
 * Projects Module
 * 
 * This module handles all project-related functionality including
 * project creation, updates, and management.
 */

const ProjectRepository = require('./repositories/ProjectRepository');
const ProjectService = require('./services/ProjectService');
const ProjectController = require('./controllers/ProjectController');

/**
 * Register projects module with DI container
 * @param {Container} container - DI container instance
 */
function registerProjectsModule(container) {
  // Register repository as singleton
  container.registerSingleton('projectRepository', (c) => {
    const database = c.resolve('database');
    return new ProjectRepository(database);
  });

  // Register service as transient (with optional client repository for validation)
  container.registerTransient('projectService', (c) => {
    const projectRepository = c.resolve('projectRepository');
    // Try to resolve client repository if available
    const clientRepository = container.has('clientRepository') 
      ? c.resolve('clientRepository') 
      : null;
    return new ProjectService(projectRepository, clientRepository);
  });

  // Register controller as singleton
  container.registerSingleton('projectController', (c) => {
    const service = c.resolve('projectService');
    return new ProjectController(service);
  });
}

module.exports = {
  registerProjectsModule,
  ProjectRepository,
  ProjectService,
  ProjectController
};
