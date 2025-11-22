const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = async (invoice, client, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `invoice-${invoice.invoice_number}.pdf`;
      const filePath = path.join(__dirname, '../../invoices', fileName);

      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('INVOICE', 50, 50);
      doc.fontSize(10).text(user.name, 50, 80);
      doc.text(user.email, 50, 95);

      // Invoice details
      doc.fontSize(10).text(`Invoice #: ${invoice.invoice_number}`, 400, 50);
      doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 400, 65);
      doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 400, 80);
      doc.text(`Status: ${invoice.status.toUpperCase()}`, 400, 95);

      // Line
      doc.moveTo(50, 120).lineTo(550, 120).stroke();

      // Bill To
      doc.fontSize(12).text('Bill To:', 50, 140);
      doc.fontSize(10).text(client.name, 50, 160);
      if (client.company) doc.text(client.company, 50, 175);
      if (client.email) doc.text(client.email, 50, 190);
      if (client.phone) doc.text(client.phone, 50, 205);

      // Items table header
      const tableTop = 250;
      doc.fontSize(10).text('Description', 50, tableTop);
      doc.text('Amount', 450, tableTop);
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Items
      doc.text(invoice.notes || 'Services Rendered', 50, tableTop + 25);
      doc.text(`$${parseFloat(invoice.amount).toFixed(2)}`, 450, tableTop + 25);

      // Total
      doc.moveTo(50, tableTop + 60).lineTo(550, tableTop + 60).stroke();
      doc.fontSize(12).text('Total:', 350, tableTop + 75);
      doc.text(`$${parseFloat(invoice.amount).toFixed(2)}`, 450, tableTop + 75);

      // Footer
      doc.fontSize(8).text('Thank you for your business!', 50, 700, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF };
