/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without extension)
 * @param {Array} columns - Optional array of column definitions [{key: 'id', label: 'ID'}, ...]
 */
export const exportToCSV = (data, filename, columns = null) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // If columns not provided, use all keys from first object
  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));

  // Create CSV header
  const header = cols.map(col => `"${col.label}"`).join(',');

  // Create CSV rows
  const rows = data.map(row => {
    return cols.map(col => {
      let value = row[col.key];
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '""';
      }
      
      // Handle dates
      if (value instanceof Date) {
        value = value.toISOString();
      }
      
      // Handle objects/arrays
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Escape quotes and wrap in quotes
      value = String(value).replace(/"/g, '""');
      return `"${value}"`;
    }).join(',');
  });

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export clients to CSV
 */
export const exportClientsCSV = (clients) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'company', label: 'Company' },
    { key: 'notes', label: 'Notes' },
    { key: 'created_at', label: 'Created Date' }
  ];
  exportToCSV(clients, 'clients', columns);
};

/**
 * Export projects to CSV
 */
export const exportProjectsCSV = (projects) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Project Name' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'budget', label: 'Budget' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
    { key: 'created_at', label: 'Created Date' }
  ];
  exportToCSV(projects, 'projects', columns);
};

/**
 * Export tasks to CSV
 */
export const exportTasksCSV = (tasks) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Task Title' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'created_at', label: 'Created Date' }
  ];
  exportToCSV(tasks, 'tasks', columns);
};

/**
 * Export invoices to CSV
 */
export const exportInvoicesCSV = (invoices) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'invoice_number', label: 'Invoice Number' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'sent_date', label: 'Sent Date' },
    { key: 'paid_date', label: 'Paid Date' },
    { key: 'notes', label: 'Notes' },
    { key: 'created_at', label: 'Created Date' }
  ];
  exportToCSV(invoices, 'invoices', columns);
};

/**
 * Export time entries to CSV
 */
export const exportTimeEntriesCSV = (entries) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'description', label: 'Description' },
    { key: 'start_time', label: 'Start Time' },
    { key: 'end_time', label: 'End Time' },
    { key: 'duration', label: 'Duration (minutes)' },
    { key: 'created_at', label: 'Created Date' }
  ];
  exportToCSV(entries, 'time_entries', columns);
};
