/**
 * InvoiceItem Domain Model
 * 
 * Represents an invoice line item with business logic and validation.
 */

class InvoiceItem {
  /**
   * @param {Object} data - Invoice item data from database or DTO
   */
  constructor(data) {
    this.id = data.id;
    this.invoiceId = data.invoice_id || data.invoiceId;
    this.projectId = data.project_id || data.projectId;
    this.taskId = data.task_id || data.taskId;
    this.description = data.description;
    this.quantity = parseFloat(data.quantity) || 1;
    this.unitPrice = parseFloat(data.unit_price || data.unitPrice) || 0;
    this.hoursWorked = data.hours_worked || data.hoursWorked ? parseFloat(data.hours_worked || data.hoursWorked) : null;
    this.ratePerHour = data.rate_per_hour || data.ratePerHour ? parseFloat(data.rate_per_hour || data.ratePerHour) : null;
    this.amount = parseFloat(data.amount) || 0;
    this.createdAt = data.created_at || data.createdAt;
    
    // Relationships (populated when joined)
    this.projectName = data.project_name || data.projectName;
    this.taskTitle = data.task_title || data.taskTitle;
  }

  /**
   * Validates the invoice item data
   * @returns {boolean} True if valid
   */
  isValid() {
    if (!this.description || this.description.trim().length === 0) {
      return false;
    }
    
    if (this.quantity <= 0 || this.amount < 0) {
      return false;
    }
    
    // If hourly, must have hours and rate
    if (this.hoursWorked !== null || this.ratePerHour !== null) {
      if (this.hoursWorked <= 0 || this.ratePerHour <= 0) {
        return false;
      }
    } else {
      // If fixed price, must have unit price
      if (this.unitPrice < 0) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if this is an hourly item
   * @returns {boolean}
   */
  isHourly() {
    return this.hoursWorked !== null && this.ratePerHour !== null;
  }

  /**
   * Check if this is a fixed price item
   * @returns {boolean}
   */
  isFixedPrice() {
    return !this.isHourly();
  }

  /**
   * Calculate amount based on type
   * @returns {number}
   */
  calculateAmount() {
    if (this.isHourly()) {
      return this.hoursWorked * this.ratePerHour;
    }
    return this.quantity * this.unitPrice;
  }

  /**
   * Converts the invoice item to a JSON representation
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      invoiceId: this.invoiceId,
      projectId: this.projectId,
      taskId: this.taskId,
      description: this.description,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      hoursWorked: this.hoursWorked,
      ratePerHour: this.ratePerHour,
      amount: this.amount,
      createdAt: this.createdAt,
      projectName: this.projectName,
      taskTitle: this.taskTitle,
      type: this.isHourly() ? 'hourly' : 'fixed'
    };
  }
}

module.exports = InvoiceItem;
