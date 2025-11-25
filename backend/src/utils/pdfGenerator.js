const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = async (invoice, client, user, items = []) => {
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
      doc.fontSize(24).fillColor('#2E3440').text('INVOICE', 50, 50);
      doc.fontSize(10).fillColor('#4C566A').text(user.name || 'Your Business', 50, 85);
      doc.text(user.email, 50, 100);

      // Invoice details (right side)
      doc.fontSize(10).fillColor('#4C566A');
      doc.text(`Invoice #: ${invoice.invoice_number}`, 400, 50);
      doc.text(`Issue Date: ${invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : new Date(invoice.created_at).toLocaleDateString()}`, 400, 65);
      doc.text(`Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}`, 400, 80);
      doc.fontSize(9).fillColor('#FFFFFF').rect(400, 95, 80, 18).fill('#5E81AC');
      doc.text(`${invoice.status.toUpperCase()}`, 405, 99, { width: 70, align: 'center' });

      // Line separator
      doc.moveTo(50, 130).lineTo(550, 130).strokeColor('#E5E9F0').stroke();

      // Bill To section
      doc.fontSize(11).fillColor('#2E3440').text('BILL TO:', 50, 150);
      doc.fontSize(10).fillColor('#4C566A');
      doc.text(client.name, 50, 170);
      if (client.company) doc.text(client.company, 50, 185);
      if (client.email) doc.text(client.email, 50, 200);
      if (client.phone) doc.text(`Phone: ${client.phone}`, 50, 215);

      // Items table
      let tableTop = 260;
      
      // Table header
      doc.fontSize(9).fillColor('#FFFFFF');
      doc.rect(50, tableTop, 500, 20).fill('#5E81AC');
      doc.text('DESCRIPTION', 55, tableTop + 6);
      doc.text('QTY/HRS', 320, tableTop + 6);
      doc.text('RATE', 390, tableTop + 6);
      doc.text('AMOUNT', 480, tableTop + 6);

      tableTop += 25;
      doc.fillColor('#2E3440');

      // Table rows
      if (items && items.length > 0) {
        items.forEach((item, index) => {
          const bgColor = index % 2 === 0 ? '#FFFFFF' : '#F8F9FA';
          doc.rect(50, tableTop, 500, 35).fill(bgColor);
          
          doc.fontSize(9).fillColor('#2E3440');
          
          // Description with project/task info
          let description = item.description;
          if (item.project_name || item.task_name) {
            description += `\n${item.project_name || ''}${item.project_name && item.task_name ? ' - ' : ''}${item.task_name || ''}`;
          }
          doc.text(description, 55, tableTop + 5, { width: 250, height: 30 });
          
          // Quantity/Hours
          const qty = item.hours_worked || item.quantity || 1;
          doc.text(parseFloat(qty).toFixed(2), 320, tableTop + 10);
          
          // Rate
          const rate = item.rate_per_hour || item.unit_price || 0;
          doc.text(`$${parseFloat(rate).toFixed(2)}`, 390, tableTop + 10);
          
          // Amount
          doc.text(`$${parseFloat(item.amount).toFixed(2)}`, 480, tableTop + 10);
          
          tableTop += 35;
        });
      } else {
        // Fallback if no items
        doc.fontSize(9).fillColor('#2E3440');
        doc.text(invoice.notes || 'Services Rendered', 55, tableTop + 5);
        doc.text(`$${parseFloat(invoice.amount || 0).toFixed(2)}`, 480, tableTop + 5);
        tableTop += 30;
      }

      // Totals section
      tableTop += 10;
      doc.moveTo(50, tableTop).lineTo(550, tableTop).strokeColor('#E5E9F0').stroke();
      tableTop += 15;

      const subtotal = parseFloat(invoice.amount || 0);
      const tax = parseFloat(invoice.tax || 0);
      const total = parseFloat(invoice.total || invoice.amount || 0);

      doc.fontSize(10).fillColor('#4C566A');
      doc.text('Subtotal:', 400, tableTop);
      doc.text(`$${subtotal.toFixed(2)}`, 480, tableTop);
      
      if (tax > 0) {
        tableTop += 20;
        doc.text('Tax:', 400, tableTop);
        doc.text(`$${tax.toFixed(2)}`, 480, tableTop);
      }

      tableTop += 25;
      doc.moveTo(400, tableTop).lineTo(550, tableTop).strokeColor('#E5E9F0').stroke();
      tableTop += 10;
      
      doc.fontSize(12).fillColor('#2E3440');
      doc.text('TOTAL:', 400, tableTop);
      doc.text(`$${total.toFixed(2)}`, 480, tableTop);

      // Notes section
      if (invoice.notes) {
        tableTop += 40;
        doc.fontSize(10).fillColor('#2E3440').text('Notes:', 50, tableTop);
        doc.fontSize(9).fillColor('#4C566A').text(invoice.notes, 50, tableTop + 15, { width: 500 });
      }

      // Footer
      doc.fontSize(8).fillColor('#8FBCBB').text('Thank you for your business!', 50, 720, { align: 'center', width: 500 });

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
