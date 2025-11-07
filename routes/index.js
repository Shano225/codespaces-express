let express = require('express');
let router = express.Router();

const path = require('path');


router.get('/cardscreen', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'CardScreen.html'));
});

router.get('/creator', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'CardCreator.html'));
});





router.get('/', (req, res) => {


  res.sendFile(path.join(__dirname, '..', 'public', 'Home.html'));
});
router.get('/manager', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'CardManager.html'));
});
module.exports = router;