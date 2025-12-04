const Container = require('./Container');

describe('Container', () => {
  let container;

  beforeEach(() => {
    container = new Container();
  });

  describe('Registration', () => {
    test('should register a service with default transient lifecycle', () => {
      const factory = () => ({ value: 'test' });
      container.register('testService', factory);
      
      expect(container.has('testService')).toBe(true);
    });

    test('should register a service with explicit lifecycle', () => {
      const factory = () => ({ value: 'test' });
      container.register('testService', factory, { lifecycle: 'singleton' });
      
      expect(container.has('testService')).toBe(true);
    });

    test('should throw error when registering with invalid name', () => {
      expect(() => {
        container.register('', () => {});
      }).toThrow('Service name must be a non-empty string');

      expect(() => {
        container.register(null, () => {});
      }).toThrow('Service name must be a non-empty string');

      expect(() => {
        container.register(123, () => {});
      }).toThrow('Service name must be a non-empty string');
    });

    test('should throw error when factory is not a function', () => {
      expect(() => {
        container.register('testService', 'not a function');
      }).toThrow("Factory for service 'testService' must be a function");

      expect(() => {
        container.register('testService', null);
      }).toThrow("Factory for service 'testService' must be a function");
    });

    test('should throw error for invalid lifecycle', () => {
      expect(() => {
        container.register('testService', () => {}, { lifecycle: 'invalid' });
      }).toThrow("Invalid lifecycle 'invalid' for service 'testService'. Must be 'singleton' or 'transient'");
    });

    test('should allow overwriting existing service registration', () => {
      container.register('testService', () => ({ value: 'first' }));
      container.register('testService', () => ({ value: 'second' }));
      
      const instance = container.resolve('testService');
      expect(instance.value).toBe('second');
    });
  });

  describe('registerSingleton', () => {
    test('should register service as singleton', () => {
      const factory = () => ({ value: 'test' });
      container.registerSingleton('testService', factory);
      
      expect(container.has('testService')).toBe(true);
    });

    test('should throw error for invalid inputs', () => {
      expect(() => {
        container.registerSingleton('', () => {});
      }).toThrow('Service name must be a non-empty string');

      expect(() => {
        container.registerSingleton('testService', 'not a function');
      }).toThrow("Factory for service 'testService' must be a function");
    });
  });

  describe('registerTransient', () => {
    test('should register service as transient', () => {
      const factory = () => ({ value: 'test' });
      container.registerTransient('testService', factory);
      
      expect(container.has('testService')).toBe(true);
    });

    test('should throw error for invalid inputs', () => {
      expect(() => {
        container.registerTransient('', () => {});
      }).toThrow('Service name must be a non-empty string');

      expect(() => {
        container.registerTransient('testService', null);
      }).toThrow("Factory for service 'testService' must be a function");
    });
  });

  describe('Resolution', () => {
    test('should resolve a registered service', () => {
      container.register('testService', () => ({ value: 'test' }));
      
      const instance = container.resolve('testService');
      expect(instance).toEqual({ value: 'test' });
    });

    test('should throw error when resolving unregistered service', () => {
      expect(() => {
        container.resolve('nonExistent');
      }).toThrow("Service 'nonExistent' is not registered in the container");
    });

    test('should throw error when resolving with invalid name', () => {
      expect(() => {
        container.resolve('');
      }).toThrow('Service name must be a non-empty string');

      expect(() => {
        container.resolve(null);
      }).toThrow('Service name must be a non-empty string');
    });

    test('should pass container to factory function', () => {
      let receivedContainer;
      container.register('testService', (c) => {
        receivedContainer = c;
        return { value: 'test' };
      });
      
      container.resolve('testService');
      expect(receivedContainer).toBe(container);
    });

    test('should handle factory errors gracefully', () => {
      container.register('errorService', () => {
        throw new Error('Factory error');
      });

      expect(() => {
        container.resolve('errorService');
      }).toThrow("Failed to resolve service 'errorService': Factory error");
    });
  });

  describe('Singleton Lifecycle', () => {
    test('should return same instance for singleton services', () => {
      let counter = 0;
      container.registerSingleton('counter', () => {
        counter++;
        return { id: counter };
      });

      const instance1 = container.resolve('counter');
      const instance2 = container.resolve('counter');
      const instance3 = container.resolve('counter');

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
      expect(instance1.id).toBe(1);
      expect(counter).toBe(1); // Factory called only once
    });

    test('should cache singleton instances', () => {
      const mockFactory = jest.fn(() => ({ value: 'test' }));
      container.registerSingleton('testService', mockFactory);

      container.resolve('testService');
      container.resolve('testService');
      container.resolve('testService');

      expect(mockFactory).toHaveBeenCalledTimes(1);
    });
  });

  describe('Transient Lifecycle', () => {
    test('should return new instance for transient services', () => {
      let counter = 0;
      container.registerTransient('counter', () => {
        counter++;
        return { id: counter };
      });

      const instance1 = container.resolve('counter');
      const instance2 = container.resolve('counter');
      const instance3 = container.resolve('counter');

      expect(instance1).not.toBe(instance2);
      expect(instance2).not.toBe(instance3);
      expect(instance1.id).toBe(1);
      expect(instance2.id).toBe(2);
      expect(instance3.id).toBe(3);
      expect(counter).toBe(3); // Factory called three times
    });

    test('should not cache transient instances', () => {
      const mockFactory = jest.fn(() => ({ value: 'test' }));
      container.registerTransient('testService', mockFactory);

      container.resolve('testService');
      container.resolve('testService');
      container.resolve('testService');

      expect(mockFactory).toHaveBeenCalledTimes(3);
    });
  });

  describe('Dependency Resolution', () => {
    test('should resolve dependencies between services', () => {
      container.registerSingleton('database', () => ({ 
        query: () => 'db result' 
      }));

      container.registerTransient('repository', (c) => {
        const db = c.resolve('database');
        return {
          getData: () => db.query()
        };
      });

      container.registerTransient('service', (c) => {
        const repo = c.resolve('repository');
        return {
          process: () => repo.getData()
        };
      });

      const service = container.resolve('service');
      expect(service.process()).toBe('db result');
    });

    test('should resolve complex dependency chains', () => {
      container.registerSingleton('config', () => ({ 
        dbUrl: 'localhost' 
      }));

      container.registerSingleton('database', (c) => {
        const config = c.resolve('config');
        return { url: config.dbUrl };
      });

      container.registerTransient('userRepo', (c) => {
        const db = c.resolve('database');
        return { db, type: 'user' };
      });

      container.registerTransient('postRepo', (c) => {
        const db = c.resolve('database');
        return { db, type: 'post' };
      });

      container.registerTransient('userService', (c) => {
        const userRepo = c.resolve('userRepo');
        const postRepo = c.resolve('postRepo');
        return { userRepo, postRepo };
      });

      const service = container.resolve('userService');
      expect(service.userRepo.db.url).toBe('localhost');
      expect(service.postRepo.db.url).toBe('localhost');
      expect(service.userRepo.db).toBe(service.postRepo.db); // Same singleton
    });
  });

  describe('Circular Dependency Detection', () => {
    test('should detect direct circular dependency', () => {
      container.register('serviceA', (c) => {
        return { b: c.resolve('serviceB') };
      });

      container.register('serviceB', (c) => {
        return { a: c.resolve('serviceA') };
      });

      expect(() => {
        container.resolve('serviceA');
      }).toThrow(/Circular dependency detected: serviceA -> serviceB -> serviceA/);
    });

    test('should detect indirect circular dependency', () => {
      container.register('serviceA', (c) => {
        return { b: c.resolve('serviceB') };
      });

      container.register('serviceB', (c) => {
        return { c: c.resolve('serviceC') };
      });

      container.register('serviceC', (c) => {
        return { a: c.resolve('serviceA') };
      });

      expect(() => {
        container.resolve('serviceA');
      }).toThrow(/Circular dependency detected: serviceA -> serviceB -> serviceC -> serviceA/);
    });

    test('should detect self-referencing circular dependency', () => {
      container.register('serviceA', (c) => {
        return { self: c.resolve('serviceA') };
      });

      expect(() => {
        container.resolve('serviceA');
      }).toThrow(/Circular dependency detected: serviceA -> serviceA/);
    });

    test('should allow same service in different branches', () => {
      container.registerSingleton('database', () => ({ 
        query: () => 'result' 
      }));

      container.registerTransient('repoA', (c) => {
        const db = c.resolve('database');
        return { db, name: 'repoA' };
      });

      container.registerTransient('repoB', (c) => {
        const db = c.resolve('database');
        return { db, name: 'repoB' };
      });

      container.registerTransient('service', (c) => {
        const repoA = c.resolve('repoA');
        const repoB = c.resolve('repoB');
        return { repoA, repoB };
      });

      const service = container.resolve('service');
      expect(service.repoA.name).toBe('repoA');
      expect(service.repoB.name).toBe('repoB');
      expect(service.repoA.db).toBe(service.repoB.db);
    });
  });

  describe('Utility Methods', () => {
    test('has() should return true for registered services', () => {
      container.register('testService', () => ({}));
      expect(container.has('testService')).toBe(true);
    });

    test('has() should return false for unregistered services', () => {
      expect(container.has('nonExistent')).toBe(false);
    });

    test('clear() should remove all registrations', () => {
      container.register('service1', () => ({}));
      container.register('service2', () => ({}));
      container.registerSingleton('service3', () => ({}));

      expect(container.has('service1')).toBe(true);
      expect(container.has('service2')).toBe(true);
      expect(container.has('service3')).toBe(true);

      container.clear();

      expect(container.has('service1')).toBe(false);
      expect(container.has('service2')).toBe(false);
      expect(container.has('service3')).toBe(false);
    });

    test('clear() should remove cached singletons', () => {
      let counter = 0;
      container.registerSingleton('counter', () => {
        counter++;
        return { id: counter };
      });

      const instance1 = container.resolve('counter');
      expect(instance1.id).toBe(1);

      container.clear();
      container.registerSingleton('counter', () => {
        counter++;
        return { id: counter };
      });

      const instance2 = container.resolve('counter');
      expect(instance2.id).toBe(2);
      expect(instance1).not.toBe(instance2);
    });

    test('getRegisteredServices() should return all service names', () => {
      container.register('service1', () => ({}));
      container.register('service2', () => ({}));
      container.registerSingleton('service3', () => ({}));

      const services = container.getRegisteredServices();
      expect(services).toEqual(expect.arrayContaining(['service1', 'service2', 'service3']));
      expect(services.length).toBe(3);
    });

    test('getRegisteredServices() should return empty array when no services registered', () => {
      const services = container.getRegisteredServices();
      expect(services).toEqual([]);
    });
  });

  describe('Error Cases', () => {
    test('should handle errors in nested dependency resolution', () => {
      container.register('serviceA', (c) => {
        c.resolve('serviceB');
        return {};
      });

      container.register('serviceB', () => {
        throw new Error('ServiceB initialization failed');
      });

      expect(() => {
        container.resolve('serviceA');
      }).toThrow("Failed to resolve service 'serviceA': Failed to resolve service 'serviceB': ServiceB initialization failed");
    });

    test('should clean up resolution stack after error', () => {
      container.register('errorService', () => {
        throw new Error('Test error');
      });

      expect(() => {
        container.resolve('errorService');
      }).toThrow();

      // Should be able to resolve other services after error
      container.register('goodService', () => ({ value: 'good' }));
      const instance = container.resolve('goodService');
      expect(instance.value).toBe('good');
    });

    test('should clean up resolution stack after circular dependency detection', () => {
      container.register('serviceA', (c) => {
        return { b: c.resolve('serviceB') };
      });

      container.register('serviceB', (c) => {
        return { a: c.resolve('serviceA') };
      });

      expect(() => {
        container.resolve('serviceA');
      }).toThrow(/Circular dependency detected/);

      // Should be able to resolve other services after circular dependency error
      container.register('goodService', () => ({ value: 'good' }));
      const instance = container.resolve('goodService');
      expect(instance.value).toBe('good');
    });
  });
});
