/**
 * Create Invoice Data Transfer Object
 * Defines the structure for creating a new invoice
 */
class CreateInvoiceDTO {
  constructor(data) {
    this.clientId = data.clientId || data.client_id;
    this.projectId = data.projectId || data.project_id || null;
    this.invoiceNumber = data.invoiceNumber || data.invoice_number;
    this.amount = data.amount ? parseFloat(data.amount) : 0;
    this.tax = data.tax ? parseFloat(data.tax) : 0;
    this.total = data.total ? parseFloat(data.total) : (parseFloat(data.amount || 0) + parseFloat(data.tax || 0));
    this.status = data.status || 'draft';
    this.issueDate = data.issueDate || data.issue_date || new Date();
    this.dueDate = data.dueDate || data.due_date || null;
    this.notes = data.notes || null;
  }
}

module.exports = CreateInvoiceDTO;
