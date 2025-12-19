const http = require('http');

function request(path) {
  return new Promise((resolve, reject) => {
    http.get({
      hostname: 'localhost',
      port: 3000,
      path: path,
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    console.log("Checking stats...");
    const stats = await request('/api/stats');
    console.log("Stats response:", stats);
    
    if (stats.totalCards !== undefined && stats.totalDecks !== undefined) {
      console.log("SUCCESS: Stats endpoint returned valid structure.");
    } else {
      console.log("FAILURE: Unexpected stats structure.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
