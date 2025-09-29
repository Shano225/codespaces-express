// connect.js (CommonJS)
const sqlite3 = require('sqlite3');
const sql3 = sqlite3.verbose();

// Open (or create) the local SQLite database file `mydata.db`.
// Flags: read/write and create if it does not exist.
const DB = new sql3.Database('./mydata.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function connected(err) {
  if (err) {
    console.log('Connection error:', err.message);
    return;
  }
  console.log('Connected to the database.');
});

// Ensure the flashcard table exists. Columns: CardID (PK), Front, Back, Reaction.
let sql = `
  CREATE TABLE IF NOT EXISTS flashcard (
    CardID INTEGER PRIMARY KEY,
    Front TEXT NOT NULL,
    Back TEXT NOT NULL,
    Reaction TEXT NOT NULL
  )
`;

DB.run(sql, (err) => {
  if (err) {
    console.log('Error creating flashcard table:', err.message);
    return;
  }
  console.log('Flashcard table is ready.');
});

module.exports = { DB };



