/**
 * Invoice Item Response DTO
 * Formats invoice item data for API responses
 */
class InvoiceItemResponseDTO {
  constructor(invoiceItem) {
    this.id = invoiceItem.id;
    this.invoice_id = invoiceItem.invoiceId;
    this.project_id = invoiceItem.projectId;
    this.task_id = invoiceItem.taskId;
    this.description = invoiceItem.description;
    this.quantity = invoiceItem.quantity;
    this.unit_price = invoiceItem.unitPrice;
    this.hours_worked = invoiceItem.hoursWorked;
    this.rate_per_hour = invoiceItem.ratePerHour;
    this.amount = invoiceItem.amount;
    this.created_at = invoiceItem.createdAt;
    this.project_name = invoiceItem.projectName;
    this.task_name = invoiceItem.taskTitle;
    this.type = invoiceItem.isHourly() ? 'hourly' : 'fixed';
  }
}

module.exports = InvoiceItemResponseDTO;
