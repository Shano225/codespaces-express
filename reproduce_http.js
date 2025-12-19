// Script to reproduce issues using HTTP requests
// Simulates a client interacting with the API
const http = require('http');
const fs = require('fs');
const logStream = fs.createWriteStream('http_result.txt');

// Helper function to log messages to both console and file
function log(msg) {
  console.log(msg);
  logStream.write((typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg) + '\n');
}

// Helper function to make HTTP requests
// Returns a promise that resolves with the response status and body
function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Main execution function
// Runs a sequence of HTTP requests to test the API
async function run() {
  try {
    log("Creating deck...");
    const deckRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/decks',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { Name: 'Test Deck HTTP', Username: 'tester' });

    log("Deck response:", deckRes.body);
    const deckId = deckRes.body.DeckID;

    if (!deckId) {
      log("Failed to create deck");
      return;
    }

    log(`Creating card in deck ${deckId}...`);
    const cardRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { Front: 'F', Back: 'B', Reaction: 'good', DeckID: deckId });

    log("Card response:", cardRes.body);
    const cardId = cardRes.body.CardID;

    if (!cardId) {
      log("Failed to create card");
      return;
    }

    log(`Fetching card ${cardId}...`);
    const getRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/${cardId}`,
      method: 'GET'
    });

    log("Get card response:", getRes.body);
    
    if (getRes.body.flashcard.DeckID === deckId) {
      log("SUCCESS: DeckID matches.");
    } else {
      log(`FAILURE: Expected DeckID ${deckId}, got ${getRes.body.flashcard.DeckID}`);
    }

  } catch (err) {
    log("Error: " + err);
  }
}

run();
