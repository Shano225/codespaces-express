// connect.js (CommonJS)
// Create deck and flashcard tables with a DeckID foreign key on flashcard
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

  // Enable foreign key enforcement in SQLite
  DB.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) {
      console.log('Could not enable foreign keys:', err.message);
    }
  });
});

// SQL to create the deck table first (referenced by flashcard)
const createDeckSQL = `
  CREATE TABLE IF NOT EXISTS deck (
    DeckID INTEGER PRIMARY KEY,
    Name TEXT NOT NULL
  )
`;

// SQL to create the flashcard table with DeckID FK
const createFlashcardSQL = `
  CREATE TABLE IF NOT EXISTS flashcard (
    CardID INTEGER PRIMARY KEY,
    DeckID INTEGER NOT NULL,
    Front TEXT NOT NULL,
    Back TEXT NOT NULL,
    Reaction TEXT NOT NULL,
    FOREIGN KEY (DeckID) REFERENCES deck(DeckID) ON DELETE CASCADE
  )
`;

// Ensure tables are created in order
DB.serialize(() => {
  DB.run(createDeckSQL, (err) => {
    if (err) {
      console.log('Error creating deck table:', err.message);
      return;
    }
    console.log('Deck table is ready.');
  });

  DB.run(createFlashcardSQL, (err) => {
    if (err) {
      console.log('Error creating flashcard table:', err.message);
      return;
    }
    console.log('Flashcard table is ready.');
  });
});

module.exports = { DB };



