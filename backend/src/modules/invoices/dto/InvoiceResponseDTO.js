/**
 * Invoice Response Data Transfer Object
 * Defines the structure for invoice API responses
 */
class InvoiceResponseDTO {
  constructor(invoice) {
    this.id = invoice.id;
    this.userId = invoice.userId || invoice.user_id;
    this.clientId = invoice.clientId || invoice.client_id;
    this.projectId = invoice.projectId || invoice.project_id;
    this.invoiceNumber = invoice.invoiceNumber || invoice.invoice_number;
    this.amount = parseFloat(invoice.amount);
    this.tax = parseFloat(invoice.tax);
    this.total = parseFloat(invoice.total);
    this.status = invoice.status;
    this.issueDate = invoice.issueDate || invoice.issue_date;
    this.dueDate = invoice.dueDate || invoice.due_date;
    this.sentDate = invoice.sentDate || invoice.sent_date;
    this.paidDate = invoice.paidDate || invoice.paid_date;
    this.notes = invoice.notes;
    this.createdAt = invoice.createdAt || invoice.created_at;
    this.updatedAt = invoice.updatedAt || invoice.updated_at;
    
    // Include relationship data if available
    if (invoice.clientName || invoice.client_name) {
      this.clientName = invoice.clientName || invoice.client_name;
    }
    if (invoice.projectName || invoice.project_name) {
      this.projectName = invoice.projectName || invoice.project_name;
    }
    if (invoice.itemCount !== undefined || invoice.item_count !== undefined) {
      this.itemCount = invoice.itemCount || invoice.item_count;
    }
    
    // Include computed properties
    this.isOverdue = invoice.isOverdue ? invoice.isOverdue() : false;
  }
}

module.exports = InvoiceResponseDTO;
