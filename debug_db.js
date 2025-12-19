// Script to debug database contents
// Usage: node debug_db.js
const { DB } = require('./connect');
const fs = require('fs');

console.log("Starting debug script...");
const logStream = fs.createWriteStream('debug_output.txt');

// Helper function to log messages to both console and file
function log(msg) {
  console.log(msg);
  logStream.write(msg + '\n');
}

// Main execution block
// Serializes database operations to ensure sequential execution
DB.serialize(() => {
  log("--- Decks ---");
  DB.all("SELECT * FROM deck", (err, rows) => {
    if (err) log("Error fetching decks: " + err);
    else log(JSON.stringify(rows, null, 2));
  });

  log("--- Flashcards ---");
  DB.all("SELECT CardID, DeckID, Front, Back FROM flashcard", (err, rows) => {
    if (err) log("Error fetching flashcards: " + err);
    else log(JSON.stringify(rows, null, 2));
    
    // Close the database connection to allow the script to exit
    DB.close((err) => {
      if (err) log("Error closing DB: " + err);
      else log("Database connection closed.");
      logStream.end();
    });
  });
});
