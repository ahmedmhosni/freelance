const ClientService = require('./ClientService');
const Client = require('../models/Client');
const { ValidationError, NotFoundError } = require('../../../core/errors');

describe('ClientService', () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    // Create mock repository with all required methods
    mockRepository = {
      findByIdAndUserId: jest.fn(),
      findByUserId: jest.fn(),
      search: jest.fn(),
      countByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsForUser: jest.fn(),
      findByEmail: jest.fn()
    };

    service = new ClientService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should create service with repository', () => {
      expect(service.clientRepository).toBe(mockRepository);
      expect(service.repository).toBe(mockRepository);
    });
  });

  describe('getAllForUser', () => {
    const userId = 10;
    const mockClients = [
      new Client({
        id: 1,
        user_id: userId,
        name: 'Client 1',
        email: 'client1@example.com',
        created_at: new Date(),
        updated_at: new Date()
      }),
      new Client({
        id: 2,
        user_id: userId,
        name: 'Client 2',
        email: 'client2@example.com',
        created_at: new Date(),
        updated_at: new Date()
      })
    ];

    test('should get all clients without search', async () => {
      mockRepository.findByUserId.mockResolvedValueOnce(mockClients);
      mockRepository.countByUserId.mockResolvedValueOnce(2);

      const result = await service.getAllForUser(userId);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId, {
        limit: 20,
        offset: 0
      });
      expect(mockRepository.countByUserId).toHaveBeenCalledWith(userId);
      expect(result.data).toEqual(mockClients);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        pages: 1
      });
    });

    test('should get clients with search term', async () => {
      const searchTerm = 'test';
      mockRepository.search.mockResolvedValueOnce(mockClients);
      mockRepository.countByUserId.mockResolvedValueOnce(2);

      const result = await service.getAllForUser(userId, { search: searchTerm });

      expect(mockRepository.search).toHaveBeenCalledWith(userId, searchTerm, {
        limit: 20,
        offset: 0
      });
      expect(mockRepository.countByUserId).toHaveBeenCalledWith(userId, searchTerm);
      expect(result.data).toEqual(mockClients);
    });

    test('should support custom pagination', async () => {
      mockRepository.findByUserId.mockResolvedValueOnce([mockClients[0]]);
      mockRepository.countByUserId.mockResolvedValueOnce(10);

      const result = await service.getAllForUser(userId, { page: 2, limit: 5 });

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId, {
        limit: 5,
        offset: 5
      });
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 10,
        pages: 2
      });
    });

    test('should calculate correct pagination with remainder', async () => {
      mockRepository.findByUserId.mockResolvedValueOnce(mockClients);
      mockRepository.countByUserId.mockResolvedValueOnce(25);

      const result = await service.getAllForUser(userId, { page: 1, limit: 10 });

      expect(result.pagination.pages).toBe(3); // 25 / 10 = 2.5, ceil = 3
    });

    test('should handle empty results', async () => {
      mockRepository.findByUserId.mockResolvedValueOnce([]);
      mockRepository.countByUserId.mockResolvedValueOnce(0);

      const result = await service.getAllForUser(userId);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.pages).toBe(0);
    });
  });

  describe('getByIdForUser', () => {
    const userId = 10;
    const clientId = 1;

    test('should get client by ID for user', async () => {
      const mockClient = new Client({
        id: clientId,
        user_id: userId,
        name: 'Test Client',
        email: 'test@example.com',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockRepository.findByIdAndUserId.mockResolvedValueOnce(mockClient);

      const result = await service.getByIdForUser(clientId, userId);

      expect(mockRepository.findByIdAndUserId).toHaveBeenCalledWith(clientId, userId);
      expect(result).toEqual(mockClient);
    });

    test('should throw NotFoundError when client not found', async () => {
      mockRepository.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(service.getByIdForUser(999, userId)).rejects.toThrow(NotFoundError);
      await expect(service.getByIdForUser(999, userId)).rejects.toThrow('Client not found');
    });

    test('should throw NotFoundError when client belongs to different user', async () => {
      mockRepository.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(service.getByIdForUser(clientId, 999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    const userId = 10;

    test('should create a valid client', async () => {
      const clientData = {
        name: 'New Client',
        email: 'new@example.com',
        phone: '123-456-7890',
        company: 'Test Company',
        notes: 'Test notes'
      };

      const mockCreatedClient = new Client({
        id: 1,
        user_id: userId,
        ...clientData,
        created_at: new Date(),
        updated_at: new Date()
      });

      mockRepository.findByEmail.mockResolvedValueOnce(null);
      mockRepository.create.mockResolvedValueOnce(mockCreatedClient);

      const result = await service.create(clientData, userId);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(clientData.email, userId);
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        company: clientData.company,
        notes: clientData.notes
      });
      expect(result).toEqual(mockCreatedClient);
    });

    test('should create client without optional fields', async () => {
      const clientData = { name: 'Minimal Client' };

      const mockCreatedClient = new Client({
        id: 1,
        user_id: userId,
        name: 'Minimal Client',
        email: null,
        phone: null,
        company: null,
        notes: null,
        created_at: new Date(),
        updated_at: new Date()
      });

      mockRepository.create.mockResolvedValueOnce(mockCreatedClient);

      const result = await service.create(clientData, userId);

      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        name: 'Minimal Client',
        email: null,
        phone: null,
        company: null,
        notes: null
      });
      expect(result).toEqual(mockCreatedClient);
    });

    test('should throw ValidationError when name is missing', async () => {
      const clientData = { email: 'test@example.com' };

      await expect(service.create(clientData, userId)).rejects.toThrow(ValidationError);
      await expect(service.create(clientData, userId)).rejects.toThrow('Client validation failed');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when name is empty', async () => {
      const clientData = { name: '   ' };

      await expect(service.create(clientData, userId)).rejects.toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when name is too long', async () => {
      const clientData = { name: 'a'.repeat(256) };

      await expect(service.create(clientData, userId)).rejects.toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when email format is invalid', async () => {
      const clientData = {
        name: 'Test Client',
        email: 'invalid-email'
      };

      await expect(service.create(clientData, userId)).rejects.toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when email already exists', async () => {
      const clientData = {
        name: 'Test Client',
        email: 'existing@example.com'
      };

      const existingClient = new Client({
        id: 2,
        user_id: userId,
        name: 'Existing Client',
        email: 'existing@example.com',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockRepository.findByEmail.mockResolvedValueOnce(existingClient);

      await expect(service.create(clientData, userId)).rejects.toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    test('should throw ValidationError with field details for duplicate email', async () => {
      const clientData = {
        name: 'Test Client',
        email: 'existing@example.com'
      };

      const existingClient = new Client({
        id: 2,
        user_id: userId,
        name: 'Existing Client',
        email: 'existing@example.com',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockRepository.findByEmail.mockResolvedValueOnce(existingClient);

      try {
        await service.create(clientData, userId);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details).toEqual([
          { field: 'email', message: 'Email already in use' }
        ]);
      }
    });

    test('should allow same email for different users', async () => {
      const clientData = {
        name: 'Test Client',
        email: 'test@example.com'
      };

      const mockCreatedClient = new Client({
        id: 1,
        user_id: userId,
        ...clientData,
        created_at: new Date(),
        updated_at: new Date()
      });

      mockRepository.findByEmail.mockResolvedValueOnce(null);
      mockRepository.create.mockResolvedValueOnce(mockCreatedClient);

      const result = await service.create(clientData, userId);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(clientData.email, userId);
      expect(result).toEqual(mockCreatedClient);
    });
  });

  describe('update', () => {
    const userId = 10;
    const clientId = 1;

    test('should update a client', async () => {
      const existingClient = new Client({
        id: clientId,
        user_id: userId,
        name: 'Old Name',
        email: 'old@example.com',
        created_at: new Date(),
        updated_at: new Date()
      });

      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '123-456-7890',
        company: 'Updated Company',
        notes: 'Updated notes'
      };

      const mockUpdatedClient = new Client({
        id: clientId,
        user_id: userId,
        ...updateData,
        created_at: existingClient.createdAt,
        updated_at: new Date()
      });

      mockRepository.findByIdAndUserId.mockResolvedValueOnce(existingClient);
      mockRepository.findByEmail.mockResolvedValueOnce(null);
      mockRepository.update.mockResolvedValueOnce(mockUpdatedClient);

      const result = await service.update(clientId, updateData, userId);

      expect(mockRepository.findByIdAndUserId).toHaveBeenCalledWith(clientId, userId);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(updateData.email, userId);
      expect(mockRepository.update).toHaveBeenCalledWith(clientId, userId, {
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone,
        company: updateData.company,
        notes: updateData.notes
      });
      expect(result).toEqual(mockUpdatedClient);
    });

    test('should throw NotFoundError when client does not exist', async () => {
      mockRepository.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(service.update(999, { name: 'Test' }, userId)).rejects.toThrow(NotFoundError);
      await expect(service.update(999, { name: 'Test' }, userId)).rejects.toThrow('Client not found');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when name is empty', async () => {
      const existingClient = new Client({
        id: clientId,
        user_id: userId,
        name: 'Old Name',
        email: 'old@example.com',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockRepository.findByIdAndUserId.mockResolvedValueOnce(existingClient);

      await expect(service.update(clientId, { name: '   ' }, userId)).rejects.toThrow(ValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when email format is invalid', async () => {
      const existingClient = new Client({
        id: clientId,
        user_id: userId,
        name: 'Test Client',
        email: 'old@example.com',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockRepository.findByIdAndUserId.mockResolvedValueOnce(existingClient);

      await expect(
        service.update(clientId, { name: 'Test', email: 'invalid-email' }, userId)
      ).rejects.toThrow(ValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when email already exists for another client', async () => {
      const existingClient = new Client({
        id: clientId,
        user_id: userId,
        name: 'Test Client',
        email: 'old@example.com',
        created_at: new Date(),
        updated_at: new Date()
      });

      const otherClient = new Client({
        id: 2,
        user_id: userId,
        name: 'Other Client',
        email: 'taken@example.com',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockRepository.findByIdAndUserId.mockResolvedValueOnce(existingClient);
      mockRepository.findByEmail.mockResolvedValueOnce(otherClient);

      try {
        await service.update(clientId, { name: 'Test', email: 'taken@example.com' }, userId);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe('Client with this email already exists');
      }
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('should allow updating to same email', async () => {
      const existingClient = new Client({
        id: clientId,
        user_id: userId,
        name: 'Test Client',
        email: 'same@example.com',
        created_at: new Date(),
        updated_at: new Date()
      });

      const updateData = {
        name: 'Updated Name',
        email: 'same@example.com'
      };

      const mockUpdatedClient = new Client({
        ...existingClient,
        name: updateData.name,
        updated_at: new Date()
      });

      mockRepository.findByIdAndUserId.mockResolvedValueOnce(existingClient);
      mockRepository.update.mockResolvedValueOnce(mockUpdatedClient);

      const result = await service.update(clientId, updateData, userId);

      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedClient);
    });

    test('should allow updating email when it belongs to same client', async () => {
      const existingClient = new Client({
        id: clientId,
        user_id: userId,
        name: 'Test Client',
        email: 'old@example.com',
        created_at: new Date(),
        updated_at: new Date()
      });

      const updateData = {
        name: 'Updated Name',
        email: 'new@example.com'
      };

      const sameClientWithNewEmail = new Client({
        id: clientId,
        user_id: userId,
        name: 'Test Client',
        email: 'new@example.com',
        created_at: new Date(),
        updated_at: new Date()
      });

      const mockUpdatedClient = new Client({
        ...existingClient,
        ...updateData,
        updated_at: new Date()
      });

      mockRepository.findByIdAndUserId.mockResolvedValueOnce(existingClient);
      mockRepository.findByEmail.mockResolvedValueOnce(sameClientWithNewEmail);
      mockRepository.update.mockResolvedValueOnce(mockUpdatedClient);

      const result = await service.update(clientId, updateData, userId);

      expect(result).toEqual(mockUpdatedClient);
    });
  });

  describe('delete', () => {
    const userId = 10;
    const clientId = 1;

    test('should delete an existing client', async () => {
      mockRepository.existsForUser.mockResolvedValueOnce(true);
      mockRepository.delete.mockResolvedValueOnce(true);

      const result = await service.delete(clientId, userId);

      expect(mockRepository.existsForUser).toHaveBeenCalledWith(clientId, userId);
      expect(mockRepository.delete).toHaveBeenCalledWith(clientId, userId);
      expect(result).toBe(true);
    });

    test('should throw NotFoundError when client does not exist', async () => {
      mockRepository.existsForUser.mockResolvedValueOnce(false);

      await expect(service.delete(999, userId)).rejects.toThrow(NotFoundError);
      await expect(service.delete(999, userId)).rejects.toThrow('Client not found');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    test('should throw NotFoundError when client belongs to different user', async () => {
      mockRepository.existsForUser.mockResolvedValueOnce(false);

      await expect(service.delete(clientId, 999)).rejects.toThrow(NotFoundError);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    const userId = 10;
    const clientId = 1;

    test('should return true when client exists for user', async () => {
      mockRepository.existsForUser.mockResolvedValueOnce(true);

      const result = await service.exists(clientId, userId);

      expect(mockRepository.existsForUser).toHaveBeenCalledWith(clientId, userId);
      expect(result).toBe(true);
    });

    test('should return false when client does not exist', async () => {
      mockRepository.existsForUser.mockResolvedValueOnce(false);

      const result = await service.exists(999, userId);

      expect(result).toBe(false);
    });

    test('should return false when client belongs to different user', async () => {
      mockRepository.existsForUser.mockResolvedValueOnce(false);

      const result = await service.exists(clientId, 999);

      expect(result).toBe(false);
    });
  });

  describe('Error Propagation', () => {
    const userId = 10;

    test('should propagate repository errors on getAllForUser', async () => {
      const error = new Error('Database connection failed');
      mockRepository.findByUserId.mockRejectedValueOnce(error);

      await expect(service.getAllForUser(userId)).rejects.toThrow('Database connection failed');
    });

    test('should propagate repository errors on getByIdForUser', async () => {
      const error = new Error('Database connection failed');
      mockRepository.findByIdAndUserId.mockRejectedValueOnce(error);

      await expect(service.getByIdForUser(1, userId)).rejects.toThrow('Database connection failed');
    });

    test('should propagate repository errors on create', async () => {
      const error = new Error('Database connection failed');
      mockRepository.findByEmail.mockResolvedValueOnce(null);
      mockRepository.create.mockRejectedValueOnce(error);

      await expect(
        service.create({ name: 'Test Client' }, userId)
      ).rejects.toThrow('Database connection failed');
    });

    test('should propagate repository errors on update', async () => {
      const existingClient = new Client({
        id: 1,
        user_id: userId,
        name: 'Test Client',
        email: 'test@example.com',
        created_at: new Date(),
        updated_at: new Date()
      });

      const error = new Error('Database connection failed');
      mockRepository.findByIdAndUserId.mockResolvedValueOnce(existingClient);
      mockRepository.update.mockRejectedValueOnce(error);

      await expect(
        service.update(1, { name: 'Updated' }, userId)
      ).rejects.toThrow('Database connection failed');
    });

    test('should propagate repository errors on delete', async () => {
      const error = new Error('Database connection failed');
      mockRepository.existsForUser.mockResolvedValueOnce(true);
      mockRepository.delete.mockRejectedValueOnce(error);

      await expect(service.delete(1, userId)).rejects.toThrow('Database connection failed');
    });
  });
});
