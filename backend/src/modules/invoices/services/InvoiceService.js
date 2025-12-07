const BaseService = require('../../../shared/base/BaseService');
const { ValidationError, NotFoundError, ConflictError } = require('../../../core/errors');

/**
 * Invoice Service
 * Handles business logic for invoice operations
 */
class InvoiceService extends BaseService {
  /**
   * @param {InvoiceRepository} invoiceRepository
   * @param {ClientRepository} clientRepository - Optional, for validating client relationships
   */
  constructor(invoiceRepository, clientRepository = null) {
    super(invoiceRepository);
    this.clientRepository = clientRepository;
  }

  /**
   * Get all invoices for a user
   * @param {number} userId - User ID
   * @param {Object} filters - Filters (clientId, status)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of invoices
   */
  async getAllForUser(userId, filters = {}, options = {}) {
    return await this.repository.findByUserId(userId, filters, options);
  }

  /**
   * Get an invoice by ID for a specific user
   * @param {number} id - Invoice ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Invoice
   * @throws {NotFoundError} If invoice not found or doesn't belong to user
   */
  async getByIdForUser(id, userId) {
    const invoice = await this.repository.findByIdAndUserId(id, userId);
    if (!invoice) {
      throw new NotFoundError(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  /**
   * Get all invoices for a specific client
   * @param {number} clientId - Client ID
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of invoices
   */
  async getByClientId(clientId, userId) {
    return await this.repository.findByClientId(clientId, userId);
  }

  /**
   * Get invoices by status
   * @param {string} status - Invoice status
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of invoices
   */
  async getByStatus(status, userId) {
    return await this.repository.findByStatus(status, userId);
  }

  /**
   * Get overdue invoices
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of overdue invoices
   */
  async getOverdue(userId) {
    return await this.repository.findOverdue(userId);
  }

  /**
   * Create a new invoice
   * @param {Object} data - Invoice data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Created invoice
   */
  async createForUser(data, userId) {
    // Check if invoice number already exists
    if (data.invoice_number || data.invoiceNumber) {
      const invoiceNumber = data.invoice_number || data.invoiceNumber;
      const existing = await this.repository.findByInvoiceNumber(invoiceNumber);
      if (existing) {
        throw new ConflictError(`Invoice number ${invoiceNumber} already exists`);
      }
    }

    // Add user ID to data
    const invoiceData = {
      ...data,
      user_id: userId
    };

    // Validate
    await this.validateCreate(invoiceData);

    // Calculate total if not provided
    if (!invoiceData.total) {
      invoiceData.total = (invoiceData.amount || 0) + (invoiceData.tax || 0);
    }

    return await this.repository.create(invoiceData);
  }

  /**
   * Update an invoice
   * @param {number} id - Invoice ID
   * @param {Object} data - Updated data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated invoice
   * @throws {NotFoundError} If invoice not found or doesn't belong to user
   */
  async updateForUser(id, data, userId) {
    // Check if invoice exists and belongs to user
    const existingInvoice = await this.repository.findByIdAndUserId(id, userId);
    if (!existingInvoice) {
      throw new NotFoundError(`Invoice with ID ${id} not found`);
    }

    // Validate status transition if status is being changed
    if (data.status && data.status !== existingInvoice.status) {
      if (!existingInvoice.canTransitionTo(data.status)) {
        throw new ValidationError(`Cannot transition from ${existingInvoice.status} to ${data.status}`);
      }
      
      // Auto-set dates based on status changes
      if (data.status === 'sent' && !existingInvoice.sentDate && !data.sent_date) {
        data.sent_date = new Date();
      }
      if (data.status === 'paid' && !existingInvoice.paidDate && !data.paid_date) {
        data.paid_date = new Date();
      }
    }

    // Recalculate total if amount or tax changed
    if (data.amount !== undefined || data.tax !== undefined) {
      const newAmount = data.amount !== undefined ? data.amount : existingInvoice.amount;
      const newTax = data.tax !== undefined ? data.tax : existingInvoice.tax;
      data.total = newAmount + newTax;
    }

    // Validate
    await this.validateUpdate(id, data);

    return await this.repository.update(id, data);
  }

  /**
   * Delete an invoice
   * @param {number} id - Invoice ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {NotFoundError} If invoice not found or doesn't belong to user
   */
  async deleteForUser(id, userId) {
    // Check if invoice exists and belongs to user
    const existingInvoice = await this.repository.findByIdAndUserId(id, userId);
    if (!existingInvoice) {
      throw new NotFoundError(`Invoice with ID ${id} not found`);
    }

    // Validate before delete
    await this.validateDelete(id);

    return await this.repository.delete(id);
  }

  /**
   * Get invoice statistics by status
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Status counts
   */
  async getStatusCounts(userId) {
    return await this.repository.countByStatus(userId);
  }

  /**
   * Get revenue statistics
   * @param {number} userId - User ID
   * @param {Object} filters - Optional filters (startDate, endDate, clientId)
   * @returns {Promise<Object>} Revenue statistics
   */
  async getRevenueStats(userId, filters = {}) {
    const revenue = await this.repository.calculateRevenue(userId, filters);
    const pending = await this.repository.calculatePendingAmount(userId);
    
    return {
      totalRevenue: revenue,
      pendingAmount: pending,
      totalOutstanding: revenue + pending
    };
  }

  /**
   * Search invoices
   * @param {string} searchTerm - Search term
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of matching invoices
   */
  async search(searchTerm, userId) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new ValidationError('Search term is required');
    }
    return await this.repository.search(searchTerm, userId);
  }

  /**
   * Generate next invoice number
   * @param {number} userId - User ID
   * @returns {Promise<string>} Next invoice number
   */
  async generateInvoiceNumber(userId) {
    // Get all invoices for user to find the highest number
    const invoices = await this.repository.findByUserId(userId);
    
    if (invoices.length === 0) {
      return 'INV-0001';
    }
    
    // Extract numbers from invoice numbers and find max
    const numbers = invoices
      .map(inv => {
        const match = inv.invoiceNumber.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(num => !isNaN(num));
    
    const maxNumber = Math.max(...numbers, 0);
    const nextNumber = maxNumber + 1;
    
    return `INV-${String(nextNumber).padStart(4, '0')}`;
  }

  /**
   * Validate invoice data before creation
   * @param {Object} data - Invoice data
   * @throws {ValidationError} If validation fails
   */
  async validateCreate(data) {
    if (!data.invoice_number || data.invoice_number.trim().length === 0) {
      throw new ValidationError('Invoice number is required');
    }

    if (!data.client_id) {
      throw new ValidationError('Client is required');
    }

    if (data.amount === undefined || data.amount < 0) {
      throw new ValidationError('Valid amount is required');
    }

    if (data.tax !== undefined && data.tax < 0) {
      throw new ValidationError('Tax cannot be negative');
    }

    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (data.status && !validStatuses.includes(data.status)) {
      throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate dates
    if (data.issue_date) {
      const issueDate = new Date(data.issue_date);
      if (isNaN(issueDate.getTime())) {
        throw new ValidationError('Invalid issue date format');
      }
    }

    if (data.due_date) {
      const dueDate = new Date(data.due_date);
      if (isNaN(dueDate.getTime())) {
        throw new ValidationError('Invalid due date format');
      }
      
      // Due date should be after issue date
      if (data.issue_date) {
        const issueDate = new Date(data.issue_date);
        if (dueDate < issueDate) {
          throw new ValidationError('Due date must be after issue date');
        }
      }
    }

    // Validate client exists if clientRepository is available
    if (data.client_id && this.clientRepository) {
      const clientExists = await this.clientRepository.exists(data.client_id);
      if (!clientExists) {
        throw new ValidationError(`Client with ID ${data.client_id} not found`);
      }
    }
  }

  /**
   * Validate invoice data before update
   * @param {number} id - Invoice ID
   * @param {Object} data - Updated data
   * @throws {ValidationError} If validation fails
   */
  async validateUpdate(id, data) {
    if (data.invoice_number !== undefined) {
      if (!data.invoice_number || data.invoice_number.trim().length === 0) {
        throw new ValidationError('Invoice number cannot be empty');
      }
    }

    if (data.amount !== undefined && data.amount < 0) {
      throw new ValidationError('Amount cannot be negative');
    }

    if (data.tax !== undefined && data.tax < 0) {
      throw new ValidationError('Tax cannot be negative');
    }

    if (data.status) {
      const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
      if (!validStatuses.includes(data.status)) {
        throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    // Validate client exists if clientRepository is available
    if (data.client_id && this.clientRepository) {
      const clientExists = await this.clientRepository.exists(data.client_id);
      if (!clientExists) {
        throw new ValidationError(`Client with ID ${data.client_id} not found`);
      }
    }
  }

  /**
   * Validate before deleting an invoice
   * @param {number} id - Invoice ID
   * @throws {ValidationError} If validation fails
   */
  async validateDelete(id) {
    // Could add logic here to check if invoice has items
    // and prevent deletion or cascade delete
    // For now, we'll allow deletion
  }

  /**
   * Generate PDF for an invoice
   * @param {number} id - Invoice ID
   * @param {number} userId - User ID
   * @returns {Promise<Buffer>} PDF buffer
   * @throws {NotFoundError} If invoice not found or doesn't belong to user
   */
  async generatePDF(id, userId) {
    const pdfService = require('../../../services/pdfService');
    
    // Get invoice
    const invoice = await this.getByIdForUser(id, userId);
    
    // Get client information
    let client = { name: 'N/A', email: '', phone: '', address: '' };
    if (invoice.client_id && this.clientRepository) {
      try {
        const clientData = await this.clientRepository.findById(invoice.client_id);
        if (clientData) {
          client = clientData;
        }
      } catch (error) {
        // If client not found, use default
      }
    }
    
    // Get invoice items if available
    let items = [];
    try {
      const db = this.repository.db;
      const itemsResult = await db.query(
        'SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY id',
        [id]
      );
      items = itemsResult.rows || [];
    } catch (error) {
      // If items table doesn't exist or query fails, continue without items
    }
    
    // Generate PDF
    return await pdfService.generateInvoicePDF(invoice, client, items);
  }
}

module.exports = InvoiceService;
