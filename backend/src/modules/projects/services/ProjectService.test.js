const ProjectService = require('./ProjectService');
const Project = require('../models/Project');
const { ValidationError, NotFoundError } = require('../../../core/errors');

describe('ProjectService', () => {
  let service;
  let mockProjectRepository;
  let mockClientRepository;

  beforeEach(() => {
    mockProjectRepository = {
      findByIdAndUserId: jest.fn(),
      findByUserId: jest.fn(),
      findByClientId: jest.fn(),
      findByStatus: jest.fn(),
      findOverdue: jest.fn(),
      countByStatus: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    mockClientRepository = {
      exists: jest.fn()
    };

    service = new ProjectService(mockProjectRepository, mockClientRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should create service with repositories', () => {
      expect(service.repository).toBe(mockProjectRepository);
      expect(service.clientRepository).toBe(mockClientRepository);
    });

    test('should work without client repository', () => {
      const serviceWithoutClient = new ProjectService(mockProjectRepository);
      expect(serviceWithoutClient.clientRepository).toBeNull();
    });
  });

  describe('getAllForUser', () => {
    const userId = 10;
    const mockProjects = [
      new Project({
        id: 1,
        user_id: userId,
        client_id: 5,
        name: 'Project 1',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }),
      new Project({
        id: 2,
        user_id: userId,
        client_id: 6,
        name: 'Project 2',
        status: 'completed',
        created_at: new Date(),
        updated_at: new Date()
      })
    ];

    test('should get all projects for user', async () => {
      mockProjectRepository.findByUserId.mockResolvedValueOnce(mockProjects);

      const result = await service.getAllForUser(userId);

      expect(mockProjectRepository.findByUserId).toHaveBeenCalledWith(userId, {}, {});
      expect(result).toEqual(mockProjects);
    });

    test('should get projects with filters', async () => {
      const filters = { clientId: 5, status: 'active' };
      mockProjectRepository.findByUserId.mockResolvedValueOnce([mockProjects[0]]);

      const result = await service.getAllForUser(userId, filters);

      expect(mockProjectRepository.findByUserId).toHaveBeenCalledWith(userId, filters, {});
      expect(result).toEqual([mockProjects[0]]);
    });

    test('should get projects with options', async () => {
      const options = { limit: 10, offset: 0, orderBy: 'name', order: 'ASC' };
      mockProjectRepository.findByUserId.mockResolvedValueOnce(mockProjects);

      const result = await service.getAllForUser(userId, {}, options);

      expect(mockProjectRepository.findByUserId).toHaveBeenCalledWith(userId, {}, options);
      expect(result).toEqual(mockProjects);
    });
  });

  describe('getByIdForUser', () => {
    const userId = 10;
    const projectId = 1;

    test('should get project by ID for user', async () => {
      const mockProject = new Project({
        id: projectId,
        user_id: userId,
        name: 'Test Project',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockProjectRepository.findByIdAndUserId.mockResolvedValueOnce(mockProject);

      const result = await service.getByIdForUser(projectId, userId);

      expect(mockProjectRepository.findByIdAndUserId).toHaveBeenCalledWith(projectId, userId);
      expect(result).toEqual(mockProject);
    });

    test('should throw NotFoundError when project not found', async () => {
      mockProjectRepository.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(service.getByIdForUser(999, userId)).rejects.toThrow(NotFoundError);
      await expect(service.getByIdForUser(999, userId)).rejects.toThrow('Project with ID 999 not found');
    });
  });

  describe('getByClientId', () => {
    const userId = 10;
    const clientId = 5;

    test('should get all projects for a client', async () => {
      const mockProjects = [
        new Project({
          id: 1,
          user_id: userId,
          client_id: clientId,
          name: 'Project 1',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        })
      ];

      mockProjectRepository.findByClientId.mockResolvedValueOnce(mockProjects);

      const result = await service.getByClientId(clientId, userId);

      expect(mockProjectRepository.findByClientId).toHaveBeenCalledWith(clientId, userId);
      expect(result).toEqual(mockProjects);
    });
  });

  describe('getByStatus', () => {
    const userId = 10;

    test('should get projects by status', async () => {
      const mockProjects = [
        new Project({
          id: 1,
          user_id: userId,
          name: 'Active Project',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        })
      ];

      mockProjectRepository.findByStatus.mockResolvedValueOnce(mockProjects);

      const result = await service.getByStatus('active', userId);

      expect(mockProjectRepository.findByStatus).toHaveBeenCalledWith('active', userId);
      expect(result).toEqual(mockProjects);
    });
  });

  describe('getOverdue', () => {
    const userId = 10;

    test('should get overdue projects', async () => {
      const mockProjects = [
        new Project({
          id: 1,
          user_id: userId,
          name: 'Overdue Project',
          status: 'active',
          end_date: '2023-01-01',
          created_at: new Date(),
          updated_at: new Date()
        })
      ];

      mockProjectRepository.findOverdue.mockResolvedValueOnce(mockProjects);

      const result = await service.getOverdue(userId);

      expect(mockProjectRepository.findOverdue).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockProjects);
    });
  });

  describe('createForUser', () => {
    const userId = 10;

    test('should create a valid project', async () => {
      const projectData = {
        name: 'New Project',
        description: 'Test description',
        client_id: 5,
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      };

      const mockCreatedProject = new Project({
        id: 1,
        user_id: userId,
        ...projectData,
        created_at: new Date(),
        updated_at: new Date()
      });

      mockClientRepository.exists.mockResolvedValueOnce(true);
      mockProjectRepository.create.mockResolvedValueOnce(mockCreatedProject);

      const result = await service.createForUser(projectData, userId);

      expect(mockClientRepository.exists).toHaveBeenCalledWith(5);
      expect(mockProjectRepository.create).toHaveBeenCalledWith({
        ...projectData,
        user_id: userId
      });
      expect(result).toEqual(mockCreatedProject);
    });

    test('should create project without optional fields', async () => {
      const projectData = { name: 'Minimal Project' };

      const mockCreatedProject = new Project({
        id: 1,
        user_id: userId,
        name: 'Minimal Project',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockProjectRepository.create.mockResolvedValueOnce(mockCreatedProject);

      const result = await service.createForUser(projectData, userId);

      expect(mockProjectRepository.create).toHaveBeenCalledWith({
        name: 'Minimal Project',
        user_id: userId
      });
      expect(result).toEqual(mockCreatedProject);
    });

    test('should throw ValidationError when name is missing', async () => {
      const projectData = { description: 'Test' };

      await expect(service.createForUser(projectData, userId)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(projectData, userId)).rejects.toThrow('Project name is required');
      expect(mockProjectRepository.create).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when name is empty', async () => {
      const projectData = { name: '   ' };

      await expect(service.createForUser(projectData, userId)).rejects.toThrow(ValidationError);
      expect(mockProjectRepository.create).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when name is too long', async () => {
      const projectData = { name: 'a'.repeat(256) };

      await expect(service.createForUser(projectData, userId)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(projectData, userId)).rejects.toThrow('Project name must be 255 characters or less');
    });

    test('should throw ValidationError for invalid status', async () => {
      const projectData = {
        name: 'Test Project',
        status: 'invalid-status'
      };

      await expect(service.createForUser(projectData, userId)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(projectData, userId)).rejects.toThrow('Status must be one of');
    });

    test('should throw ValidationError when start date is after end date', async () => {
      const projectData = {
        name: 'Test Project',
        start_date: '2024-12-31',
        end_date: '2024-01-01'
      };

      await expect(service.createForUser(projectData, userId)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(projectData, userId)).rejects.toThrow('Start date must be before or equal to end date');
    });

    test('should throw ValidationError for invalid start date format', async () => {
      const projectData = {
        name: 'Test Project',
        start_date: 'invalid-date',
        end_date: '2024-12-31'
      };

      await expect(service.createForUser(projectData, userId)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(projectData, userId)).rejects.toThrow('Invalid start date format');
    });

    test('should throw ValidationError for invalid end date format', async () => {
      const projectData = {
        name: 'Test Project',
        start_date: '2024-01-01',
        end_date: 'invalid-date'
      };

      await expect(service.createForUser(projectData, userId)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(projectData, userId)).rejects.toThrow('Invalid end date format');
    });

    test('should throw ValidationError when client does not exist', async () => {
      const projectData = {
        name: 'Test Project',
        client_id: 999
      };

      mockClientRepository.exists.mockResolvedValueOnce(false);

      await expect(service.createForUser(projectData, userId)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(projectData, userId)).rejects.toThrow('Client with ID 999 not found');
      expect(mockProjectRepository.create).not.toHaveBeenCalled();
    });

    test('should skip client validation when clientRepository is not available', async () => {
      const serviceWithoutClient = new ProjectService(mockProjectRepository);
      const projectData = {
        name: 'Test Project',
        client_id: 999
      };

      const mockCreatedProject = new Project({
        id: 1,
        user_id: userId,
        ...projectData,
        created_at: new Date(),
        updated_at: new Date()
      });

      mockProjectRepository.create.mockResolvedValueOnce(mockCreatedProject);

      const result = await serviceWithoutClient.createForUser(projectData, userId);

      expect(result).toEqual(mockCreatedProject);
    });
  });

  describe('updateForUser', () => {
    const userId = 10;
    const projectId = 1;

    test('should update a project', async () => {
      const existingProject = new Project({
        id: projectId,
        user_id: userId,
        name: 'Old Name',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
        status: 'completed'
      };

      const mockUpdatedProject = new Project({
        id: projectId,
        user_id: userId,
        ...updateData,
        created_at: existingProject.createdAt,
        updated_at: new Date()
      });

      mockProjectRepository.findByIdAndUserId.mockResolvedValueOnce(existingProject);
      mockProjectRepository.update.mockResolvedValueOnce(mockUpdatedProject);

      const result = await service.updateForUser(projectId, updateData, userId);

      expect(mockProjectRepository.findByIdAndUserId).toHaveBeenCalledWith(projectId, userId);
      expect(mockProjectRepository.update).toHaveBeenCalledWith(projectId, updateData);
      expect(result).toEqual(mockUpdatedProject);
    });

    test('should throw NotFoundError when project does not exist', async () => {
      mockProjectRepository.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(service.updateForUser(999, { name: 'Test' }, userId)).rejects.toThrow(NotFoundError);
      await expect(service.updateForUser(999, { name: 'Test' }, userId)).rejects.toThrow('Project with ID 999 not found');
      expect(mockProjectRepository.update).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when name is empty', async () => {
      const existingProject = new Project({
        id: projectId,
        user_id: userId,
        name: 'Old Name',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockProjectRepository.findByIdAndUserId.mockResolvedValue(existingProject);

      await expect(service.updateForUser(projectId, { name: '   ' }, userId)).rejects.toThrow(ValidationError);
      await expect(service.updateForUser(projectId, { name: '   ' }, userId)).rejects.toThrow('Project name cannot be empty');
      expect(mockProjectRepository.update).not.toHaveBeenCalled();
    });

    test('should throw ValidationError for invalid status', async () => {
      const existingProject = new Project({
        id: projectId,
        user_id: userId,
        name: 'Test Project',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockProjectRepository.findByIdAndUserId.mockResolvedValueOnce(existingProject);

      await expect(
        service.updateForUser(projectId, { status: 'invalid-status' }, userId)
      ).rejects.toThrow(ValidationError);
      expect(mockProjectRepository.update).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when client does not exist', async () => {
      const existingProject = new Project({
        id: projectId,
        user_id: userId,
        name: 'Test Project',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockProjectRepository.findByIdAndUserId.mockResolvedValue(existingProject);
      mockClientRepository.exists.mockResolvedValue(false);

      await expect(
        service.updateForUser(projectId, { client_id: 999 }, userId)
      ).rejects.toThrow(ValidationError);
      await expect(
        service.updateForUser(projectId, { client_id: 999 }, userId)
      ).rejects.toThrow('Client with ID 999 not found');
      expect(mockProjectRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteForUser', () => {
    const userId = 10;
    const projectId = 1;

    test('should delete an existing project', async () => {
      const existingProject = new Project({
        id: projectId,
        user_id: userId,
        name: 'Test Project',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockProjectRepository.findByIdAndUserId.mockResolvedValueOnce(existingProject);
      mockProjectRepository.delete.mockResolvedValueOnce(true);

      const result = await service.deleteForUser(projectId, userId);

      expect(mockProjectRepository.findByIdAndUserId).toHaveBeenCalledWith(projectId, userId);
      expect(mockProjectRepository.delete).toHaveBeenCalledWith(projectId);
      expect(result).toBe(true);
    });

    test('should throw NotFoundError when project does not exist', async () => {
      mockProjectRepository.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(service.deleteForUser(999, userId)).rejects.toThrow(NotFoundError);
      await expect(service.deleteForUser(999, userId)).rejects.toThrow('Project with ID 999 not found');
      expect(mockProjectRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getStatusCounts', () => {
    const userId = 10;

    test('should get status counts', async () => {
      const mockCounts = {
        active: 5,
        completed: 3,
        'on-hold': 2,
        cancelled: 1
      };

      mockProjectRepository.countByStatus.mockResolvedValueOnce(mockCounts);

      const result = await service.getStatusCounts(userId);

      expect(mockProjectRepository.countByStatus).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockCounts);
    });
  });

  describe('search', () => {
    const userId = 10;

    test('should search projects', async () => {
      const mockProjects = [
        new Project({
          id: 1,
          user_id: userId,
          name: 'Test Project',
          description: 'Test description',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        })
      ];

      mockProjectRepository.search.mockResolvedValueOnce(mockProjects);

      const result = await service.search('Test', userId);

      expect(mockProjectRepository.search).toHaveBeenCalledWith('Test', userId);
      expect(result).toEqual(mockProjects);
    });

    test('should throw ValidationError when search term is empty', async () => {
      await expect(service.search('', userId)).rejects.toThrow(ValidationError);
      await expect(service.search('', userId)).rejects.toThrow('Search term is required');
      expect(mockProjectRepository.search).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when search term is whitespace', async () => {
      await expect(service.search('   ', userId)).rejects.toThrow(ValidationError);
      expect(mockProjectRepository.search).not.toHaveBeenCalled();
    });
  });

  describe('Error Propagation', () => {
    const userId = 10;

    test('should propagate repository errors on getAllForUser', async () => {
      const error = new Error('Database connection failed');
      mockProjectRepository.findByUserId.mockRejectedValueOnce(error);

      await expect(service.getAllForUser(userId)).rejects.toThrow('Database connection failed');
    });

    test('should propagate repository errors on getByIdForUser', async () => {
      const error = new Error('Database connection failed');
      mockProjectRepository.findByIdAndUserId.mockRejectedValueOnce(error);

      await expect(service.getByIdForUser(1, userId)).rejects.toThrow('Database connection failed');
    });

    test('should propagate repository errors on create', async () => {
      const error = new Error('Database connection failed');
      mockProjectRepository.create.mockRejectedValueOnce(error);

      await expect(
        service.createForUser({ name: 'Test Project' }, userId)
      ).rejects.toThrow('Database connection failed');
    });

    test('should propagate repository errors on update', async () => {
      const existingProject = new Project({
        id: 1,
        user_id: userId,
        name: 'Test Project',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      const error = new Error('Database connection failed');
      mockProjectRepository.findByIdAndUserId.mockResolvedValueOnce(existingProject);
      mockProjectRepository.update.mockRejectedValueOnce(error);

      await expect(
        service.updateForUser(1, { name: 'Updated' }, userId)
      ).rejects.toThrow('Database connection failed');
    });

    test('should propagate repository errors on delete', async () => {
      const existingProject = new Project({
        id: 1,
        user_id: userId,
        name: 'Test Project',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      const error = new Error('Database connection failed');
      mockProjectRepository.findByIdAndUserId.mockResolvedValueOnce(existingProject);
      mockProjectRepository.delete.mockRejectedValueOnce(error);

      await expect(service.deleteForUser(1, userId)).rejects.toThrow('Database connection failed');
    });
  });
});
