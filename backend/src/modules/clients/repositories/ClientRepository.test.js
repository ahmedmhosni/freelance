const ClientRepository = require('./ClientRepository');
const Client = require('../models/Client');

describe('ClientRepository', () => {
  let repository;
  let mockDatabase;

  beforeEach(() => {
    mockDatabase = {
      queryOne: jest.fn(),
      queryMany: jest.fn(),
      execute: jest.fn(),
      query: jest.fn()
    };
    repository = new ClientRepository(mockDatabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create repository with correct table name', () => {
    expect(repository.tableName).toBe('clients');
    expect(repository.db).toBe(mockDatabase);
  });

  test('should create a new client', async () => {
    const clientData = {
      userId: 10,
      name: 'Test Client',
      email: 'test@example.com'
    };

    const mockRow = {
      id: 1,
      user_id: 10,
      name: 'Test Client',
      email: 'test@example.com',
      phone: null,
      company: null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
    const result = await repository.create(clientData);

    expect(result).toBeInstanceOf(Client);
    expect(result.name).toBe('Test Client');
  });

  test('should find client by ID and user ID', async () => {
    const mockRow = {
      id: 1,
      user_id: 10,
      name: 'Test Client',
      email: 'test@example.com',
      phone: null,
      company: null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
    const result = await repository.findByIdAndUserId(1, 10);

    expect(result).toBeInstanceOf(Client);
    expect(result.id).toBe(1);
  });

  test('should search clients', async () => {
    const mockRows = [{
      id: 1,
      user_id: 10,
      name: 'Test Client',
      email: 'test@example.com',
      phone: null,
      company: null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date()
    }];

    mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
    const result = await repository.search(10, 'Test');

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Client);
  });

  test('should update a client', async () => {
    const updateData = {
      name: 'Updated Client',
      email: 'updated@example.com',
      phone: null,
      company: null,
      notes: null
    };

    const mockRow = {
      id: 1,
      user_id: 10,
      ...updateData,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
    const result = await repository.update(1, 10, updateData);

    expect(result).toBeInstanceOf(Client);
    expect(result.name).toBe('Updated Client');
  });

  test('should delete a client', async () => {
    mockDatabase.execute.mockResolvedValueOnce(1);
    const result = await repository.delete(1, 10);
    expect(result).toBe(true);
  });

  test('should count clients', async () => {
    mockDatabase.queryOne.mockResolvedValueOnce({ total: '5' });
    const result = await repository.countByUserId(10);
    expect(result).toBe(5);
  });

  test('should check if client exists', async () => {
    mockDatabase.queryOne.mockResolvedValueOnce({ exists: true });
    const result = await repository.existsForUser(1, 10);
    expect(result).toBe(true);
  });

  test('should find client by email', async () => {
    const mockRow = {
      id: 1,
      user_id: 10,
      name: 'Test Client',
      email: 'test@example.com',
      phone: null,
      company: null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
    const result = await repository.findByEmail('test@example.com', 10);

    expect(result).toBeInstanceOf(Client);
    expect(result.email).toBe('test@example.com');
  });

  test('should propagate database errors', async () => {
    const error = new Error('Database connection failed');
    mockDatabase.queryOne.mockRejectedValueOnce(error);

    await expect(
      repository.create({ userId: 10, name: 'Test' })
    ).rejects.toThrow('Database connection failed');
  });
});
