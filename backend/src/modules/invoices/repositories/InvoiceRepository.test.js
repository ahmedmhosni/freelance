const InvoiceRepository = require('./InvoiceRepository');
const Invoice = require('../models/Invoice');

describe('InvoiceRepository', () => {
  let repository;
  let mockDatabase;

  beforeEach(() => {
    mockDatabase = {
      queryOne: jest.fn(),
      queryMany: jest.fn(),
      execute: jest.fn(),
      query: jest.fn()
    };
    repository = new InvoiceRepository(mockDatabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should create repository with correct table name', () => {
      expect(repository.tableName).toBe('invoices');
      expect(repository.db).toBe(mockDatabase);
    });
  });

  describe('CRUD Operations', () => {
    describe('create', () => {
      test('should create a new invoice', async () => {
        const invoiceData = {
          userId: 10,
          clientId: 5,
          invoiceNumber: 'INV-001',
          amount: 1000,
          tax: 100,
          total: 1100,
          status: 'draft'
        };

        const mockRow = {
          id: 1,
          user_id: 10,
          client_id: 5,
          invoice_number: 'INV-001',
          amount: 1000,
          tax: 100,
          total: 1100,
          status: 'draft',
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
        const result = await repository.create(invoiceData);

        expect(mockDatabase.queryOne).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Invoice);
        expect(result.invoiceNumber).toBe('INV-001');
        expect(result.total).toBe(1100);
      });
    });

    describe('update', () => {
      test('should update an invoice', async () => {
        const updateData = {
          status: 'paid',
          paidDate: '2024-12-01'
        };

        const mockRow = {
          id: 1,
          user_id: 10,
          client_id: 5,
          invoice_number: 'INV-001',
          amount: 1000,
          tax: 100,
          total: 1100,
          status: 'paid',
          paid_date: '2024-12-01',
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
        const result = await repository.update(1, updateData);

        expect(mockDatabase.queryOne).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Invoice);
        expect(result.status).toBe('paid');
      });

      test('should return null when updating non-existent invoice', async () => {
        mockDatabase.queryOne.mockResolvedValueOnce(null);
        const result = await repository.update(999, { status: 'paid' });
        expect(result).toBeNull();
      });
    });
  });

  describe('Query Operations', () => {
    describe('findByUserId', () => {
      test('should find all invoices for a user', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            client_id: 5,
            invoice_number: 'INV-001',
            amount: 1000,
            tax: 100,
            total: 1100,
            status: 'paid',
            created_at: new Date(),
            updated_at: new Date(),
            client_name: 'Client A',
            project_name: 'Project A',
            item_count: 3
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findByUserId(10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('SELECT i.*'),
          [10]
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Invoice);
        expect(result[0].clientName).toBe('Client A');
      });

      test('should filter invoices by client ID', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, { clientId: 5 });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND i.client_id = $2'),
          [10, 5]
        );
      });

      test('should filter invoices by status', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, { status: 'paid' });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('AND i.status = $2'),
          [10, 'paid']
        );
      });

      test('should support pagination', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.findByUserId(10, {}, { limit: 10, offset: 20 });

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('LIMIT'),
          [10, 10, 20]
        );
      });
    });

    describe('findByIdAndUserId', () => {
      test('should find invoice by ID and user ID', async () => {
        const mockRow = {
          id: 1,
          user_id: 10,
          client_id: 5,
          invoice_number: 'INV-001',
          amount: 1000,
          tax: 100,
          total: 1100,
          status: 'paid',
          created_at: new Date(),
          updated_at: new Date(),
          client_name: 'Client A',
          item_count: 3
        };

        mockDatabase.queryOne.mockResolvedValueOnce(mockRow);
        const result = await repository.findByIdAndUserId(1, 10);

        expect(mockDatabase.queryOne).toHaveBeenCalledWith(
          expect.stringContaining('WHERE i.id = $1 AND i.user_id = $2'),
          [1, 10]
        );
        expect(result).toBeInstanceOf(Invoice);
        expect(result.id).toBe(1);
      });

      test('should return null when invoice not found', async () => {
        mockDatabase.queryOne.mockResolvedValueOnce(null);
        const result = await repository.findByIdAndUserId(999, 10);
        expect(result).toBeNull();
      });
    });

    describe('findByClientId', () => {
      test('should find all invoices for a client', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            client_id: 5,
            invoice_number: 'INV-001',
            amount: 1000,
            status: 'paid',
            created_at: new Date(),
            client_name: 'Client A',
            item_count: 2
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findByClientId(5, 10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('WHERE i.client_id = $1 AND i.user_id = $2'),
          [5, 10]
        );
        expect(result).toHaveLength(1);
        expect(result[0].clientId).toBe(5);
      });
    });

    describe('findByStatus', () => {
      test('should find invoices by status', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            invoice_number: 'INV-001',
            status: 'paid',
            amount: 1000,
            created_at: new Date(),
            item_count: 1
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findByStatus('paid', 10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('WHERE i.status = $1 AND i.user_id = $2'),
          ['paid', 10]
        );
        expect(result).toHaveLength(1);
        expect(result[0].status).toBe('paid');
      });
    });

    describe('findOverdue', () => {
      test('should find overdue invoices', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            invoice_number: 'INV-001',
            status: 'sent',
            due_date: '2023-01-01',
            amount: 1000,
            created_at: new Date(),
            item_count: 1
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.findOverdue(10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('i.due_date < NOW()'),
          [10]
        );
        expect(result).toHaveLength(1);
      });
    });

    describe('countByStatus', () => {
      test('should count invoices by status', async () => {
        const mockRows = [
          { status: 'draft', count: '2' },
          { status: 'paid', count: '5' },
          { status: 'sent', count: '3' }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.countByStatus(10);

        expect(result).toEqual({
          draft: 2,
          sent: 3,
          paid: 5,
          overdue: 0,
          cancelled: 0
        });
      });

      test('should return zero counts when no invoices', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        const result = await repository.countByStatus(10);

        expect(result).toEqual({
          draft: 0,
          sent: 0,
          paid: 0,
          overdue: 0,
          cancelled: 0
        });
      });
    });

    describe('calculateRevenue', () => {
      test('should calculate total revenue', async () => {
        mockDatabase.queryOne.mockResolvedValueOnce({ revenue: '5000' });
        const result = await repository.calculateRevenue(10);

        expect(mockDatabase.queryOne).toHaveBeenCalledWith(
          expect.stringContaining("status = 'paid'"),
          [10]
        );
        expect(result).toBe(5000);
      });

      test('should calculate revenue with date filters', async () => {
        mockDatabase.queryOne.mockResolvedValueOnce({ revenue: '3000' });
        const result = await repository.calculateRevenue(10, {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        });

        expect(mockDatabase.queryOne).toHaveBeenCalledWith(
          expect.stringContaining('paid_date >='),
          [10, '2024-01-01', '2024-12-31']
        );
        expect(result).toBe(3000);
      });

      test('should return 0 when no revenue', async () => {
        mockDatabase.queryOne.mockResolvedValueOnce({ revenue: null });
        const result = await repository.calculateRevenue(10);
        expect(result).toBe(0);
      });
    });

    describe('calculatePendingAmount', () => {
      test('should calculate pending amount', async () => {
        mockDatabase.queryOne.mockResolvedValueOnce({ pending: '2500' });
        const result = await repository.calculatePendingAmount(10);

        expect(mockDatabase.queryOne).toHaveBeenCalledWith(
          expect.stringContaining("status IN ('sent', 'overdue')"),
          [10]
        );
        expect(result).toBe(2500);
      });
    });

    describe('search', () => {
      test('should search invoices by invoice number', async () => {
        const mockRows = [
          {
            id: 1,
            user_id: 10,
            invoice_number: 'INV-001',
            status: 'paid',
            amount: 1000,
            created_at: new Date(),
            item_count: 1
          }
        ];

        mockDatabase.queryMany.mockResolvedValueOnce(mockRows);
        const result = await repository.search('INV-001', 10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('i.invoice_number ILIKE $2'),
          [10, '%INV-001%']
        );
        expect(result).toHaveLength(1);
      });

      test('should search invoices by client name', async () => {
        mockDatabase.queryMany.mockResolvedValueOnce([]);
        await repository.search('Client', 10);

        expect(mockDatabase.queryMany).toHaveBeenCalledWith(
          expect.stringContaining('c.name ILIKE $2'),
          [10, '%Client%']
        );
      });
    });
  });

  describe('Error Handling', () => {
    test('should propagate database errors on create', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryOne.mockRejectedValueOnce(error);

      await expect(
        repository.create({ userId: 10, invoiceNumber: 'INV-001' })
      ).rejects.toThrow('Database connection failed');
    });

    test('should propagate database errors on findByUserId', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryMany.mockRejectedValueOnce(error);

      await expect(repository.findByUserId(10)).rejects.toThrow(
        'Database connection failed'
      );
    });

    test('should propagate database errors on calculateRevenue', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.queryOne.mockRejectedValueOnce(error);

      await expect(repository.calculateRevenue(10)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
