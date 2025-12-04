const TaskRepository = require('./TaskRepository');
const Task = require('../models/Task');

describe('TaskRepository', () => {
  let repository;
  let mockDatabase;

  beforeEach(() => {
    mockDatabase = {
      queryOne: jest.fn(),
      queryMany: jest.fn(),
      execute: jest.fn(),
      query: jest.fn()
    };
    repository = new TaskRepository(mockDatabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should create repository with correct table name', () => {
      expect(repository.tableName).toBe('tasks');
      expect(repository.db).toBe(mockDatabase);
    });
  });

  describe('CRUD Operations', () => {
    describe('create', () => {
      test('should create a new task', async () => {
        const taskData = {
          userId: 10,
          projectId: 5,
          title: 'Test Task',
          description: 'Test description',
          status: 'pending',
          priority: 'medium',
          dueDate: '2024-12-31'
        };

        const mockRow = {
          id: 1,
          user_id: 10,
          project_id: 5,
          title: 'Test Task',
          description: 'Test description',
          status: 'pending',
          priority: 'medium',
          due_date: '2024-12-31',
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
        const result = await repository.create(taskData);

        expect(mockDatabase.queryOne).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Task);
        expect(result.title).toBe('Test Task');
        expect(result.status).toBe('pending');
      });
    });

    describe('update', () => {
      test('should update a task', async () => {
        const updateData = {
          title: 'Updated Task',
          description: 'Updated description',
          status: 'done'
        };

        const mockRow = {
          id: 1,
          user_id: 10,
          project_id: 5,
          title: 'Updated Task',
          description: 'Updated description',
          status: 'done',
          priority: 'medium',
          due_date: '2024-12-31',
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
        const result = await repository.update(1, updateData);

        expect(mockDatabase.queryOne).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Task);
        expect(result.title).toBe('Updated Task');
        expect(result.status).toBe('done');
      });

      test('should return null when updating non-existent task', async () => {
        mockDatabase.queryOne.mockResolvedValueOnce(null);
        const result = await repository.update(999, { title: 'Test' });
        expect(result).toBeNull();
      });
    });
  });

  describe('Query Operations', () => {
    describe('findByUserId', () => {
      test('should find all tasks for a user', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            project_id: 5,
            title: 'Task 1',
            description: 'Description 1',
            status: 'pending',
            priority: 'high',
            due_date: '2024-12-31',
            created_at: new Date(),
            updated_at: new Date(),
            project_name: 'Project A',
            client_id: 1
          },
          {
            id: 2,
            user_id: 10,
            project_id: 6,
            title: 'Task 2',
            description: 'Description 2',
            status: 'done',
            priority: 'low',
            due_date: '2024-06-30',
            created_at: new Date(),
            updated_at: new Date(),
            project_name: 'Project B',
            client_id: 2
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findByUserId(10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('SELECT t.*, p.name as project_name, p.client_id'),
          [10]
        );
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(Task);
        expect(result[0].projectName).toBe('Project A');
      });

      test('should filter tasks by project ID', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, { projectId: 5 });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND t.project_id = $2'),
          [10, 5]
        );
      });

      test('should filter tasks by status', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, { status: 'pending' });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND t.status = $2'),
          [10, 'pending']
        );
      });

      test('should filter tasks by priority', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, { priority: 'high' });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND t.priority = $2'),
          [10, 'high']
        );
      });

      test('should filter tasks by client ID', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, { clientId: 5 });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND p.client_id = $2'),
          [10, 5]
        );
      });

      test('should filter by multiple criteria', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, { projectId: 5, status: 'pending', priority: 'high' });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND t.project_id = $2'),
          [10, 5, 'pending', 'high']
        );
      });

      test('should support pagination with limit and offset', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, {}, { limit: 10, offset: 20 });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('LIMIT'),
          [10, 10, 20]
        );
      });

      test('should support custom ordering', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, {}, { orderBy: 'title', order: 'DESC' });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('ORDER BY t.title DESC'),
          [10]
        );
      });
    });

    describe('findByIdAndUserId', () => {
      test('should find task by ID and user ID', async () => {
        const mockRow = {
          id: 1,
          user_id: 10,
          project_id: 5,
          title: 'Test Task',
          description: 'Test description',
          status: 'pending',
          priority: 'medium',
          due_date: '2024-12-31',
          created_at: new Date(),
          updated_at: new Date(),
          project_name: 'Project A',
          client_id: 1
        };

        mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
        const result = await repository.findByIdAndUserId(1, 10);

        expect(mockDatabase.queryOne).toHaveBeenCalledWith(
          expect.stringContaining('WHERE t.id = $1 AND t.user_id = $2'),
          [1, 10]
        );
        expect(result).toBeInstanceOf(Task);
        expect(result.id).toBe(1);
        expect(result.projectName).toBe('Project A');
      });

      test('should return null when task not found', async () => {
        mockDatabase.queryOne.mockResolvedValueOnce(null);
        const result = await repository.findByIdAndUserId(999, 10);
        expect(result).toBeNull();
      });
    });

    describe('findByProjectId', () => {
      test('should find all tasks for a specific project', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            project_id: 5,
            title: 'Task 1',
            description: 'Description 1',
            status: 'pending',
            priority: 'high',
            due_date: '2024-12-31',
            created_at: new Date(),
            updated_at: new Date(),
            project_name: 'Project A',
            client_id: 1
          },
          {
            id: 2,
            user_id: 10,
            project_id: 5,
            title: 'Task 2',
            description: 'Description 2',
            status: 'done',
            priority: 'low',
            due_date: '2024-06-30',
            created_at: new Date(),
            updated_at: new Date(),
            project_name: 'Project A',
            client_id: 1
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findByProjectId(5, 10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('WHERE t.project_id = $1 AND t.user_id = $2'),
          [5, 10]
        );
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(Task);
        expect(result[0].projectId).toBe(5);
      });

      test('should return empty array when no tasks found', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        const result = await repository.findByProjectId(999, 10);
        expect(result).toEqual([]);
      });
    });

    describe('findByStatus', () => {
      test('should find all tasks with specific status', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            project_id: 5,
            title: 'Pending Task 1',
            description: 'Description 1',
            status: 'pending',
            priority: 'high',
            due_date: '2024-12-31',
            created_at: new Date(),
            updated_at: new Date(),
            project_name: 'Project A',
            client_id: 1
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findByStatus('pending', 10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('WHERE t.status = $1 AND t.user_id = $2'),
          ['pending', 10]
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Task);
        expect(result[0].status).toBe('pending');
      });

      test('should return empty array when no tasks with status found', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        const result = await repository.findByStatus('cancelled', 10);
        expect(result).toEqual([]);
      });
    });

    describe('findByPriority', () => {
      test('should find all tasks with specific priority', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            project_id: 5,
            title: 'High Priority Task',
            description: 'Description',
            status: 'pending',
            priority: 'high',
            due_date: '2024-12-31',
            created_at: new Date(),
            updated_at: new Date(),
            project_name: 'Project A',
            client_id: 1
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findByPriority('high', 10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('WHERE t.priority = $1 AND t.user_id = $2'),
          ['high', 10]
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Task);
        expect(result[0].priority).toBe('high');
      });
    });

    describe('findOverdue', () => {
      test('should find overdue tasks', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            project_id: 5,
            title: 'Overdue Task',
            description: 'Description',
            status: 'pending',
            priority: 'high',
            due_date: '2023-01-01',
            created_at: new Date(),
            updated_at: new Date(),
            project_name: 'Project A',
            client_id: 1
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findOverdue(10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('t.due_date < NOW()'),
          [10]
        );
        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining("t.status NOT IN ('done', 'completed', 'cancelled')"),
          [10]
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Task);
      });

      test('should return empty array when no overdue tasks', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        const result = await repository.findOverdue(10);
        expect(result).toEqual([]);
      });
    });

    describe('findDueSoon', () => {
      test('should find tasks due soon with default days', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            project_id: 5,
            title: 'Due Soon Task',
            description: 'Description',
            status: 'pending',
            priority: 'high',
            due_date: '2024-12-31',
            created_at: new Date(),
            updated_at: new Date(),
            project_name: 'Project A',
            client_id: 1
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findDueSoon(10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining("INTERVAL '7 days'"),
          [10]
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Task);
      });

      test('should find tasks due soon with custom days', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findDueSoon(10, 14);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining("INTERVAL '14 days'"),
          [10]
        );
      });
    });

    describe('countByStatus', () => {
      test('should count tasks by status', async () => {
        const mockRows = [
          { status: 'pending', count: '5' },
          { status: 'in-progress', count: '3' },
          { status: 'done', count: '2' }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.countByStatus(10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('GROUP BY status'),
          [10]
        );
        expect(result).toEqual({
          pending: 5,
          'in-progress': 3,
          done: 2,
          completed: 0,
          cancelled: 0
        });
      });

      test('should return zero counts when no tasks', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        const result = await repository.countByStatus(10);

        expect(result).toEqual({
          pending: 0,
          'in-progress': 0,
          done: 0,
          completed: 0,
          cancelled: 0
        });
      });
    });

    describe('countByPriority', () => {
      test('should count tasks by priority', async () => {
        const mockRows = [
          { priority: 'high', count: '5' },
          { priority: 'medium', count: '3' },
          { priority: 'low', count: '2' }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.countByPriority(10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('GROUP BY priority'),
          [10]
        );
        expect(result).toEqual({
          low: 2,
          medium: 3,
          high: 5,
          urgent: 0
        });
      });

      test('should return zero counts when no tasks', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        const result = await repository.countByPriority(10);

        expect(result).toEqual({
          low: 0,
          medium: 0,
          high: 0,
          urgent: 0
        });
      });
    });

    describe('search', () => {
      test('should search tasks by title', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            project_id: 5,
            title: 'Test Task',
            description: 'Description',
            status: 'pending',
            priority: 'medium',
            due_date: '2024-12-31',
            created_at: new Date(),
            updated_at: new Date(),
            project_name: 'Project A',
            client_id: 1
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.search('Test', 10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('t.title ILIKE $2'),
          [10, '%Test%']
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Task);
      });

      test('should search tasks by description', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.search('description', 10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('t.description ILIKE $2'),
          [10, '%description%']
        );
      });

      test('should return empty array when no matches found', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        const result = await repository.search('nonexistent', 10);
        expect(result).toEqual([]);
      });
    });
  });

  describe('Relationship Handling', () => {
    test('should include project name in query results', async () => {
      const mockRow = {
        id: 1,
        user_id: 10,
        project_id: 5,
        title: 'Test Task',
        description: 'Test description',
        status: 'pending',
        priority: 'medium',
        due_date: '2024-12-31',
        created_at: new Date(),
        updated_at: new Date(),
        project_name: 'Test Project',
        client_id: 1
      };

      mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
      const result = await repository.findByIdAndUserId(1, 10);

      expect(result.projectName).toBe('Test Project');
    });

    test('should handle null project name gracefully', async () => {
      const mockRow = {
        id: 1,
        user_id: 10,
        project_id: null,
        title: 'Test Task',
        description: 'Test description',
        status: 'pending',
        priority: 'medium',
        due_date: '2024-12-31',
        created_at: new Date(),
        updated_at: new Date(),
        project_name: null,
        client_id: null
      };

      mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
      const result = await repository.findByIdAndUserId(1, 10);

      expect(result.projectName).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('should propagate database errors on create', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryOne.mockRejectedValueOnce(error);

      await expect(
        repository.create({ userId: 10, title: 'Test' })
      ).rejects.toThrow('Database connection failed');
    });

    test('should propagate database errors on update', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryOne.mockRejectedValueOnce(error);

      await expect(
        repository.update(1, { title: 'Test' })
      ).rejects.toThrow('Database connection failed');
    });

    test('should propagate database errors on findByUserId', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryMany.mockRejectedValueOnce(error);

      await expect(repository.findByUserId(10)).rejects.toThrow(
        'Database connection failed'
      );
    });

    test('should propagate database errors on findByProjectId', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryMany.mockRejectedValueOnce(error);

      await expect(repository.findByProjectId(5, 10)).rejects.toThrow(
        'Database connection failed'
      );
    });

    test('should propagate database errors on search', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryMany.mockRejectedValueOnce(error);

      await expect(repository.search('Test', 10)).rejects.toThrow(
        'Database connection failed'
      );
    });

    test('should propagate database errors on countByStatus', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryMany.mockRejectedValueOnce(error);

      await expect(repository.countByStatus(10)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
