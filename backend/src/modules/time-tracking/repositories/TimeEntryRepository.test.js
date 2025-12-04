const TimeEntryRepository = require('./TimeEntryRepository');
const TimeEntry = require('../models/TimeEntry');

describe('TimeEntryRepository', () => {
  let repository;
  let mockDatabase;

  beforeEach(() => {
    mockDatabase = {
      queryOne: jest.fn(),
      queryMany: jest.fn(),
      execute: jest.fn(),
      query: jest.fn()
    };
    repository = new TimeEntryRepository(mockDatabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should create repository with correct table name', () => {
      expect(repository.tableName).toBe('time_entries');
      expect(repository.db).toBe(mockDatabase);
    });
  });

  describe('CRUD Operations', () => {
    describe('create', () => {
      test('should create a new time entry', async () => {
        const timeEntryData = {
          userId: 10,
          taskId: 5,
          projectId: 3,
          description: 'Working on feature',
          startTime: new Date('2024-01-01T09:00:00'),
          isBillable: true
        };

        const mockRow = {
          id: 1,
          user_id: 10,
          task_id: 5,
          project_id: 3,
          description: 'Working on feature',
          start_time: new Date('2024-01-01T09:00:00'),
          end_time: null,
          duration: null,
          is_billable: true,
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
        const result = await repository.create(timeEntryData);

        expect(mockDatabase.queryOne).toHaveBeenCalled();
        expect(result).toBeInstanceOf(TimeEntry);
        expect(result.description).toBe('Working on feature');
        expect(result.isBillable).toBe(true);
      });
    });

    describe('update', () => {
      test('should update a time entry', async () => {
        const updateData = {
          description: 'Updated description',
          isBillable: false
        };

        const mockRow = {
          id: 1,
          user_id: 10,
          task_id: 5,
          project_id: 3,
          description: 'Updated description',
          start_time: new Date('2024-01-01T09:00:00'),
          end_time: null,
          duration: null,
          is_billable: false,
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
        const result = await repository.update(1, updateData);

        expect(mockDatabase.queryOne).toHaveBeenCalled();
        expect(result).toBeInstanceOf(TimeEntry);
        expect(result.description).toBe('Updated description');
        expect(result.isBillable).toBe(false);
      });

      test('should return null when updating non-existent time entry', async () => {
        mockDatabase.queryOne.mockResolvedValueOnce(null);
        const result = await repository.update(999, { description: 'Test' });
        expect(result).toBeNull();
      });
    });
  });

  describe('Query Operations', () => {
    describe('findByUserId', () => {
      test('should find all time entries for a user', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            task_id: 5,
            project_id: 3,
            description: 'Entry 1',
            start_time: new Date('2024-01-01T09:00:00'),
            end_time: new Date('2024-01-01T10:00:00'),
            duration: 60,
            is_billable: true,
            created_at: new Date(),
            updated_at: new Date(),
            task_title: 'Task 1',
            project_name: 'Project A'
          },
          {
            id: 2,
            user_id: 10,
            task_id: 6,
            project_id: 4,
            description: 'Entry 2',
            start_time: new Date('2024-01-02T09:00:00'),
            end_time: new Date('2024-01-02T11:00:00'),
            duration: 120,
            is_billable: false,
            created_at: new Date(),
            updated_at: new Date(),
            task_title: 'Task 2',
            project_name: 'Project B'
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findByUserId(10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('SELECT te.*, '),
          [10]
        );
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(TimeEntry);
        expect(result[0].taskTitle).toBe('Task 1');
        expect(result[0].projectName).toBe('Project A');
      });

      test('should filter time entries by task ID', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, { taskId: 5 });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND te.task_id = $2'),
          [10, 5]
        );
      });

      test('should filter time entries by project ID', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, { projectId: 3 });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND te.project_id = $2'),
          [10, 3]
        );
      });

      test('should filter time entries by date range', async () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');
        
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, { startDate, endDate });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND te.start_time >= $2'),
          [10, startDate, endDate]
        );
        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND te.start_time <= $3'),
          [10, startDate, endDate]
        );
      });

      test('should filter by multiple criteria', async () => {
        const startDate = new Date('2024-01-01');
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, { taskId: 5, projectId: 3, startDate });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND te.task_id = $2'),
          [10, 5, 3, startDate]
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
        await repository.findByUserId(10, {}, { orderBy: 'duration', order: 'ASC' });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('ORDER BY te.duration ASC'),
          [10]
        );
      });
    });

    describe('findByIdAndUserId', () => {
      test('should find time entry by ID and user ID', async () => {
        const mockRow = {
          id: 1,
          user_id: 10,
          task_id: 5,
          project_id: 3,
          description: 'Test entry',
          start_time: new Date('2024-01-01T09:00:00'),
          end_time: new Date('2024-01-01T10:00:00'),
          duration: 60,
          is_billable: true,
          created_at: new Date(),
          updated_at: new Date(),
          task_title: 'Task 1',
          project_name: 'Project A'
        };

        mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
        const result = await repository.findByIdAndUserId(1, 10);

        expect(mockDatabase.queryOne).toHaveBeenCalledWith(
          expect.stringContaining('WHERE te.id = $1 AND te.user_id = $2'),
          [1, 10]
        );
        expect(result).toBeInstanceOf(TimeEntry);
        expect(result.id).toBe(1);
        expect(result.taskTitle).toBe('Task 1');
      });

      test('should return null when time entry not found', async () => {
        mockDatabase.queryOne.mockResolvedValueOnce(null);
        const result = await repository.findByIdAndUserId(999, 10);
        expect(result).toBeNull();
      });
    });

    describe('findByTaskId', () => {
      test('should find all time entries for a specific task', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            task_id: 5,
            project_id: 3,
            description: 'Entry 1',
            start_time: new Date('2024-01-01T09:00:00'),
            end_time: new Date('2024-01-01T10:00:00'),
            duration: 60,
            is_billable: true,
            created_at: new Date(),
            updated_at: new Date(),
            task_title: 'Task 1',
            project_name: 'Project A'
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findByTaskId(5, 10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('WHERE te.task_id = $1 AND te.user_id = $2'),
          [5, 10]
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(TimeEntry);
        expect(result[0].taskId).toBe(5);
      });

      test('should return empty array when no entries found', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        const result = await repository.findByTaskId(999, 10);
        expect(result).toEqual([]);
      });
    });

    describe('findByDateRange', () => {
      test('should find time entries within date range', async () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            task_id: 5,
            project_id: 3,
            description: 'Entry 1',
            start_time: new Date('2024-01-15T09:00:00'),
            end_time: new Date('2024-01-15T10:00:00'),
            duration: 60,
            is_billable: true,
            created_at: new Date(),
            updated_at: new Date(),
            task_title: 'Task 1',
            project_name: 'Project A'
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findByDateRange(10, startDate, endDate);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('te.start_time >= $2'),
          [10, startDate, endDate]
        );
        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('te.start_time <= $3'),
          [10, startDate, endDate]
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(TimeEntry);
      });
    });

    describe('findRunningTimers', () => {
      test('should find currently running timers', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            task_id: 5,
            project_id: 3,
            description: 'Running timer',
            start_time: new Date('2024-01-01T09:00:00'),
            end_time: null,
            duration: null,
            is_billable: true,
            created_at: new Date(),
            updated_at: new Date(),
            task_title: 'Task 1',
            project_name: 'Project A'
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findRunningTimers(10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('te.end_time IS NULL'),
          [10]
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(TimeEntry);
        expect(result[0].endTime).toBeUndefined();
      });

      test('should return empty array when no running timers', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        const result = await repository.findRunningTimers(10);
        expect(result).toEqual([]);
      });
    });

    describe('calculateTotalDuration', () => {
      test('should calculate total duration for user', async () => {
        const mockResult = { total_duration: '480' }; // 8 hours in minutes

        mockDatabase.queryOne.mockResolvedValueOnce(mockResult);
        const result = await repository.calculateTotalDuration(10);

        expect(mockDatabase.queryOne).toHaveBeenCalledWith(
          expect.stringContaining('SUM(duration)'),
          [10]
        );
        expect(result).toBe(480);
      });

      test('should calculate total duration within date range', async () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');
        const mockResult = { total_duration: '240' };

        mockDatabase.queryOne.mockResolvedValueOnce(mockResult);
        const result = await repository.calculateTotalDuration(10, startDate, endDate);

        expect(mockDatabase.queryOne).toHaveBeenCalledWith(
          expect.stringContaining('start_time >= $2'),
          [10, startDate, endDate]
        );
        expect(result).toBe(240);
      });

      test('should return 0 when no entries found', async () => {
        const mockResult = { total_duration: null };

        mockDatabase.queryOne.mockResolvedValueOnce(mockResult);
        const result = await repository.calculateTotalDuration(10);

        expect(result).toBe(0);
      });
    });

    describe('calculateDurationByTask', () => {
      test('should calculate total duration for a task', async () => {
        const mockResult = { total_duration: '120' };

        mockDatabase.queryOne.mockResolvedValueOnce(mockResult);
        const result = await repository.calculateDurationByTask(5, 10);

        expect(mockDatabase.queryOne).toHaveBeenCalledWith(
          expect.stringContaining('WHERE task_id = $1 AND user_id = $2'),
          [5, 10]
        );
        expect(result).toBe(120);
      });

      test('should return 0 when no entries for task', async () => {
        const mockResult = { total_duration: null };

        mockDatabase.queryOne.mockResolvedValueOnce(mockResult);
        const result = await repository.calculateDurationByTask(999, 10);

        expect(result).toBe(0);
      });
    });

    describe('calculateDurationByProject', () => {
      test('should calculate total duration for a project', async () => {
        const mockResult = { total_duration: '360' };

        mockDatabase.queryOne.mockResolvedValueOnce(mockResult);
        const result = await repository.calculateDurationByProject(3, 10);

        expect(mockDatabase.queryOne).toHaveBeenCalledWith(
          expect.stringContaining('WHERE project_id = $1 AND user_id = $2'),
          [3, 10]
        );
        expect(result).toBe(360);
      });

      test('should return 0 when no entries for project', async () => {
        const mockResult = { total_duration: null };

        mockDatabase.queryOne.mockResolvedValueOnce(mockResult);
        const result = await repository.calculateDurationByProject(999, 10);

        expect(result).toBe(0);
      });
    });

    describe('getDurationByDate', () => {
      test('should get duration grouped by date', async () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');
        const mockRows = [
          { date: new Date('2024-01-15'), total_duration: '120', entry_count: '3' },
          { date: new Date('2024-01-16'), total_duration: '180', entry_count: '4' }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.getDurationByDate(10, startDate, endDate);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('GROUP BY DATE(start_time)'),
          [10, startDate, endDate]
        );
        expect(result).toHaveLength(2);
        expect(result[0].totalDuration).toBe(120);
        expect(result[0].entryCount).toBe(3);
      });

      test('should return empty array when no entries in range', async () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        mockDatabase.queryMany.mockResolvedValueOnce([]);
        const result = await repository.getDurationByDate(10, startDate, endDate);

        expect(result).toEqual([]);
      });
    });

    describe('stopTimer', () => {
      test('should stop a running timer', async () => {
        const mockRow = {
          id: 1,
          user_id: 10,
          task_id: 5,
          project_id: 3,
          description: 'Stopped timer',
          start_time: new Date('2024-01-01T09:00:00'),
          end_time: new Date('2024-01-01T10:00:00'),
          duration: 60,
          is_billable: true,
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
        const result = await repository.stopTimer(1, 10);

        expect(mockDatabase.queryOne).toHaveBeenCalledWith(
          expect.stringContaining('WHERE id = $2 AND user_id = $3 AND end_time IS NULL'),
          expect.arrayContaining([1, 10])
        );
        expect(result).toBeInstanceOf(TimeEntry);
        expect(result.endTime).toBeDefined();
        expect(result.duration).toBe(60);
      });

      test('should return null when timer not found or already stopped', async () => {
        mockDatabase.queryOne.mockResolvedValueOnce(null);
        const result = await repository.stopTimer(999, 10);
        expect(result).toBeNull();
      });
    });
  });

  describe('Relationship Handling', () => {
    test('should include task title and project name in query results', async () => {
      const mockRow = {
        id: 1,
        user_id: 10,
        task_id: 5,
        project_id: 3,
        description: 'Test entry',
        start_time: new Date('2024-01-01T09:00:00'),
        end_time: new Date('2024-01-01T10:00:00'),
        duration: 60,
        is_billable: true,
        created_at: new Date(),
        updated_at: new Date(),
        task_title: 'Test Task',
        project_name: 'Test Project'
      };

      mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
      const result = await repository.findByIdAndUserId(1, 10);

      expect(result.taskTitle).toBe('Test Task');
      expect(result.projectName).toBe('Test Project');
    });

    test('should handle null task and project gracefully', async () => {
      const mockRow = {
        id: 1,
        user_id: 10,
        task_id: null,
        project_id: null,
        description: 'Test entry',
        start_time: new Date('2024-01-01T09:00:00'),
        end_time: new Date('2024-01-01T10:00:00'),
        duration: 60,
        is_billable: true,
        created_at: new Date(),
        updated_at: new Date(),
        task_title: null,
        project_name: null
      };

      mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
      const result = await repository.findByIdAndUserId(1, 10);

      expect(result.taskTitle).toBeUndefined();
      expect(result.projectName).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('should propagate database errors on create', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryOne.mockRejectedValueOnce(error);

      await expect(
        repository.create({ userId: 10, startTime: new Date() })
      ).rejects.toThrow('Database connection failed');
    });

    test('should propagate database errors on update', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryOne.mockRejectedValueOnce(error);

      await expect(
        repository.update(1, { description: 'Test' })
      ).rejects.toThrow('Database connection failed');
    });

    test('should propagate database errors on findByUserId', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryMany.mockRejectedValueOnce(error);

      await expect(repository.findByUserId(10)).rejects.toThrow(
        'Database connection failed'
      );
    });

    test('should propagate database errors on calculateTotalDuration', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryOne.mockRejectedValueOnce(error);

      await expect(repository.calculateTotalDuration(10)).rejects.toThrow(
        'Database connection failed'
      );
    });

    test('should propagate database errors on stopTimer', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryOne.mockRejectedValueOnce(error);

      await expect(repository.stopTimer(1, 10)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
