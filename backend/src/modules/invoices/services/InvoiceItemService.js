const logger = require('../../../core/logger');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../../core/errors');

/**
 * Invoice Item Service
 * Business logic for invoice items
 */
class InvoiceItemService {
  constructor(invoiceItemRepository, invoiceRepository) {
    this.invoiceItemRepository = invoiceItemRepository;
    this.invoiceRepository = invoiceRepository;
  }

  /**
   * Verify user owns the invoice
   * @param {number} invoiceId - Invoice ID
   * @param {number} userId - User ID
   * @throws {NotFoundError|ForbiddenError}
   */
  async verifyInvoiceOwnership(invoiceId, userId) {
    const invoice = await this.invoiceRepository.findByIdAndUserId(invoiceId, userId);
    
    if (!invoice) {
      throw new NotFoundError('Invoice not found or you do not have permission to access it');
    }
    
    return invoice;
  }

  /**
   * Get all items for an invoice
   * @param {number} invoiceId - Invoice ID
   * @param {number} userId - User ID
   * @returns {Promise<InvoiceItem[]>}
   */
  async getItemsForInvoice(invoiceId, userId) {
    await this.verifyInvoiceOwnership(invoiceId, userId);
    return this.invoiceItemRepository.getByInvoiceId(invoiceId);
  }

  /**
   * Get a single invoice item
   * @param {number} itemId - Item ID
   * @param {number} userId - User ID
   * @returns {Promise<InvoiceItem>}
   */
  async getItemById(itemId, userId) {
    const item = await this.invoiceItemRepository.getById(itemId);
    
    if (!item) {
      throw new NotFoundError('Invoice item not found');
    }
    
    await this.verifyInvoiceOwnership(item.invoiceId, userId);
    return item;
  }

  /**
   * Create a new invoice item
   * @param {number} invoiceId - Invoice ID
   * @param {Object} data - Item data
   * @param {number} userId - User ID
   * @returns {Promise<InvoiceItem>}
   */
  async createItem(invoiceId, data, userId) {
    await this.verifyInvoiceOwnership(invoiceId, userId);
    
    // Calculate amount
    let amount;
    if (data.hoursWorked && data.ratePerHour) {
      amount = parseFloat(data.hoursWorked) * parseFloat(data.ratePerHour);
    } else {
      amount = parseFloat(data.quantity || 1) * parseFloat(data.unitPrice || 0);
    }
    
    const itemData = {
      invoiceId,
      projectId: data.projectId || data.project_id,
      taskId: data.taskId || data.task_id,
      description: data.description,
      quantity: data.quantity || 1,
      unitPrice: data.unitPrice || data.unit_price || 0,
      hoursWorked: data.hoursWorked || data.hours_worked || null,
      ratePerHour: data.ratePerHour || data.rate_per_hour || null,
      amount
    };
    
    const item = await this.invoiceItemRepository.create(itemData);
    
    // Update invoice total
    await this.updateInvoiceTotal(invoiceId);
    
    logger.info(`Invoice item created: ${item.id} for invoice ${invoiceId}`);
    return item;
  }

  /**
   * Update an invoice item
   * @param {number} itemId - Item ID
   * @param {Object} data - Updated data
   * @param {number} userId - User ID
   * @returns {Promise<InvoiceItem>}
   */
  async updateItem(itemId, data, userId) {
    const existingItem = await this.getItemById(itemId, userId);
    
    // Recalculate amount if relevant fields changed
    let amount = existingItem.amount;
    if (data.hoursWorked !== undefined || data.ratePerHour !== undefined ||
        data.quantity !== undefined || data.unitPrice !== undefined) {
      
      const hoursWorked = data.hoursWorked !== undefined ? data.hoursWorked : existingItem.hoursWorked;
      const ratePerHour = data.ratePerHour !== undefined ? data.ratePerHour : existingItem.ratePerHour;
      const quantity = data.quantity !== undefined ? data.quantity : existingItem.quantity;
      const unitPrice = data.unitPrice !== undefined ? data.unitPrice : existingItem.unitPrice;
      
      if (hoursWorked && ratePerHour) {
        amount = parseFloat(hoursWorked) * parseFloat(ratePerHour);
      } else {
        amount = parseFloat(quantity) * parseFloat(unitPrice);
      }
      
      data.amount = amount;
    }
    
    const item = await this.invoiceItemRepository.update(itemId, data);
    
    // Update invoice total
    await this.updateInvoiceTotal(existingItem.invoiceId);
    
    logger.info(`Invoice item updated: ${itemId}`);
    return item;
  }

  /**
   * Delete an invoice item
   * @param {number} itemId - Item ID
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteItem(itemId, userId) {
    const item = await this.getItemById(itemId, userId);
    
    await this.invoiceItemRepository.delete(itemId);
    
    // Update invoice total
    await this.updateInvoiceTotal(item.invoiceId);
    
    logger.info(`Invoice item deleted: ${itemId}`);
  }

  /**
   * Update invoice total based on items
   * @param {number} invoiceId - Invoice ID
   * @private
   */
  async updateInvoiceTotal(invoiceId) {
    const total = await this.invoiceItemRepository.getTotalAmount(invoiceId);
    await this.invoiceRepository.update(invoiceId, { amount: total });
  }
}

module.exports = InvoiceItemService;
