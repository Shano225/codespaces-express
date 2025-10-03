let express = require('express');
let router = express.Router();

const path = require('path');


router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'CardScreen.html'));
});

router.get('/creator', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'CardCreator.html'));
});


router.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'Home.html'));
});
module.exports = router;