var SpotifyApi = require('../spotify-api');
var express = require('express');
var router = express.Router();

var spotifyApi = new SpotifyApi();
spotifyApi.setup();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('spotifyTest', { title: 'Spotify API Test' });
});

router.get('/login', spotifyApi.promptLogin);
router.get('/callback', spotifyApi.requestAccessToken);

module.exports = router;
