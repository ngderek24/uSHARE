var express = require('express');
var router = express.Router();

// TODO: fix spotify url endpoint
// TODO: pass template the approriate links based on user login status
var links = [
  				{ name:"Login via Spotify",
  				  endpoint: "/auth" }
  			] 

router.get('/', function(req, res, next) {
  res.render('index', { title: 'uSHARE',
  						links: links
  					});
});

module.exports = router;
