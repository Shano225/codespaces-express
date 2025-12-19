// Script to verify database schema
// Checks if specific columns exist in tables
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mydata.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('Connected to the database.');
});

// Check if the deck table has the Username column
db.all('PRAGMA table_info(deck)', (err, rows) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('Deck table schema:', rows);
  const hasUsername = rows.some(row => row.name === 'Username');
  console.log('Has Username column:', hasUsername);
});

db.close();
