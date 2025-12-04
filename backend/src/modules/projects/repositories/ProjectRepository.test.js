const ProjectRepository = require('./ProjectRepository');
const Project = require('../models/Project');

describe('ProjectRepository', () => {
  let repository;
  let mockDatabase;

  beforeEach(() => {
    mockDatabase = {
      queryOne: jest.fn(),
      queryMany: jest.fn(),
      execute: jest.fn(),
      query: jest.fn()
    };
    repository = new ProjectRepository(mockDatabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should create repository with correct table name', () => {
      expect(repository.tableName).toBe('projects');
      expect(repository.db).toBe(mockDatabase);
    });
  });

  describe('CRUD Operations', () => {
    describe('create', () => {
      test('should create a new project', async () => {
        const projectData = {
          userId: 10,
          clientId: 5,
          name: 'Test Project',
          description: 'Test description',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        };

        const mockRow = {
          id: 1,
          user_id: 10,
          client_id: 5,
          name: 'Test Project',
          description: 'Test description',
          status: 'active',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
        const result = await repository.create(projectData);

        expect(mockDatabase.queryOne).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Project);
        expect(result.name).toBe('Test Project');
        expect(result.status).toBe('active');
      });
    });

    describe('update', () => {
      test('should update a project', async () => {
        const updateData = {
          name: 'Updated Project',
          description: 'Updated description',
          status: 'completed'
        };

        const mockRow = {
          id: 1,
          user_id: 10,
          client_id: 5,
          name: 'Updated Project',
          description: 'Updated description',
          status: 'completed',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
        const result = await repository.update(1, updateData);

        expect(mockDatabase.queryOne).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Project);
        expect(result.name).toBe('Updated Project');
        expect(result.status).toBe('completed');
      });

      test('should return null when updating non-existent project', async () => {
        mockDatabase.queryOne.mockResolvedValueOnce(null);
        const result = await repository.update(999, { name: 'Test' });
        expect(result).toBeNull();
      });
    });
  });

  describe('Query Operations', () => {
    describe('findByUserId', () => {
      test('should find all projects for a user', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            client_id: 5,
            name: 'Project 1',
            description: 'Description 1',
            status: 'active',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            created_at: new Date(),
            updated_at: new Date(),
            client_name: 'Client A'
          },
          {
            id: 2,
            user_id: 10,
            client_id: 6,
            name: 'Project 2',
            description: 'Description 2',
            status: 'completed',
            start_date: '2024-01-01',
            end_date: '2024-06-30',
            created_at: new Date(),
            updated_at: new Date(),
            client_name: 'Client B'
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findByUserId(10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('SELECT p.*, c.name as client_name'),
          [10]
        );
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(Project);
        expect(result[0].clientName).toBe('Client A');
      });

      test('should filter projects by client ID', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, { clientId: 5 });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND p.client_id = $2'),
          [10, 5]
        );
      });

      test('should filter projects by status', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, { status: 'active' });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND p.status = $2'),
          [10, 'active']
        );
      });

      test('should filter by both client ID and status', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, { clientId: 5, status: 'active' });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND p.client_id = $2'),
          [10, 5, 'active']
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
        await repository.findByUserId(10, {}, { orderBy: 'name', order: 'ASC' });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('ORDER BY p.name ASC'),
          [10]
        );
      });
    });

    describe('findByIdAndUserId', () => {
      test('should find project by ID and user ID', async () => {
        const mockRow = {
          id: 1,
          user_id: 10,
          client_id: 5,
          name: 'Test Project',
          description: 'Test description',
          status: 'active',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          created_at: new Date(),
          updated_at: new Date(),
          client_name: 'Client A'
        };

        mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
        const result = await repository.findByIdAndUserId(1, 10);

        expect(mockDatabase.queryOne).toHaveBeenCalledWith(
          expect.stringContaining('WHERE p.id = $1 AND p.user_id = $2'),
          [1, 10]
        );
        expect(result).toBeInstanceOf(Project);
        expect(result.id).toBe(1);
        expect(result.clientName).toBe('Client A');
      });

      test('should return null when project not found', async () => {
        mockDatabase.queryOne.mockResolvedValueOnce(null);
        const result = await repository.findByIdAndUserId(999, 10);
        expect(result).toBeNull();
      });
    });

    describe('findByClientId', () => {
      test('should find all projects for a specific client', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            client_id: 5,
            name: 'Project 1',
            description: 'Description 1',
            status: 'active',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            created_at: new Date(),
            updated_at: new Date(),
            client_name: 'Client A'
          },
          {
            id: 2,
            user_id: 10,
            client_id: 5,
            name: 'Project 2',
            description: 'Description 2',
            status: 'completed',
            start_date: '2024-01-01',
            end_date: '2024-06-30',
            created_at: new Date(),
            updated_at: new Date(),
            client_name: 'Client A'
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findByClientId(5, 10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('WHERE p.client_id = $1 AND p.user_id = $2'),
          [5, 10]
        );
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(Project);
        expect(result[0].clientId).toBe(5);
      });

      test('should return empty array when no projects found', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        const result = await repository.findByClientId(999, 10);
        expect(result).toEqual([]);
      });
    });

    describe('findByStatus', () => {
      test('should find all projects with specific status', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            client_id: 5,
            name: 'Active Project 1',
            description: 'Description 1',
            status: 'active',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            created_at: new Date(),
            updated_at: new Date(),
            client_name: 'Client A'
          },
          {
            id: 2,
            user_id: 10,
            client_id: 6,
            name: 'Active Project 2',
            description: 'Description 2',
            status: 'active',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            created_at: new Date(),
            updated_at: new Date(),
            client_name: 'Client B'
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findByStatus('active', 10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('WHERE p.status = $1 AND p.user_id = $2'),
          ['active', 10]
        );
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(Project);
        expect(result[0].status).toBe('active');
      });

      test('should return empty array when no projects with status found', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        const result = await repository.findByStatus('cancelled', 10);
        expect(result).toEqual([]);
      });
    });

    describe('findOverdue', () => {
      test('should find overdue projects', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            client_id: 5,
            name: 'Overdue Project',
            description: 'Description',
            status: 'active',
            start_date: '2023-01-01',
            end_date: '2023-12-31',
            created_at: new Date(),
            updated_at: new Date(),
            client_name: 'Client A'
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findOverdue(10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('p.end_date < NOW()'),
          [10]
        );
        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining("p.status != 'completed'"),
          [10]
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Project);
      });

      test('should return empty array when no overdue projects', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        const result = await repository.findOverdue(10);
        expect(result).toEqual([]);
      });
    });

    describe('countByStatus', () => {
      test('should count projects by status', async () => {
        const mockRows = [
          { status: 'active', count: '5' },
          { status: 'completed', count: '3' },
          { status: 'on-hold', count: '2' }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.countByStatus(10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('GROUP BY status'),
          [10]
        );
        expect(result).toEqual({
          active: 5,
          completed: 3,
          'on-hold': 2,
          cancelled: 0
        });
      });

      test('should return zero counts when no projects', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        const result = await repository.countByStatus(10);

        expect(result).toEqual({
          active: 0,
          completed: 0,
          'on-hold': 0,
          cancelled: 0
        });
      });
    });

    describe('search', () => {
      test('should search projects by name', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            client_id: 5,
            name: 'Test Project',
            description: 'Description',
            status: 'active',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            created_at: new Date(),
            updated_at: new Date(),
            client_name: 'Client A'
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.search('Test', 10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('p.name ILIKE $2'),
          [10, '%Test%']
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Project);
      });

      test('should search projects by description', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.search('description', 10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('p.description ILIKE $2'),
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
    test('should include client name in query results', async () => {
      const mockRow = {
        id: 1,
        user_id: 10,
        client_id: 5,
        name: 'Test Project',
        description: 'Test description',
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        created_at: new Date(),
        updated_at: new Date(),
        client_name: 'Test Client'
      };

      mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
      const result = await repository.findByIdAndUserId(1, 10);

      expect(result.clientName).toBe('Test Client');
    });

    test('should handle null client name gracefully', async () => {
      const mockRow = {
        id: 1,
        user_id: 10,
        client_id: null,
        name: 'Test Project',
        description: 'Test description',
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        created_at: new Date(),
        updated_at: new Date(),
        client_name: null
      };

      mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
      const result = await repository.findByIdAndUserId(1, 10);

      expect(result.clientName).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('should propagate database errors on create', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryOne.mockRejectedValueOnce(error);

      await expect(
        repository.create({ userId: 10, name: 'Test' })
      ).rejects.toThrow('Database connection failed');
    });

    test('should propagate database errors on update', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryOne.mockRejectedValueOnce(error);

      await expect(
        repository.update(1, { name: 'Test' })
      ).rejects.toThrow('Database connection failed');
    });

    test('should propagate database errors on findByUserId', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryMany.mockRejectedValueOnce(error);

      await expect(repository.findByUserId(10)).rejects.toThrow(
        'Database connection failed'
      );
    });

    test('should propagate database errors on findByClientId', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryMany.mockRejectedValueOnce(error);

      await expect(repository.findByClientId(5, 10)).rejects.toThrow(
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
