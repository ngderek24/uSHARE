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
  spotifyApi.createPlaylist("Does this work", function(error, response, body) {
    console.log(body);
    if (error) {
      console.log(error);
      res.render('spotifyTest', { title: 'Error creating a playlist!' });
    } else {
      res.render('spotifyTest', { title: 'Created a playlist!' });
    }
  });
});

router.get('/add', function(req, res, next) {
  spotifyApi.addTrack("2pzrhY3Hb4Jn3Xj7RDEHlp", "spotify:track:4iV5W9uYEdYUVa79Axb7Rh", function(error, response, body) {
    console.log(body);
    if (error) {
      console.log(error);
      res.render('spotifyTest', { title: 'Error adding a track!' });
    } else {
      res.render('spotifyTest', { title: 'Added a track!' });
    }
  });
});

router.get('/search', function(req, res, next) {
  spotifyApi.searchTrack("blah", function(error, response, body) {
    console.log(body);
    if (error) {
      console.log(error);
      res.render('spotifyTest', { title: 'Error searching!' });
    } else {
      res.render('spotifyTest', { title: 'Searched!' });
    }
  });
});

router.get('/playlists', function(req, res, next) {
  spotifyApi.getPlaylists(function(error, response, body) {
    console.log(body);
    if (error) {
      console.log(error);
      res.render('spotifyTest', { title: 'Error getting playlists!' });
    } else {
      res.render('spotifyTest', { title: 'Got playlists!' });
    }
  });
});

router.get('/playlist', function(req, res, next) {
  spotifyApi.getPlaylist('5wajVUSkYKyZSYhphpkNh3', function(error, response, body) {
    console.log(body);
    if (error) {
      console.log(error);
      res.render('spotifyTest', { title: 'Error getting playlist!' });
    } else {
      res.render('spotifyTest', { title: 'Got playlist!' });
    }
  });
});

router.get('/remove', function(req, res, next) {
  spotifyApi.removeTrack('2pzrhY3Hb4Jn3Xj7RDEHlp', "spotify:track:4iV5W9uYEdYUVa79Axb7Rh", function(error, response, body) {
    console.log(body);
    if (error) {
      console.log(error);
      res.render('spotifyTest', { title: 'Error removing track!' });
    } else {
      res.render('spotifyTest', { title: 'Removed track!' });
    }
  });
});

router.get('/userid', function(req, res, next) {
  res.render('spotifyTest', { title: spotifyApi.getUserID() });
});

module.exports = router;
