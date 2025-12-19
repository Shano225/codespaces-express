// app.js
app.post('/api/decks', (req, res) => {
  const { Name, Username } = req.body; // Now accepts Username
  
  if (!Name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  // Insert with owner info
  const sql = 'INSERT INTO deck (Name, Username) VALUES (?, ?)';
  
  DB.run(sql, [Name, Username], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    
    res.status(201).json({ 
      message: 'Deck created', 
      DeckID: this.lastID, 
      deck: { DeckID: this.lastID, Name } 
    });
  });
});
