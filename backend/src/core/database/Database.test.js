const Database = require('./Database');
const { Pool } = require('pg');

// Mock pg module
jest.mock('pg');

describe('Database', () => {
  let database;
  let mockPool;
  let mockPoolInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock pool instance
    mockPoolInstance = {
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
      totalCount: 10,
      idleCount: 5,
      waitingCount: 2
    };
    
    // Mock Pool constructor to return our instance
    Pool.mockImplementation(() => mockPoolInstance);
    
    database = new Database({
      host: 'localhost',
      port: 5432,
      database: 'test_db',
      user: 'test_user',
      password: 'test_pass',
      logQueries: false,
      retryAttempts: 1
    });
  });

  afterEach(async () => {
    if (database && database.pool) {
      await database.close();
    }
  });

  describe('Constructor', () => {
    test('should create database instance with provided config', () => {
      expect(database.config.host).toBe('localhost');
      expect(database.config.port).toBe(5432);
      expect(database.config.database).toBe('test_db');
      expect(database.config.user).toBe('test_user');
    });

    test('should use default values when config not provided', () => {
      const db = new Database();
      expect(db.config.host).toBe('localhost');
      expect(db.config.port).toBe(5432);
      expect(db.config.max).toBe(20);
    });

    test('should use environment variables when available', () => {
      process.env.PG_HOST = 'env-host';
      process.env.PG_PORT = '5433';
      process.env.PG_DATABASE = 'env-db';
      
      const db = new Database();
      expect(db.config.host).toBe('env-host');
      expect(db.config.port).toBe(5433);
      expect(db.config.database).toBe('env-db');
      
      delete process.env.PG_HOST;
      delete process.env.PG_PORT;
      delete process.env.PG_DATABASE;
    });
  });

  describe('Connection', () => {
    test('should connect to database successfully', async () => {
      mockPoolInstance.query.mockResolvedValueOnce({ rows: [{ now: new Date() }] });

      await database.connect();

      expect(database.isConnected).toBe(true);
      expect(Pool).toHaveBeenCalled();
      expect(mockPoolInstance.query).toHaveBeenCalledWith('SELECT NOW()');
    });

    test('should not reconnect if already connected', async () => {
      mockPoolInstance.query.mockResolvedValue({ rows: [{ now: new Date() }] });

      await database.connect();
      const firstPool = database.pool;
      
      await database.connect();
      
      expect(database.pool).toBe(firstPool);
      expect(mockPoolInstance.query).toHaveBeenCalledTimes(1);
    });

    test('should throw error after max retry attempts', async () => {
      const db = new Database({
        host: 'localhost',
        retryAttempts: 2,
        retryDelay: 10
      });

      mockPoolInstance.query.mockRejectedValue(new Error('Connection failed'));

      await expect(db.connect()).rejects.toThrow('Failed to connect to database after 2 attempts');
    });
  });

  describe('Query Methods', () => {
    beforeEach(async () => {
      mockPoolInstance.query.mockResolvedValueOnce({ rows: [{ now: new Date() }] });
      await database.connect();
      jest.clearAllMocks();
    });

    test('query() should execute SQL and return full result', async () => {
      const mockResult = {
        rows: [{ id: 1, name: 'Test' }],
        rowCount: 1,
        command: 'SELECT'
      };
      mockPoolInstance.query.mockResolvedValueOnce(mockResult);

      const result = await database.query('SELECT * FROM users WHERE id = $1', [1]);

      expect(result).toEqual(mockResult);
      expect(mockPoolInstance.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
    });

    test('queryOne() should return single row', async () => {
      mockPoolInstance.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Test' }]
      });

      const result = await database.queryOne('SELECT * FROM users WHERE id = $1', [1]);

      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    test('queryOne() should return null when no rows found', async () => {
      mockPoolInstance.query.mockResolvedValueOnce({ rows: [] });

      const result = await database.queryOne('SELECT * FROM users WHERE id = $1', [999]);

      expect(result).toBeNull();
    });

    test('queryMany() should return array of rows', async () => {
      const mockRows = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ];
      mockPoolInstance.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await database.queryMany('SELECT * FROM users');

      expect(result).toEqual(mockRows);
    });

    test('queryMany() should return empty array when no rows found', async () => {
      mockPoolInstance.query.mockResolvedValueOnce({ rows: [] });

      const result = await database.queryMany('SELECT * FROM users WHERE id > $1', [1000]);

      expect(result).toEqual([]);
    });

    test('execute() should return row count', async () => {
      mockPoolInstance.query.mockResolvedValueOnce({ rowCount: 3 });

      const result = await database.execute('DELETE FROM users WHERE active = $1', [false]);

      expect(result).toBe(3);
    });

    test('should enhance errors with query context', async () => {
      const dbError = new Error('Syntax error');
      dbError.code = '42601';
      dbError.detail = 'Unexpected token';
      mockPoolInstance.query.mockRejectedValueOnce(dbError);

      await expect(
        database.query('SELECT * FORM users', [])
      ).rejects.toMatchObject({
        name: 'DatabaseError',
        message: 'Syntax error',
        code: '42601',
        query: 'SELECT * FORM users'
      });
    });
  });

  describe('Transaction', () => {
    let mockClient;

    beforeEach(async () => {
      mockPoolInstance.query.mockResolvedValueOnce({ rows: [{ now: new Date() }] });
      await database.connect();
      
      mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };
      mockPoolInstance.connect.mockResolvedValue(mockClient);
      jest.clearAllMocks();
    });

    test('should execute transaction successfully', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT
        .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE
        .mockResolvedValueOnce({}); // COMMIT

      const result = await database.transaction(async (client) => {
        await client.query('INSERT INTO users (name) VALUES ($1)', ['Test']);
        await client.execute('UPDATE users SET active = $1', [true]);
        return 'success';
      });

      expect(result).toBe('success');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should rollback transaction on error', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(new Error('Query failed')) // INSERT fails
        .mockResolvedValueOnce({}); // ROLLBACK

      await expect(
        database.transaction(async (client) => {
          await client.query('INSERT INTO users (name) VALUES ($1)', ['Test']);
        })
      ).rejects.toThrow('Query failed');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should support queryOne in transaction', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Test' }] }) // SELECT
        .mockResolvedValueOnce({}); // COMMIT

      const result = await database.transaction(async (client) => {
        return await client.queryOne('SELECT * FROM users WHERE id = $1', [1]);
      });

      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    test('should support queryMany in transaction', async () => {
      const mockRows = [{ id: 1 }, { id: 2 }];
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: mockRows }) // SELECT
        .mockResolvedValueOnce({}); // COMMIT

      const result = await database.transaction(async (client) => {
        return await client.queryMany('SELECT * FROM users');
      });

      expect(result).toEqual(mockRows);
    });

    test('should support execute in transaction', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rowCount: 5 }) // DELETE
        .mockResolvedValueOnce({}); // COMMIT

      const result = await database.transaction(async (client) => {
        return await client.execute('DELETE FROM users WHERE active = $1', [false]);
      });

      expect(result).toBe(5);
    });
  });

  describe('Client Management', () => {
    beforeEach(async () => {
      mockPoolInstance.query.mockResolvedValueOnce({ rows: [{ now: new Date() }] });
      await database.connect();
      jest.clearAllMocks();
    });

    test('getClient() should return a client from pool', async () => {
      const mockClient = { query: jest.fn(), release: jest.fn() };
      mockPoolInstance.connect.mockResolvedValueOnce(mockClient);

      const client = await database.getClient();

      expect(client).toBe(mockClient);
      expect(mockPoolInstance.connect).toHaveBeenCalled();
    });

    test('releaseClient() should release client back to pool', () => {
      const mockClient = { release: jest.fn() };

      database.releaseClient(mockClient);

      expect(mockClient.release).toHaveBeenCalled();
    });

    test('releaseClient() should handle null client gracefully', () => {
      expect(() => database.releaseClient(null)).not.toThrow();
    });
  });

  describe('Health Check', () => {
    beforeEach(async () => {
      mockPoolInstance.query.mockResolvedValueOnce({ rows: [{ now: new Date() }] });
      await database.connect();
      jest.clearAllMocks();
    });

    test('should return true when database is healthy', async () => {
      mockPoolInstance.query.mockResolvedValueOnce({ rows: [{ health: 1 }] });

      const isHealthy = await database.healthCheck();

      expect(isHealthy).toBe(true);
      expect(mockPoolInstance.query).toHaveBeenCalledWith('SELECT 1 as health');
    });

    test('should return false when database is unhealthy', async () => {
      mockPoolInstance.query.mockRejectedValueOnce(new Error('Connection lost'));

      const isHealthy = await database.healthCheck();

      expect(isHealthy).toBe(false);
    });
  });

  describe('Pool Statistics', () => {
    beforeEach(async () => {
      mockPoolInstance.query.mockResolvedValueOnce({ rows: [{ now: new Date() }] });
      await database.connect();
    });

    test('should return pool statistics', () => {
      const stats = database.getPoolStats();

      expect(stats).toEqual({
        total: 10,
        idle: 5,
        waiting: 2
      });
    });

    test('should return null when pool not initialized', () => {
      const db = new Database();
      const stats = db.getPoolStats();

      expect(stats).toBeNull();
    });
  });

  describe('Close', () => {
    test('should close pool connection', async () => {
      mockPoolInstance.query.mockResolvedValueOnce({ rows: [{ now: new Date() }] });
      mockPoolInstance.end.mockResolvedValueOnce();

      await database.connect();
      await database.close();

      expect(mockPoolInstance.end).toHaveBeenCalled();
      expect(database.isConnected).toBe(false);
      expect(database.pool).toBeNull();
    });

    test('should handle close when not connected', async () => {
      await expect(database.close()).resolves.not.toThrow();
    });
  });

  describe('Auto-connect', () => {
    test('should auto-connect when executing query', async () => {
      mockPoolInstance.query
        .mockResolvedValueOnce({ rows: [{ now: new Date() }] }) // connect
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // actual query

      const result = await database.query('SELECT * FROM users');

      expect(database.isConnected).toBe(true);
      expect(result.rows).toEqual([{ id: 1 }]);
    });

    test('should auto-connect when starting transaction', async () => {
      mockPoolInstance.query.mockResolvedValueOnce({ rows: [{ now: new Date() }] });
      
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // SELECT
          .mockResolvedValueOnce({}), // COMMIT
        release: jest.fn()
      };
      mockPoolInstance.connect.mockResolvedValueOnce(mockClient);

      await database.transaction(async (client) => {
        return await client.queryOne('SELECT * FROM users WHERE id = $1', [1]);
      });

      expect(database.isConnected).toBe(true);
    });
  });
});
