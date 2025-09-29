var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Render the `test` view with a title variable available to the template
  res.render('test', { title: 'test' });
});

module.exports = router;