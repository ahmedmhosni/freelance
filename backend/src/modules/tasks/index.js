/**
 * Tasks Module
 * 
 * This module handles all task-related functionality including
 * task creation, updates, status management, and priority handling.
 */

const TaskRepository = require('./repositories/TaskRepository');
const TaskService = require('./services/TaskService');
const TaskController = require('./controllers/TaskController');

/**
 * Register tasks module with DI container
 * @param {Container} container - DI container instance
 */
function registerTasksModule(container) {
  // Register repository as singleton
  container.registerSingleton('taskRepository', (c) => {
    const database = c.resolve('database');
    return new TaskRepository(database);
  });

  // Register service as transient (with optional project repository for validation)
  container.registerTransient('taskService', (c) => {
    const taskRepository = c.resolve('taskRepository');
    // Try to resolve project repository if available
    const projectRepository = container.has('projectRepository') 
      ? c.resolve('projectRepository') 
      : null;
    return new TaskService(taskRepository, projectRepository);
  });

  // Register controller as singleton
  container.registerSingleton('taskController', (c) => {
    const service = c.resolve('taskService');
    return new TaskController(service);
  });
}

module.exports = {
  registerTasksModule,
  TaskRepository,
  TaskService,
  TaskController
};
