/**
 * Dependency Injection Container
 * Manages service registration and resolution with support for singleton and transient lifecycles
 */
class Container {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
    this.resolutionStack = new Set();
  }

  /**
   * Register a service with the container
   * @param {string} name - Service name
   * @param {Function} factory - Factory function that creates the service
   * @param {Object} options - Registration options
   * @param {string} options.lifecycle - 'singleton' or 'transient' (default: 'transient')
   */
  register(name, factory, options = {}) {
    if (!name || typeof name !== 'string') {
      throw new Error('Service name must be a non-empty string');
    }

    if (typeof factory !== 'function') {
      throw new Error(`Factory for service '${name}' must be a function`);
    }

    const lifecycle = options.lifecycle || 'transient';
    
    if (lifecycle !== 'singleton' && lifecycle !== 'transient') {
      throw new Error(`Invalid lifecycle '${lifecycle}' for service '${name}'. Must be 'singleton' or 'transient'`);
    }

    this.services.set(name, {
      factory,
      lifecycle
    });
  }

  /**
   * Register a service as a singleton (single instance shared across all resolutions)
   * @param {string} name - Service name
   * @param {Function} factory - Factory function that creates the service
   */
  registerSingleton(name, factory) {
    this.register(name, factory, { lifecycle: 'singleton' });
  }

  /**
   * Register a service as transient (new instance created for each resolution)
   * @param {string} name - Service name
   * @param {Function} factory - Factory function that creates the service
   */
  registerTransient(name, factory) {
    this.register(name, factory, { lifecycle: 'transient' });
  }

  /**
   * Resolve a service from the container
   * @param {string} name - Service name to resolve
   * @returns {*} The resolved service instance
   */
  resolve(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Service name must be a non-empty string');
    }

    // Check if service is registered
    if (!this.services.has(name)) {
      throw new Error(`Service '${name}' is not registered in the container`);
    }

    const serviceConfig = this.services.get(name);

    // Check for circular dependencies
    if (this.resolutionStack.has(name)) {
      const cycle = Array.from(this.resolutionStack).concat(name).join(' -> ');
      throw new Error(`Circular dependency detected: ${cycle}`);
    }

    // If singleton and already instantiated, return cached instance
    if (serviceConfig.lifecycle === 'singleton' && this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // Add to resolution stack for circular dependency detection
    this.resolutionStack.add(name);

    try {
      // Create instance using factory
      const instance = serviceConfig.factory(this);

      // Cache singleton instances
      if (serviceConfig.lifecycle === 'singleton') {
        this.singletons.set(name, instance);
      }

      return instance;
    } catch (error) {
      // Enhance error message with context
      if (error.message.includes('Circular dependency detected')) {
        throw error;
      }
      throw new Error(`Failed to resolve service '${name}': ${error.message}`);
    } finally {
      // Remove from resolution stack
      this.resolutionStack.delete(name);
    }
  }

  /**
   * Check if a service is registered
   * @param {string} name - Service name
   * @returns {boolean} True if service is registered
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Clear all registrations and cached singletons
   * Useful for testing
   */
  clear() {
    this.services.clear();
    this.singletons.clear();
    this.resolutionStack.clear();
  }

  /**
   * Get all registered service names
   * @returns {string[]} Array of service names
   */
  getRegisteredServices() {
    return Array.from(this.services.keys());
  }
}

module.exports = Container;
