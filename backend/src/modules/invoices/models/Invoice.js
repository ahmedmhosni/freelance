/**
 * Invoice Domain Model
 * 
 * Represents an invoice entity with business logic and validation.
 * Invoices track billing for clients and projects.
 */

class Invoice {
  /**
   * @param {Object} data - Invoice data from database or DTO
   */
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id || data.userId;
    this.clientId = data.client_id || data.clientId;
    this.projectId = data.project_id || data.projectId;
    this.invoiceNumber = data.invoice_number || data.invoiceNumber;
    this.amount = parseFloat(data.amount) || 0;
    this.tax = parseFloat(data.tax) || 0;
    this.total = parseFloat(data.total) || 0;
    this.status = data.status || 'draft';
    this.issueDate = data.issue_date || data.issueDate;
    this.dueDate = data.due_date || data.dueDate;
    this.sentDate = data.sent_date || data.sentDate;
    this.paidDate = data.paid_date || data.paidDate;
    this.notes = data.notes;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
    
    // Relationships (populated when joined)
    this.clientName = data.client_name || data.clientName;
    this.projectName = data.project_name || data.projectName;
    this.itemCount = data.item_count || data.itemCount || 0;
  }

  /**
   * Validates the invoice data
   * @returns {boolean} True if valid
   */
  isValid() {
    if (!this.invoiceNumber || this.invoiceNumber.trim().length === 0) {
      return false;
    }
    
    if (this.amount < 0 || this.tax < 0 || this.total < 0) {
      return false;
    }
    
    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(this.status)) {
      return false;
    }
    
    return true;
  }

  /**
   * Checks if the invoice is a draft
   * @returns {boolean}
   */
  isDraft() {
    return this.status === 'draft';
  }

  /**
   * Checks if the invoice has been sent
   * @returns {boolean}
   */
  isSent() {
    return this.status === 'sent';
  }

  /**
   * Checks if the invoice is paid
   * @returns {boolean}
   */
  isPaid() {
    return this.status === 'paid';
  }

  /**
   * Checks if the invoice is overdue
   * @returns {boolean}
   */
  isOverdue() {
    if (this.status === 'paid' || this.status === 'cancelled') {
      return false;
    }
    
    if (!this.dueDate) {
      return false;
    }
    
    const now = new Date();
    const due = new Date(this.dueDate);
    return due < now;
  }

  /**
   * Checks if the invoice is cancelled
   * @returns {boolean}
   */
  isCancelled() {
    return this.status === 'cancelled';
  }

  /**
   * Calculate total from amount and tax
   * @returns {number}
   */
  calculateTotal() {
    return this.amount + this.tax;
  }

  /**
   * Check if status transition is valid
   * @param {string} newStatus - New status to transition to
   * @returns {boolean}
   */
  canTransitionTo(newStatus) {
    const validTransitions = {
      'draft': ['sent', 'cancelled'],
      'sent': ['paid', 'overdue', 'cancelled'],
      'overdue': ['paid', 'cancelled'],
      'paid': [], // Cannot transition from paid
      'cancelled': [] // Cannot transition from cancelled
    };
    
    return validTransitions[this.status]?.includes(newStatus) || false;
  }

  /**
   * Converts the invoice to a JSON representation
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      clientId: this.clientId,
      projectId: this.projectId,
      invoiceNumber: this.invoiceNumber,
      amount: this.amount,
      tax: this.tax,
      total: this.total,
      status: this.status,
      issueDate: this.issueDate,
      dueDate: this.dueDate,
      sentDate: this.sentDate,
      paidDate: this.paidDate,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      clientName: this.clientName,
      projectName: this.projectName,
      itemCount: this.itemCount,
      isOverdue: this.isOverdue()
    };
  }
}

module.exports = Invoice;
