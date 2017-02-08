var express = require('express');
var router = express.Router();

// TODO: fix spotify url endpoint
// TODO: pass template the approriate links based on user login status
var links = [
  				{ name:"Login via Spotify",
  				  endpoint: "/auth" }
  			] 

var dummy_tracks = [
											{ id: 123,
												name: "Silver Lining",
												artist: "Oddisee"
											},
											{ id: 234123,
												name: "All the Secrets",
												artist: "Flying Lotus"
											}
									]

router.get('/', function(req, res, next) {
  res.render('room', { title: 'uSHARE',
  						links: links,
  						tracks: JSON.stringify(dummy_tracks),
  						role: "guest",
  						uid: 123243434
  					});
});

module.exports = router;
