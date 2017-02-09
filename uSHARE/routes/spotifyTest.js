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

router.get('/create', function(req, res, next) {
  spotifyApi.createPlaylist("122520427", "Does this work", function(error, response, body) {
    console.log("created!");
    console.log(body);
  });
  res.render('spotifyTest', { title: 'Created a playlist!' });
});

module.exports = router;
