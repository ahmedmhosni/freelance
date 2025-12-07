const PDFDocument = require('pdfkit');
const logger = require('../utils/logger');

/**
 * PDF Generation Service
 * Handles PDF generation for invoices
 */
class PDFService {
  /**
   * Generate invoice PDF
   * @param {Object} invoice - Invoice data
   * @param {Object} client - Client data
   * @param {Array} items - Invoice items
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateInvoicePDF(invoice, client, items = []) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];

        // Collect PDF data
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Header
        this.generateHeader(doc, invoice);
        
        // Client information
        this.generateClientInfo(doc, client);
        
        // Invoice details
        this.generateInvoiceDetails(doc, invoice);
        
        // Line items table
        if (items && items.length > 0) {
          this.generateItemsTable(doc, items);
        }
        
        // Totals
        this.generateTotals(doc, invoice, items);
        
        // Footer
        this.generateFooter(doc, invoice);

        // Finalize PDF
        doc.end();
      } catch (error) {
        logger.error('Error generating PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Generate PDF header
   */
  generateHeader(doc, invoice) {
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('INVOICE', 50, 50)
      .fontSize(10)
      .font('Helvetica')
      .text(`Invoice #: ${invoice.invoice_number}`, 50, 80)
      .moveDown();
  }

  /**
   * Generate client information section
   */
  generateClientInfo(doc, client) {
    const startY = 120;
    
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Bill To:', 50, startY)
      .font('Helvetica')
      .fontSize(10)
      .text(client.name || 'N/A', 50, startY + 20)
      .text(client.email || '', 50, startY + 35);
    
    if (client.phone) {
      doc.text(client.phone, 50, startY + 50);
    }
    
    if (client.address) {
      doc.text(client.address, 50, startY + 65);
    }
  }

  /**
   * Generate invoice details section
   */
  generateInvoiceDetails(doc, invoice) {
    const startY = 120;
    const rightX = 350;
    
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Invoice Date:', rightX, startY)
      .font('Helvetica')
      .text(this.formatDate(invoice.issue_date), rightX + 100, startY)
      .font('Helvetica-Bold')
      .text('Due Date:', rightX, startY + 20)
      .font('Helvetica')
      .text(this.formatDate(invoice.due_date), rightX + 100, startY + 20)
      .font('Helvetica-Bold')
      .text('Status:', rightX, startY + 40)
      .font('Helvetica')
      .text(this.formatStatus(invoice.status), rightX + 100, startY + 40);
  }

  /**
   * Generate items table
   */
  generateItemsTable(doc, items) {
    const tableTop = 250;
    const itemCodeX = 50;
    const descriptionX = 150;
    const quantityX = 350;
    const priceX = 420;
    const amountX = 490;

    // Table header
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Item', itemCodeX, tableTop)
      .text('Description', descriptionX, tableTop)
      .text('Qty', quantityX, tableTop)
      .text('Price', priceX, tableTop)
      .text('Amount', amountX, tableTop);

    // Draw header line
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Table rows
    let y = tableTop + 25;
    doc.font('Helvetica').fontSize(9);

    items.forEach((item, index) => {
      // Check if we need a new page
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      const amount = (item.quantity || 0) * (item.unit_price || 0);

      doc
        .text(item.description || `Item ${index + 1}`, itemCodeX, y, { width: 90 })
        .text(item.notes || '-', descriptionX, y, { width: 190 })
        .text((item.quantity || 0).toString(), quantityX, y)
        .text(this.formatCurrency(item.unit_price || 0), priceX, y)
        .text(this.formatCurrency(amount), amountX, y);

      y += 25;
    });

    // Draw bottom line
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();

    return y + 20;
  }

  /**
   * Generate totals section
   */
  generateTotals(doc, invoice, items) {
    const startY = items && items.length > 0 ? 500 : 350;
    const rightX = 400;

    // Calculate subtotal from items if available
    let subtotal = 0;
    if (items && items.length > 0) {
      subtotal = items.reduce((sum, item) => {
        return sum + ((item.quantity || 0) * (item.unit_price || 0));
      }, 0);
    } else {
      subtotal = invoice.amount || 0;
    }

    const tax = invoice.tax || 0;
    const total = subtotal + tax;

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Subtotal:', rightX, startY)
      .text(this.formatCurrency(subtotal), rightX + 100, startY, { align: 'right' });

    if (tax > 0) {
      doc
        .text('Tax:', rightX, startY + 20)
        .text(this.formatCurrency(tax), rightX + 100, startY + 20, { align: 'right' });
    }

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Total:', rightX, startY + 40)
      .text(this.formatCurrency(total), rightX + 100, startY + 40, { align: 'right' });
  }

  /**
   * Generate footer
   */
  generateFooter(doc, invoice) {
    const bottomY = 700;

    if (invoice.notes) {
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Notes:', 50, bottomY)
        .font('Helvetica')
        .fontSize(9)
        .text(invoice.notes, 50, bottomY + 15, { width: 500 });
    }

    // Page number
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .text(
          `Page ${i + 1} of ${pages.count}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
    }
  }

  /**
   * Format date
   */
  formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  /**
   * Format status
   */
  formatStatus(status) {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

module.exports = new PDFService();
