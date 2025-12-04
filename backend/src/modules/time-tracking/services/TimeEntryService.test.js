const TimeEntryService = require('./TimeEntryService');
const TimeEntry = require('../models/TimeEntry');
const { ValidationError, NotFoundError } = require('../../../core/errors');

describe('TimeEntryService', () => {
  let service;
  let mockTimeEntryRepository;
  let mockTaskRepository;

  beforeEach(() => {
    mockTimeEntryRepository = {
      findByIdAndUserId: jest.fn(),
      findByUserId: jest.fn(),
      findByTaskId: jest.fn(),
      findByDateRange: jest.fn(),
      findRunningTimers: jest.fn(),
      calculateTotalDuration: jest.fn(),
      calculateDurationByTask: jest.fn(),
      calculateDurationByProject: jest.fn(),
      getDurationByDate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      stopTimer: jest.fn()
    };

    mockTaskRepository = {
      exists: jest.fn()
    };

    service = new TimeEntryService(mockTimeEntryRepository, mockTaskRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should create service with repositories', () => {
      expect(service.repository).toBe(mockTimeEntryRepository);
      expect(service.taskRepository).toBe(mockTaskRepository);
    });

    test('should work without task repository', () => {
      const serviceWithoutTask = new TimeEntryService(mockTimeEntryRepository);
      expect(serviceWithoutTask.taskRepository).toBeNull();
    });
  });

  describe('getAllForUser', () => {
    const userId = 10;
    const mockEntries = [
      new TimeEntry({
        id: 1,
        user_id: userId,
        task_id: 5,
        project_id: 3,
        description: 'Entry 1',
        start_time: new Date('2024-01-01T09:00:00'),
        end_time: new Date('2024-01-01T10:00:00'),
        duration: 60,
        is_billable: true,
        created_at: new Date(),
        updated_at: new Date()
      })
    ];

    test('should get all time entries for user', async () => {
      mockTimeEntryRepository.findByUserId.mockResolvedValueOnce(mockEntries);

      const result = await service.getAllForUser(userId);

      expect(mockTimeEntryRepository.findByUserId).toHaveBeenCalledWith(userId, {}, {});
      expect(result).toEqual(mockEntries);
    });

    test('should get entries with filters', async () => {
      const filters = { taskId: 5, projectId: 3 };
      mockTimeEntryRepository.findByUserId.mockResolvedValueOnce(mockEntries);

      const result = await service.getAllForUser(userId, filters);

      expect(mockTimeEntryRepository.findByUserId).toHaveBeenCalledWith(userId, filters, {});
      expect(result).toEqual(mockEntries);
    });
  });

  describe('getByIdForUser', () => {
    const userId = 10;
    const entryId = 1;

    test('should get time entry by ID for user', async () => {
      const mockEntry = new TimeEntry({
        id: entryId,
        user_id: userId,
        task_id: 5,
        description: 'Test Entry',
        start_time: new Date('2024-01-01T09:00:00'),
        end_time: new Date('2024-01-01T10:00:00'),
        duration: 60,
        is_billable: true,
        created_at: new Date(),
        updated_at: new Date()
      });

      mockTimeEntryRepository.findByIdAndUserId.mockResolvedValueOnce(mockEntry);

      const result = await service.getByIdForUser(entryId, userId);

      expect(mockTimeEntryRepository.findByIdAndUserId).toHaveBeenCalledWith(entryId, userId);
      expect(result).toEqual(mockEntry);
    });

    test('should throw NotFoundError when entry not found', async () => {
      mockTimeEntryRepository.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(service.getByIdForUser(999, userId)).rejects.toThrow(NotFoundError);
      await expect(service.getByIdForUser(999, userId)).rejects.toThrow('Time entry with ID 999 not found');
    });
  });

  describe('getByDateRange', () => {
    const userId = 10;
    const startDate = '2024-01-01';
    const endDate = '2024-01-31';

    test('should get entries within date range', async () => {
      const mockEntries = [new TimeEntry({ id: 1, user_id: userId, start_time: new Date('2024-01-15T09:00:00') })];
      mockTimeEntryRepository.findByDateRange.mockResolvedValueOnce(mockEntries);

      const result = await service.getByDateRange(userId, startDate, endDate);

      expect(mockTimeEntryRepository.findByDateRange).toHaveBeenCalledWith(userId, startDate, endDate);
      expect(result).toEqual(mockEntries);
    });

    test('should throw ValidationError when dates are missing', async () => {
      await expect(service.getByDateRange(userId, null, endDate)).rejects.toThrow(ValidationError);
      await expect(service.getByDateRange(userId, startDate, null)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid date format', async () => {
      await expect(service.getByDateRange(userId, 'invalid', endDate)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError when end date is before start date', async () => {
      await expect(service.getByDateRange(userId, '2024-01-31', '2024-01-01')).rejects.toThrow(ValidationError);
    });
  });

  describe('getRunningTimers', () => {
    const userId = 10;

    test('should get running timers for user', async () => {
      const mockEntries = [
        new TimeEntry({
          id: 1,
          user_id: userId,
          start_time: new Date('2024-01-01T09:00:00'),
          end_time: null
        })
      ];
      mockTimeEntryRepository.findRunningTimers.mockResolvedValueOnce(mockEntries);

      const result = await service.getRunningTimers(userId);

      expect(mockTimeEntryRepository.findRunningTimers).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockEntries);
    });
  });

  describe('startTimer', () => {
    const userId = 10;

    test('should start a new timer', async () => {
      const data = {
        task_id: 5,
        project_id: 3,
        description: 'Working on feature',
        is_billable: true
      };

      mockTimeEntryRepository.findRunningTimers.mockResolvedValueOnce([]);
      mockTaskRepository.exists.mockResolvedValueOnce(true);
      
      const mockCreatedEntry = new TimeEntry({
        id: 1,
        user_id: userId,
        ...data,
        start_time: new Date(),
        end_time: null,
        duration: null
      });
      mockTimeEntryRepository.create.mockResolvedValueOnce(mockCreatedEntry);

      const result = await service.startTimer(data, userId);

      expect(mockTimeEntryRepository.findRunningTimers).toHaveBeenCalledWith(userId);
      expect(mockTimeEntryRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedEntry);
    });

    test('should throw ValidationError when timer already running', async () => {
      const data = { task_id: 5, description: 'Test' };
      const runningTimer = new TimeEntry({ id: 1, user_id: userId, start_time: new Date(), end_time: null });
      
      mockTimeEntryRepository.findRunningTimers.mockResolvedValue([runningTimer]);

      await expect(service.startTimer(data, userId)).rejects.toThrow(ValidationError);
      await expect(service.startTimer(data, userId)).rejects.toThrow('already have a running timer');
    });
  });

  describe('stopTimer', () => {
    const userId = 10;
    const entryId = 1;

    test('should stop a running timer', async () => {
      const runningEntry = new TimeEntry({
        id: entryId,
        user_id: userId,
        start_time: new Date('2024-01-01T09:00:00'),
        end_time: null
      });

      const stoppedEntry = new TimeEntry({
        id: entryId,
        user_id: userId,
        start_time: new Date('2024-01-01T09:00:00'),
        end_time: new Date('2024-01-01T10:00:00'),
        duration: 60
      });

      mockTimeEntryRepository.findByIdAndUserId.mockResolvedValueOnce(runningEntry);
      mockTimeEntryRepository.stopTimer.mockResolvedValueOnce(stoppedEntry);

      const result = await service.stopTimer(entryId, userId);

      expect(mockTimeEntryRepository.stopTimer).toHaveBeenCalledWith(entryId, userId);
      expect(result).toEqual(stoppedEntry);
    });

    test('should throw NotFoundError when entry not found', async () => {
      mockTimeEntryRepository.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(service.stopTimer(999, userId)).rejects.toThrow(NotFoundError);
    });

    test('should throw ValidationError when timer not running', async () => {
      const stoppedEntry = new TimeEntry({
        id: entryId,
        user_id: userId,
        start_time: new Date('2024-01-01T09:00:00'),
        end_time: new Date('2024-01-01T10:00:00'),
        duration: 60
      });

      mockTimeEntryRepository.findByIdAndUserId.mockResolvedValue(stoppedEntry);

      await expect(service.stopTimer(entryId, userId)).rejects.toThrow(ValidationError);
      await expect(service.stopTimer(entryId, userId)).rejects.toThrow('Timer is not running');
    });
  });

  describe('createForUser', () => {
    const userId = 10;

    test('should create manual time entry with duration calculation', async () => {
      const data = {
        task_id: 5,
        project_id: 3,
        description: 'Manual entry',
        start_time: '2024-01-01T09:00:00',
        end_time: '2024-01-01T10:00:00',
        is_billable: true
      };

      mockTaskRepository.exists.mockResolvedValueOnce(true);
      
      const mockCreatedEntry = new TimeEntry({
        id: 1,
        user_id: userId,
        ...data,
        duration: 60
      });
      mockTimeEntryRepository.create.mockResolvedValueOnce(mockCreatedEntry);

      const result = await service.createForUser(data, userId);

      expect(mockTimeEntryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          duration: 60
        })
      );
      expect(result).toEqual(mockCreatedEntry);
    });

    test('should throw ValidationError for invalid start time', async () => {
      const data = {
        start_time: 'invalid-date',
        end_time: '2024-01-01T10:00:00'
      };

      await expect(service.createForUser(data, userId)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError when end time is before start time', async () => {
      const data = {
        start_time: '2024-01-01T10:00:00',
        end_time: '2024-01-01T09:00:00'
      };

      await expect(service.createForUser(data, userId)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError when task does not exist', async () => {
      const data = {
        task_id: 999,
        start_time: '2024-01-01T09:00:00',
        end_time: '2024-01-01T10:00:00'
      };

      mockTaskRepository.exists.mockResolvedValueOnce(false);

      await expect(service.createForUser(data, userId)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(data, userId)).rejects.toThrow('Task with ID 999 not found');
    });
  });

  describe('updateForUser', () => {
    const userId = 10;
    const entryId = 1;

    test('should update time entry', async () => {
      const existingEntry = new TimeEntry({
        id: entryId,
        user_id: userId,
        start_time: new Date('2024-01-01T09:00:00'),
        end_time: new Date('2024-01-01T10:00:00'),
        duration: 60
      });

      const updateData = {
        description: 'Updated description',
        is_billable: false
      };

      const updatedEntry = new TimeEntry({
        ...existingEntry,
        ...updateData
      });

      mockTimeEntryRepository.findByIdAndUserId.mockResolvedValueOnce(existingEntry);
      mockTimeEntryRepository.update.mockResolvedValueOnce(updatedEntry);

      const result = await service.updateForUser(entryId, updateData, userId);

      expect(mockTimeEntryRepository.update).toHaveBeenCalledWith(entryId, updateData);
      expect(result).toEqual(updatedEntry);
    });

    test('should throw NotFoundError when entry not found', async () => {
      mockTimeEntryRepository.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(service.updateForUser(999, {}, userId)).rejects.toThrow(NotFoundError);
    });

    test('should throw ValidationError when updating running timer without end time', async () => {
      const runningEntry = new TimeEntry({
        id: entryId,
        user_id: userId,
        start_time: new Date('2024-01-01T09:00:00'),
        end_time: null
      });

      mockTimeEntryRepository.findByIdAndUserId.mockResolvedValueOnce(runningEntry);

      await expect(service.updateForUser(entryId, { description: 'Test' }, userId)).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteForUser', () => {
    const userId = 10;
    const entryId = 1;

    test('should delete time entry', async () => {
      const existingEntry = new TimeEntry({
        id: entryId,
        user_id: userId,
        start_time: new Date('2024-01-01T09:00:00'),
        end_time: new Date('2024-01-01T10:00:00'),
        duration: 60
      });

      mockTimeEntryRepository.findByIdAndUserId.mockResolvedValueOnce(existingEntry);
      mockTimeEntryRepository.delete.mockResolvedValueOnce(true);

      const result = await service.deleteForUser(entryId, userId);

      expect(mockTimeEntryRepository.delete).toHaveBeenCalledWith(entryId);
      expect(result).toBe(true);
    });

    test('should throw NotFoundError when entry not found', async () => {
      mockTimeEntryRepository.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(service.deleteForUser(999, userId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getTotalDuration', () => {
    const userId = 10;

    test('should calculate total duration', async () => {
      mockTimeEntryRepository.calculateTotalDuration.mockResolvedValueOnce(480);

      const result = await service.getTotalDuration(userId);

      expect(mockTimeEntryRepository.calculateTotalDuration).toHaveBeenCalledWith(userId, null, null);
      expect(result).toEqual({
        minutes: 480,
        hours: '8.00'
      });
    });

    test('should calculate total duration with date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      mockTimeEntryRepository.calculateTotalDuration.mockResolvedValueOnce(240);

      const result = await service.getTotalDuration(userId, startDate, endDate);

      expect(mockTimeEntryRepository.calculateTotalDuration).toHaveBeenCalledWith(userId, startDate, endDate);
      expect(result).toEqual({
        minutes: 240,
        hours: '4.00'
      });
    });
  });

  describe('getDurationByTask', () => {
    const userId = 10;
    const taskId = 5;

    test('should calculate duration by task', async () => {
      mockTimeEntryRepository.calculateDurationByTask.mockResolvedValueOnce(120);

      const result = await service.getDurationByTask(taskId, userId);

      expect(mockTimeEntryRepository.calculateDurationByTask).toHaveBeenCalledWith(taskId, userId);
      expect(result).toEqual({
        minutes: 120,
        hours: '2.00'
      });
    });
  });

  describe('getDurationByProject', () => {
    const userId = 10;
    const projectId = 3;

    test('should calculate duration by project', async () => {
      mockTimeEntryRepository.calculateDurationByProject.mockResolvedValueOnce(360);

      const result = await service.getDurationByProject(projectId, userId);

      expect(mockTimeEntryRepository.calculateDurationByProject).toHaveBeenCalledWith(projectId, userId);
      expect(result).toEqual({
        minutes: 360,
        hours: '6.00'
      });
    });
  });

  describe('getDurationByDate', () => {
    const userId = 10;
    const startDate = '2024-01-01';
    const endDate = '2024-01-31';

    test('should get duration grouped by date', async () => {
      const mockData = [
        { date: new Date('2024-01-15'), totalDuration: 120, entryCount: 3 },
        { date: new Date('2024-01-16'), totalDuration: 180, entryCount: 4 }
      ];
      mockTimeEntryRepository.getDurationByDate.mockResolvedValueOnce(mockData);

      const result = await service.getDurationByDate(userId, startDate, endDate);

      expect(mockTimeEntryRepository.getDurationByDate).toHaveBeenCalledWith(userId, startDate, endDate);
      expect(result).toEqual(mockData);
    });

    test('should throw ValidationError when dates are missing', async () => {
      await expect(service.getDurationByDate(userId, null, endDate)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError when end date is before start date', async () => {
      await expect(service.getDurationByDate(userId, '2024-01-31', '2024-01-01')).rejects.toThrow(ValidationError);
    });
  });

  describe('Validation', () => {
    test('should validate description length on create', async () => {
      const data = {
        start_time: '2024-01-01T09:00:00',
        description: 'a'.repeat(1001)
      };

      await expect(service.createForUser(data, 10)).rejects.toThrow(ValidationError);
      await expect(service.createForUser(data, 10)).rejects.toThrow('1000 characters or less');
    });

    test('should validate description length on update', async () => {
      const existingEntry = new TimeEntry({
        id: 1,
        user_id: 10,
        start_time: new Date('2024-01-01T09:00:00'),
        end_time: new Date('2024-01-01T10:00:00')
      });

      mockTimeEntryRepository.findByIdAndUserId.mockResolvedValueOnce(existingEntry);

      const updateData = {
        description: 'a'.repeat(1001)
      };

      await expect(service.updateForUser(1, updateData, 10)).rejects.toThrow(ValidationError);
    });
  });
});
