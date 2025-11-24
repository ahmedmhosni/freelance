/**
 * Generate next invoice number based on existing invoices
 * @param {Array} existingInvoices - Array of existing invoices
 * @param {String} prefix - Invoice number prefix (default: 'INV')
 * @param {Number} padding - Number of digits to pad (default: 4)
 * @returns {String} Next invoice number (e.g., 'INV-0001')
 */
export const generateInvoiceNumber = (existingInvoices = [], prefix = 'INV', padding = 4) => {
  if (!existingInvoices || existingInvoices.length === 0) {
    return `${prefix}-${'1'.padStart(padding, '0')}`;
  }

  // Extract numbers from existing invoice numbers
  const numbers = existingInvoices
    .map(inv => {
      if (!inv.invoice_number) return 0;
      
      // Extract number from format like "INV-0001" or "INV-001" or just "001"
      const match = inv.invoice_number.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(num => !isNaN(num));

  // Get the highest number
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  
  // Generate next number
  const nextNumber = maxNumber + 1;
  
  return `${prefix}-${String(nextNumber).padStart(padding, '0')}`;
};

/**
 * Validate invoice number format
 * @param {String} invoiceNumber - Invoice number to validate
 * @returns {Boolean} True if valid
 */
export const validateInvoiceNumber = (invoiceNumber) => {
  if (!invoiceNumber || typeof invoiceNumber !== 'string') {
    return false;
  }
  
  // Allow formats like: INV-0001, INV-001, 0001, etc.
  const pattern = /^[A-Z]{0,10}-?\d{1,10}$/;
  return pattern.test(invoiceNumber);
};

/**
 * Check if invoice number already exists
 * @param {String} invoiceNumber - Invoice number to check
 * @param {Array} existingInvoices - Array of existing invoices
 * @param {Number} excludeId - ID to exclude from check (for editing)
 * @returns {Boolean} True if exists
 */
export const invoiceNumberExists = (invoiceNumber, existingInvoices, excludeId = null) => {
  return existingInvoices.some(inv => 
    inv.invoice_number === invoiceNumber && inv.id !== excludeId
  );
};

/**
 * Get invoice number suggestions based on pattern
 * @param {Array} existingInvoices - Array of existing invoices
 * @returns {Array} Array of suggested invoice numbers
 */
export const getInvoiceNumberSuggestions = (existingInvoices = []) => {
  const suggestions = [];
  
  // Current year format
  const year = new Date().getFullYear();
  const yearShort = year.toString().slice(-2);
  
  suggestions.push(generateInvoiceNumber(existingInvoices, 'INV', 4));
  suggestions.push(generateInvoiceNumber(existingInvoices, `INV-${year}`, 3));
  suggestions.push(generateInvoiceNumber(existingInvoices, `${yearShort}`, 4));
  
  return suggestions;
};
