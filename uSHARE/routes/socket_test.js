var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('socket_test', { title: 'Testing Socket.IO connection' });
});

module.exports = router;
