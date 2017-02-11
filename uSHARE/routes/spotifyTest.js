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

router.get('/add', function(req, res, next) {
  spotifyApi.addTrack("122520427", "2pzrhY3Hb4Jn3Xj7RDEHlp", "spotify:track:4iV5W9uYEdYUVa79Axb7Rh", function(error, response, body) {
    console.log("track added!");
    console.log(body);
  });
  res.render('spotifyTest', { title: 'Added a track!' });
});

module.exports = router;
