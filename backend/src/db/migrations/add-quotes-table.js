const { db } = require('../database');

console.log('Adding quotes table...');

// Create quotes table
db.run(`
  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    author TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Error creating quotes table:', err);
    process.exit(1);
  }
  
  console.log('✓ Quotes table created');

  // Check if we need to insert default quotes
  db.get('SELECT COUNT(*) as count FROM quotes', [], (err, row) => {
    if (err) {
      console.error('Error checking quotes:', err);
      process.exit(1);
    }

    if (row.count === 0) {
      console.log('Inserting default quotes...');
      
      const quotes = [
        ['Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill'],
        ['The only way to do great work is to love what you do.', 'Steve Jobs'],
        ['Productivity is never an accident. It is always the result of a commitment to excellence.', 'Paul J. Meyer'],
        ['Focus on being productive instead of busy.', 'Tim Ferriss'],
        ['The key is not to prioritize what\'s on your schedule, but to schedule your priorities.', 'Stephen Covey'],
        ['Don\'t watch the clock; do what it does. Keep going.', 'Sam Levenson'],
        ['The way to get started is to quit talking and begin doing.', 'Walt Disney'],
        ['Your time is limited, don\'t waste it living someone else\'s life.', 'Steve Jobs'],
        ['The future depends on what you do today.', 'Mahatma Gandhi'],
        ['Quality is not an act, it is a habit.', 'Aristotle']
      ];

      const stmt = db.prepare('INSERT INTO quotes (text, author, is_active) VALUES (?, ?, 1)');
      
      let completed = 0;
      quotes.forEach(([text, author]) => {
        stmt.run(text, author, (err) => {
          if (err) {
            console.error('Error inserting quote:', err);
          }
          completed++;
          if (completed === quotes.length) {
            stmt.finalize();
            console.log(`✓ ${quotes.length} default quotes inserted`);
            console.log('Migration completed successfully!');
            process.exit(0);
          }
        });
      });
    } else {
      console.log(`✓ Quotes already exist (${row.count} quotes found)`);
      console.log('Migration completed successfully!');
      process.exit(0);
    }
  });
});
