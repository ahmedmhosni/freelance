/**
 * Create invoice_items table in SQLite database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Creating invoice_items table...\n');

const createTableSQL = `
CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  project_id INTEGER NULL,
  task_id INTEGER NULL,
  description TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL DEFAULT 0,
  hours_worked REAL NULL,
  rate_per_hour REAL NULL,
  amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
)`;

const createIndexes = [
  'CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id)',
  'CREATE INDEX IF NOT EXISTS idx_invoice_items_project_id ON invoice_items(project_id)',
  'CREATE INDEX IF NOT EXISTS idx_invoice_items_task_id ON invoice_items(task_id)'
];

db.serialize(() => {
  // Create table
  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('Error creating table:', err);
      process.exit(1);
    }
    console.log('✓ invoice_items table created');
  });
  
  // Create indexes
  createIndexes.forEach((indexSQL, i) => {
    db.run(indexSQL, (err) => {
      if (err) {
        console.error(`Error creating index ${i + 1}:`, err);
      } else {
        console.log(`✓ Index ${i + 1} created`);
      }
    });
  });
  
  // Verify
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='invoice_items'", (err, row) => {
    if (err) {
      console.error('Error verifying table:', err);
    } else if (row) {
      console.log('\n✓ Table verified successfully!');
      console.log('\nYou can now use the invoice items API endpoints:');
      console.log('  GET    /api/invoices/:invoiceId/items');
      console.log('  POST   /api/invoices/:invoiceId/items');
      console.log('  PUT    /api/invoices/:invoiceId/items/:id');
      console.log('  DELETE /api/invoices/:invoiceId/items/:id');
    } else {
      console.error('✗ Table verification failed');
    }
    
    db.close();
  });
});
