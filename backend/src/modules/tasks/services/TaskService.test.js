const TaskService = require('./TaskService');
const Task = require('../models/Task');
const { ValidationError, NotFoundError } = require('../../../core/errors');

describe('TaskService', () => {
  let service;
  let mockTaskRepository;
  let mockProjectRepository;

  beforeEach(() => {
    mockTaskRepository = {
      findByIdAndUserId: jest.fn(),
      findByUserId: jest.fn(),
      findByProjectId: jest.fn(),
      findByStatus: jest.fn(),
      findByPriority: jest.fn(),
      findOverdue: jest.fn(),
      findDueSoon: jest.fn(),
      countByStatus: jest.fn(),
      countByPriority: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    mockProjectRepository = {
      exists: jest.fn()
    };

    service = new TaskService(mockTaskRepository, mockProjectRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should create service with repositories', () => {
      expect(service.repository).toBe(mockTaskRepository);
      expect(service.projectRepository).toBe(mockProjectRepository);
    });

    test('should work without project repository', () => {
      const serviceWithoutProject = new TaskService(mockTaskRepository);
      expect(serviceWithoutProject.projectRepository).toBeNull();
    });
  });

  describe('getAllForUser', () => {
    const userId = 10;
    const mockTasks = [
      new Task({
        id: 1,
        user_id: userId,
        project_id: 5,
        title: 'Task 1',
        status: 'pending',
        priority: 'high',
        created_at: new Date(),
        updated_at: new Date()
      }),
      new Task({
        id: 2,
        user_id: userId,
        project_id: 6,
        title: 'Task 2',
        status: 'done',
        priority: 'low',
        created_at: new Date(),
        updated_at: new Date()
      })
    ];

    test('should get all tasks for user', async () => {
      mockTaskRepository.findByUserId.mockResolvedValueOnce(mockTasks);

      const result = await service.getAllForUser(userId);

      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId, {}, {});
      expect(result).toEqual(mockTasks);
    });

    test('should get tasks with filters', async () => {
      const filters = { projectId: 5, status: 'pending' };
      mockTaskRepository.findByUserId.mockResolvedValueOnce([mockTasks[0]]);

      const result = await service.getAllForUser(userId, filters);

      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId, filters, {});
      expect(result).toEqual([mockTasks[0]]);
    });

    test('should get tasks with options', async () => {
      const options = { limit: 10, offset: 0, orderBy: 'title', order: 'ASC' };
      mockTaskRepository.findByUserId.mockResolvedValueOnce(mockTasks);

      const result = await service.getAllForUser(userId, {}, options);

      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId, {}, options);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getByIdForUser', () => {
    const userId = 10;
    const taskId = 1;

    test('should get task by ID for user', async () => {
      const mockTask = new Task({
        id: taskId,
        user_id: userId,
        title: 'Test Task',
        status: 'pending',
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockTaskRepository.findByIdAndUserId.mockResolvedValueOnce(mockTask);

      const result = await service.getByIdForUser(taskId, userId);

      expect(mockTaskRepository.findByIdAndUserId).toHaveBeenCalledWith(taskId, userId);
      expect(result).toEqual(mockTask);
    });

    test('should throw NotFoundError when task not found', async () => {
      mockTaskRepository.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(service.getByIdForUser(999, userId)).rejects.toThrow(NotFoundError);
      await expect(service.getByIdForUser(999, userId)).rejects.toThrow('Task with ID 999 not found');
    });
  });

  describe('getByProjectId', () => {
    const userId = 10;
    const projectId = 5;

    test('should get all tasks for a project', async () => {
      const mockTasks = [
        new Task({
          id: 1,
          user_id: userId,
          project_id: projectId,
          title: 'Task 1',
          status: 'pending',
          priority: 'high',
          created_at: new Date(),
          updated_at: new Date()
        })
      ];

      mockTaskRepository.findByProjectId.mockResolvedValueOnce(mockTasks);

      const result = await service.getByProjectId(projectId, userId);

      expect(mockTaskRepository.findByProjectId).toHaveBeenCalledWith(projectId, userId);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getByStatus', () => {
    const userId = 10;

    test('should get tasks by status', async () => {
      const mockTasks = [
        new Task({
          id: 1,
          user_id: userId,
          title: 'Pending Task',
          status: 'pending',
          priority: 'high',
          created_at: new Date(),
          updated_at: new Date()
        })
      ];

      mockTaskRepository.findByStatus.mockResolvedValueOnce(mockTasks);

      const result = await service.getByStatus('pending', userId);

      expect(mockTaskRepository.findByStatus).toHaveBeenCalledWith('pending', userId);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getByPriority', () => {
    const userId = 10;

    test('should get tasks by priority', async () => {
      const mockTasks = [
        new Task({
          id: 1,
          user_id: userId,
          title: 'High Priority Task',
          status: 'pending',
          priority: 'high',
          created_at: new Date(),
          updated_at: new Date()
        })
      ];

      mockTaskRepository.findByPriority.mockResolvedValueOnce(mockTasks);

      const result = await service.getByPriority('high', userId);

      expect(mockTaskRepository.findByPriority).toHaveBeenCalledWith('high', userId);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getOverdue', () => {
    const userId = 10;

    test('should get overdue tasks', async () => {
      const mockTasks = [
        new Task({
          id: 1,
          user_id: userId,
          title: 'Overdue Task',
          status: 'pending',
          priority: 'high',
          due_date: '2023-01-01',
          created_at: new Date(),
          updated_at: new Date()
        })
      ];

      mockTaskRepository.findOverdue.mockResolvedValueOnce(mockTasks);

      const result = await service.getOverdue(userId);

      expect(mockTaskRepository.findOverdue).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getDueSoon', () => {
    const userId = 10;

    test('should get tasks due soon with default days', async () => {
      const mockTasks = [
        new Task({
          id: 1,
          user_id: userId,
          title: 'Due Soon Task',
          status: 'pending',
          priority: 'high',
          due_date: '2024-12-31',
          created_at: new Date(),
          updated_at: new Date()
        })
      ];

      mockTaskRepository.findDueSoon.mockResolvedValueOnce(mockTasks);

      const result = await service.getDueSoon(userId);

      expect(mockTaskRepository.findDueSoon).toHaveBeenCalledWith(userId, 7);
      expect(result).toEqual(mockTasks);
    });

    test('should get tasks due soon with custom days', async () => {
      mockTaskRepository.findDueSoon.mockResolvedValueOnce([]);

      await service.getDueSoon(userId, 14);

      expect(mockTaskRepository.findDueSoon).toHaveBeenCalledWith(userId, 14);
    });
  });

  describe('createForUser', () => {
    const userId = 10;

    test('should create a valid task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Test description',
        project_id: 5,
        status: 'pending',
        priority: 'medium',
        due_date: '2024-12-31'
      };

      const mockCreatedTask = new Task({
        id: 1,
        user_id: userId,
        ...taskData,
        created_at: new Date(),
        updated_at: new Date()
      });

      mockProjectRepository.exists.mockResolvedValueOnce(true);
      mockTaskRepository.create.mockResolvedValueOnce(mockCreatedTask);

      const result = await service.createForUser(taskData, userId);

      expect(mockProjectRepository.exists).toHaveBeenCalledWith(5);
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...taskData,
        user_id: userId
      });
      expect(result).toEqual(mockCreatedTask);
    });

    test('should create task without optional fields', async () => {
      const taskData = { title: 'Minimal Task' };

      const mockCreatedTask = new Task({
        id: 1,
        user_id: userId,
        title: 'Minimal Task',
        status: 'pending',
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockTaskRepository.create.mockResolvedValueOnce(mockCreatedTask);

      const result = await service.createForUser(taskData, userId);

      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        title: 'Minimal Task',
        user_id: userId
      });
      expect(result).toEqual(mockCreatedTask);
    });

    test('should throw ValidationError when title is missing', async () => {
      const taskData = { description: 'Test' };

      await expect(service.createForUser(taskData, userId)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(taskData, userId)).rejects.toThrow('Task title is required');
      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when title is empty', async () => {
      const taskData = { title: '   ' };

      await expect(service.createForUser(taskData, userId)).rejects.toThrow(ValidationError);
      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when title is too long', async () => {
      const taskData = { title: 'a'.repeat(256) };

      await expect(service.createForUser(taskData, userId)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(taskData, userId)).rejects.toThrow('Task title must be 255 characters or less');
    });

    test('should throw ValidationError for invalid status', async () => {
      const taskData = {
        title: 'Test Task',
        status: 'invalid-status'
      };

      await expect(service.createForUser(taskData, userId)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(taskData, userId)).rejects.toThrow('Status must be one of');
    });

    test('should throw ValidationError for invalid priority', async () => {
      const taskData = {
        title: 'Test Task',
        priority: 'invalid-priority'
      };

      await expect(service.createForUser(taskData, userId)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(taskData, userId)).rejects.toThrow('Priority must be one of');
    });

    test('should throw ValidationError for invalid due date format', async () => {
      const taskData = {
        title: 'Test Task',
        due_date: 'invalid-date'
      };

      await expect(service.createForUser(taskData, userId)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(taskData, userId)).rejects.toThrow('Invalid due date format');
    });

    test('should throw ValidationError when project does not exist', async () => {
      const taskData = {
        title: 'Test Task',
        project_id: 999
      };

      mockProjectRepository.exists.mockResolvedValueOnce(false);

      await expect(service.createForUser(taskData, userId)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(taskData, userId)).rejects.toThrow('Project with ID 999 not found');
      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });

    test('should skip project validation when projectRepository is not available', async () => {
      const serviceWithoutProject = new TaskService(mockTaskRepository);
      const taskData = {
        title: 'Test Task',
        project_id: 999
      };

      const mockCreatedTask = new Task({
        id: 1,
        user_id: userId,
        ...taskData,
        created_at: new Date(),
        updated_at: new Date()
      });

      mockTaskRepository.create.mockResolvedValueOnce(mockCreatedTask);

      const result = await serviceWithoutProject.createForUser(taskData, userId);

      expect(result).toEqual(mockCreatedTask);
    });
  });

  describe('updateForUser', () => {
    const userId = 10;
    const taskId = 1;

    test('should update a task', async () => {
      const existingTask = new Task({
        id: taskId,
        user_id: userId,
        title: 'Old Title',
        status: 'pending',
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date()
      });

      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
        status: 'in-progress'
      };

      const mockUpdatedTask = new Task({
        id: taskId,
        user_id: userId,
        ...updateData,
        priority: 'medium',
        created_at: existingTask.createdAt,
        updated_at: new Date()
      });

      mockTaskRepository.findByIdAndUserId.mockResolvedValueOnce(existingTask);
      mockTaskRepository.update.mockResolvedValueOnce(mockUpdatedTask);

      const result = await service.updateForUser(taskId, updateData, userId);

      expect(mockTaskRepository.findByIdAndUserId).toHaveBeenCalledWith(taskId, userId);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, updateData);
      expect(result).toEqual(mockUpdatedTask);
    });

    test('should throw NotFoundError when task does not exist', async () => {
      mockTaskRepository.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(service.updateForUser(999, { title: 'Test' }, userId)).rejects.toThrow(NotFoundError);
      await expect(service.updateForUser(999, { title: 'Test' }, userId)).rejects.toThrow('Task with ID 999 not found');
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when title is empty', async () => {
      const existingTask = new Task({
        id: taskId,
        user_id: userId,
        title: 'Old Title',
        status: 'pending',
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockTaskRepository.findByIdAndUserId.mockResolvedValue(existingTask);

      await expect(service.updateForUser(taskId, { title: '   ' }, userId)).rejects.toThrow(ValidationError);
      await expect(service.updateForUser(taskId, { title: '   ' }, userId)).rejects.toThrow('Task title cannot be empty');
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    test('should throw ValidationError for invalid status', async () => {
      const existingTask = new Task({
        id: taskId,
        user_id: userId,
        title: 'Test Task',
        status: 'pending',
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockTaskRepository.findByIdAndUserId.mockResolvedValue(existingTask);

      await expect(
        service.updateForUser(taskId, { status: 'invalid-status' }, userId)
      ).rejects.toThrow(ValidationError);
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    test('should throw ValidationError for invalid status transition', async () => {
      const existingTask = new Task({
        id: taskId,
        user_id: userId,
        title: 'Test Task',
        status: 'done',
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockTaskRepository.findByIdAndUserId.mockResolvedValue(existingTask);

      await expect(
        service.updateForUser(taskId, { status: 'pending' }, userId)
      ).rejects.toThrow(ValidationError);
      await expect(
        service.updateForUser(taskId, { status: 'pending' }, userId)
      ).rejects.toThrow('Cannot transition from done to pending');
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when project does not exist', async () => {
      const existingTask = new Task({
        id: taskId,
        user_id: userId,
        title: 'Test Task',
        status: 'pending',
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockTaskRepository.findByIdAndUserId.mockResolvedValue(existingTask);
      mockProjectRepository.exists.mockResolvedValue(false);

      await expect(
        service.updateForUser(taskId, { project_id: 999 }, userId)
      ).rejects.toThrow(ValidationError);
      await expect(
        service.updateForUser(taskId, { project_id: 999 }, userId)
      ).rejects.toThrow('Project with ID 999 not found');
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteForUser', () => {
    const userId = 10;
    const taskId = 1;

    test('should delete an existing task', async () => {
      const existingTask = new Task({
        id: taskId,
        user_id: userId,
        title: 'Test Task',
        status: 'pending',
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date()
      });

      mockTaskRepository.findByIdAndUserId.mockResolvedValueOnce(existingTask);
      mockTaskRepository.delete.mockResolvedValueOnce(true);

      const result = await service.deleteForUser(taskId, userId);

      expect(mockTaskRepository.findByIdAndUserId).toHaveBeenCalledWith(taskId, userId);
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
      expect(result).toBe(true);
    });

    test('should throw NotFoundError when task does not exist', async () => {
      mockTaskRepository.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(service.deleteForUser(999, userId)).rejects.toThrow(NotFoundError);
      await expect(service.deleteForUser(999, userId)).rejects.toThrow('Task with ID 999 not found');
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getStatusCounts', () => {
    const userId = 10;

    test('should get status counts', async () => {
      const mockCounts = {
        pending: 5,
        'in-progress': 3,
        done: 2,
        completed: 1,
        cancelled: 0
      };

      mockTaskRepository.countByStatus.mockResolvedValueOnce(mockCounts);

      const result = await service.getStatusCounts(userId);

      expect(mockTaskRepository.countByStatus).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockCounts);
    });
  });

  describe('getPriorityCounts', () => {
    const userId = 10;

    test('should get priority counts', async () => {
      const mockCounts = {
        low: 2,
        medium: 5,
        high: 3,
        urgent: 1
      };

      mockTaskRepository.countByPriority.mockResolvedValueOnce(mockCounts);

      const result = await service.getPriorityCounts(userId);

      expect(mockTaskRepository.countByPriority).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockCounts);
    });
  });

  describe('search', () => {
    const userId = 10;

    test('should search tasks', async () => {
      const mockTasks = [
        new Task({
          id: 1,
          user_id: userId,
          title: 'Test Task',
          description: 'Test description',
          status: 'pending',
          priority: 'medium',
          created_at: new Date(),
          updated_at: new Date()
        })
      ];

      mockTaskRepository.search.mockResolvedValueOnce(mockTasks);

      const result = await service.search('Test', userId);

      expect(mockTaskRepository.search).toHaveBeenCalledWith('Test', userId);
      expect(result).toEqual(mockTasks);
    });

    test('should throw ValidationError when search term is empty', async () => {
      await expect(service.search('', userId)).rejects.toThrow(ValidationError);
      await expect(service.search('', userId)).rejects.toThrow('Search term is required');
      expect(mockTaskRepository.search).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when search term is whitespace', async () => {
      await expect(service.search('   ', userId)).rejects.toThrow(ValidationError);
      expect(mockTaskRepository.search).not.toHaveBeenCalled();
    });
  });

  describe('Error Propagation', () => {
    const userId = 10;

    test('should propagate repository errors on getAllForUser', async () => {
      const error = new Error('Database connection failed');
      mockTaskRepository.findByUserId.mockRejectedValueOnce(error);

      await expect(service.getAllForUser(userId)).rejects.toThrow('Database connection failed');
    });

    test('should propagate repository errors on getByIdForUser', async () => {
      const error = new Error('Database connection failed');
      mockTaskRepository.findByIdAndUserId.mockRejectedValueOnce(error);

      await expect(service.getByIdForUser(1, userId)).rejects.toThrow('Database connection failed');
    });

    test('should propagate repository errors on create', async () => {
      const error = new Error('Database connection failed');
      mockTaskRepository.create.mockRejectedValueOnce(error);

      await expect(
        service.createForUser({ title: 'Test Task' }, userId)
      ).rejects.toThrow('Database connection failed');
    });

    test('should propagate repository errors on update', async () => {
      const existingTask = new Task({
        id: 1,
        user_id: userId,
        title: 'Test Task',
        status: 'pending',
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date()
      });

      const error = new Error('Database connection failed');
      mockTaskRepository.findByIdAndUserId.mockResolvedValueOnce(existingTask);
      mockTaskRepository.update.mockRejectedValueOnce(error);

      await expect(
        service.updateForUser(1, { title: 'Updated' }, userId)
      ).rejects.toThrow('Database connection failed');
    });

    test('should propagate repository errors on delete', async () => {
      const existingTask = new Task({
        id: 1,
        user_id: userId,
        title: 'Test Task',
        status: 'pending',
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date()
      });

      const error = new Error('Database connection failed');
      mockTaskRepository.findByIdAndUserId.mockResolvedValueOnce(existingTask);
      mockTaskRepository.delete.mockRejectedValueOnce(error);

      await expect(service.deleteForUser(1, userId)).rejects.toThrow('Database connection failed');
    });
  });
});
