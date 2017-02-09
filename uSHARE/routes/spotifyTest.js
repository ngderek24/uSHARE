var SpotifyApi = require('../spotify-api');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('spotifyTest', { title: 'Spotify API Test' });

  var spotifyApi = new SpotifyApi('211aae652e324de8b0237d55d0fa3030',
                                  '691fdcd98e054278aac41672f119f9dd',
                                  'http://localhost:3000/');
});

module.exports = router;
