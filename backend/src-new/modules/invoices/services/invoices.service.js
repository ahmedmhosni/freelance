/**
 * Invoices Service
 */

const invoicesRepository = require('../repositories/invoices.repository');

class InvoicesService {
  async getAll(userId, filters = {}) {
    return await invoicesRepository.findByUserId(userId, filters);
  }

  async getById(invoiceId, userId) {
    const invoice = await invoicesRepository.findById(invoiceId);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    return invoice;
  }

  async create(invoiceData, userId) {
    // Calculate total
    const total = this.calculateTotal(invoiceData.items);
    
    return await invoicesRepository.create({
      ...invoiceData,
      user_id: userId,
      total,
      status: invoiceData.status || 'draft'
    });
  }

  async update(invoiceId, invoiceData, userId) {
    await this.getById(invoiceId, userId);
    
    // Recalculate total if items changed
    if (invoiceData.items) {
      invoiceData.total = this.calculateTotal(invoiceData.items);
    }
    
    return await invoicesRepository.update(invoiceId, invoiceData);
  }

  async delete(invoiceId, userId) {
    await this.getById(invoiceId, userId);
    return await invoicesRepository.delete(invoiceId);
  }

  async updateStatus(invoiceId, status, userId) {
    await this.getById(invoiceId, userId);
    return await invoicesRepository.updateStatus(invoiceId, status);
  }

  async generatePDF(invoiceId, userId) {
    const invoice = await this.getById(invoiceId, userId);
    // TODO: Implement PDF generation
    return Buffer.from('PDF content');
  }

  calculateTotal(items) {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  }
}

module.exports = new InvoicesService();
