// Main router file
// Handles navigation to HTML pages
let express = require('express');
let router = express.Router();

const path = require('path');


// Serve the CardScreen HTML page
// This page is for studying flashcards
router.get('/cardscreen', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'CardScreen.html'));
});

// Serve the CardCreator HTML page
// This page is for creating new flashcards
router.get('/creator', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'CardCreator.html'));
});

// Serve the Login HTML page
// This is the default landing page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'Login.html'));
});

// Serve the Home HTML page
// This page is the main dashboard after login
router.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'Home.html'));
});

// Serve the CardManager HTML page
// This page is for managing existing flashcards
router.get('/manager', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'CardManager.html'));
});
module.exports = router;