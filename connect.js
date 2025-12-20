// connect.js (CommonJS)
// Create deck and flashcard tables with a DeckID foreign key on flashcard
const sqlite3 = require("sqlite3");
const sql3 = sqlite3.verbose();

// Open (or create) the local SQLite database file `mydata.db`.
// Flags: read/write and create if it does not exist.
const DB = new sql3.Database(
  "./mydata.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  function connected(err) {
    if (err) {
      console.log("Connection error:", err.message);
      return;
    }
    console.log("Connected to the database.");

    // Enable foreign key enforcement in SQLite
    DB.run("PRAGMA foreign_keys = ON", (err) => {
      if (err) {
        console.log("Could not enable foreign keys:", err.message);
      }
    });
  }
);

// SQL to create the deck table first (referenced by flashcard)
const createDeckSQL = `
  CREATE TABLE IF NOT EXISTS deck (
    DeckID INTEGER PRIMARY KEY,
    Name TEXT NOT NULL,
    Username TEXT
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
      console.log("Error creating deck table:", err.message);
      return;
    }
    console.log("Deck table is ready.");
  });

  DB.run(createFlashcardSQL, (err) => {
    if (err) {
      console.log("Error creating flashcard table:", err.message);
      return;
    }
    console.log("Flashcard table is ready.");

    ensureDeckColumnExists();
    ensureDeckUsernameColumnExists();

    // Create users table for registrations (Username unique, store password hash)
    const createUsersSQL = `
      CREATE TABLE IF NOT EXISTS users (
        UserID INTEGER PRIMARY KEY,
        Username TEXT NOT NULL UNIQUE,
        PasswordHash TEXT NOT NULL
      )
    `;
    DB.run(createUsersSQL, (usersErr) => {
      if (usersErr) {
        console.log("Error creating users table:", usersErr.message);
        return;
      }
      console.log("Users table is ready.");
    });
  });
});

// Helper function to ensure the Username column exists in the deck table
function ensureDeckUsernameColumnExists() {
  DB.all('PRAGMA table_info(deck)', (err, rows) => {
    if (err) {
      console.log('Failed to inspect deck table:', err.message);
      return;
    }

    const hasUsernameColumn = rows.some(
      (row) => String(row.name).toLowerCase() === 'username'
    );

    if (!hasUsernameColumn) {
      DB.run(
        'ALTER TABLE deck ADD COLUMN Username TEXT',
        (alterErr) => {
          if (alterErr) {
            console.log('Could not add Username column to deck table:', alterErr.message);
            return;
          }
          console.log('Username column added to deck table.');
        }
      );
    }
  });
}

// Helper function to ensure the DeckID column exists in the flashcard table
// Adds the column if it's missing and sets a default value
function ensureDeckColumnExists() {
  DB.all("PRAGMA table_info(flashcard)", (err, rows) => {
    if (err) {
      console.log("Failed to inspect flashcard table:", err.message);
      return;
    }

    const hasDeckColumn = rows.some(
      (row) => String(row.name).toLowerCase() === "deckid"
    );

    if (!hasDeckColumn) {
      DB.run(
        "ALTER TABLE flashcard ADD COLUMN DeckID INTEGER NOT NULL DEFAULT 1",
        (alterErr) => {
          if (alterErr) {
            console.log("Could not add DeckID column:", alterErr.message);
            return;
          }
          console.log("DeckID column added to flashcard table.");
          ensureDefaultDeck();
        }
      );
    } else {
      ensureDefaultDeck();
    }
  });
}

// Helper function to ensure a default deck exists
// Creates a "General" deck if no deck with ID 1 exists
function ensureDefaultDeck() {
  const defaultDeckName = "General";
  DB.get("SELECT DeckID FROM deck WHERE DeckID = 1", (err, row) => {
    if (err) {
      console.log("Failed to read default deck:", err.message);
      return;
    }

    if (!row) {
      DB.run(
        "INSERT INTO deck (DeckID, Name) VALUES (1, ?)",
        [defaultDeckName],
        (insertErr) => {
          if (insertErr) {
            console.log("Could not create default deck:", insertErr.message);
            return;
          }
          console.log("Default deck created.");
          assignDeckToOrphanCards();
        }
      );
    } else {
      assignDeckToOrphanCards();
    }
  });
}

// Helper function to assign orphan cards to the default deck
// Updates cards with null or empty DeckID to belong to deck 1
function assignDeckToOrphanCards() {
  DB.run(
    'UPDATE flashcard SET DeckID = 1 WHERE DeckID IS NULL OR DeckID = ""',
    (err) => {
      if (err) {
        console.log("Failed to assign deck to existing cards:", err.message);
      }
    }
  );
}

module.exports = { DB };
