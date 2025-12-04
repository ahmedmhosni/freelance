/**
 * Time Tracking Module
 * 
 * This module handles all time tracking functionality including
 * timer management, time entry creation, and duration calculations.
 */

const TimeEntryRepository = require('./repositories/TimeEntryRepository');
const TimeEntryService = require('./services/TimeEntryService');
const TimeEntryController = require('./controllers/TimeEntryController');

/**
 * Register time tracking module with DI container
 * @param {Container} container - DI container instance
 */
function registerTimeTrackingModule(container) {
  // Register repository as singleton
  container.registerSingleton('timeEntryRepository', (c) => {
    const database = c.resolve('database');
    return new TimeEntryRepository(database);
  });

  // Register service as transient (with optional task repository for validation)
  container.registerTransient('timeEntryService', (c) => {
    const timeEntryRepository = c.resolve('timeEntryRepository');
    // Try to resolve task repository if available
    const taskRepository = container.has('taskRepository') 
      ? c.resolve('taskRepository') 
      : null;
    return new TimeEntryService(timeEntryRepository, taskRepository);
  });

  // Register controller as singleton
  container.registerSingleton('timeEntryController', (c) => {
    const service = c.resolve('timeEntryService');
    return new TimeEntryController(service);
  });
}

module.exports = {
  registerTimeTrackingModule,
  TimeEntryRepository,
  TimeEntryService,
  TimeEntryController
};
