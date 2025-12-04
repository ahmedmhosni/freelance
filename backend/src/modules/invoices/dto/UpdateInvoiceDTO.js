/**
 * Update Invoice Data Transfer Object
 * Defines the structure for updating an existing invoice
 */
class UpdateInvoiceDTO {
  constructor(data) {
    // Only include fields that are being updated
    if (data.clientId !== undefined) this.clientId = data.clientId;
    if (data.client_id !== undefined) this.clientId = data.client_id;
    if (data.projectId !== undefined) this.projectId = data.projectId;
    if (data.project_id !== undefined) this.projectId = data.project_id;
    if (data.invoiceNumber !== undefined) this.invoiceNumber = data.invoiceNumber;
    if (data.invoice_number !== undefined) this.invoiceNumber = data.invoice_number;
    if (data.amount !== undefined) this.amount = parseFloat(data.amount);
    if (data.tax !== undefined) this.tax = parseFloat(data.tax);
    if (data.total !== undefined) this.total = parseFloat(data.total);
    if (data.status !== undefined) this.status = data.status;
    if (data.issueDate !== undefined) this.issueDate = data.issueDate;
    if (data.issue_date !== undefined) this.issueDate = data.issue_date;
    if (data.dueDate !== undefined) this.dueDate = data.dueDate;
    if (data.due_date !== undefined) this.dueDate = data.due_date;
    if (data.sentDate !== undefined) this.sentDate = data.sentDate;
    if (data.sent_date !== undefined) this.sentDate = data.sent_date;
    if (data.paidDate !== undefined) this.paidDate = data.paidDate;
    if (data.paid_date !== undefined) this.paidDate = data.paid_date;
    if (data.notes !== undefined) this.notes = data.notes;
  }
}

module.exports = UpdateInvoiceDTO;
