/**
 * Financial Report Domain Model
 */
class FinancialReport {
  constructor(data) {
    this.totalInvoices = data.totalInvoices || 0;
    this.totalRevenue = data.totalRevenue || 0;
    this.pendingAmount = data.pendingAmount || 0;
    this.overdueAmount = data.overdueAmount || 0;
    this.byStatus = data.byStatus || {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0
    };
    this.invoices = data.invoices || [];
  }

  toJSON() {
    return {
      totalInvoices: this.totalInvoices,
      totalRevenue: this.totalRevenue,
      pendingAmount: this.pendingAmount,
      overdueAmount: this.overdueAmount,
      byStatus: this.byStatus,
      invoices: this.invoices
    };
  }
}

module.exports = FinancialReport;
