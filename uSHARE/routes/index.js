var SpotifyApi = require('../spotify-api');
var express = require('express');
var router = express.Router();

var spotifyApi = new SpotifyApi();
spotifyApi.setup();

var roomAccessCodes = new Array();

// TODO: fix spotify url endpoint
// TODO: pass template the approriate links based on user login status
var links = [
  				{ name:"Login via Spotify",
  				  endpoint: "/login" }
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

var dummy_metadata = {
  							role: "guest",
  							uid: 123243434,
  							rid: 1243254305943,
  						}

router.get('/room', function(req, res, next) {
  res.render('room', { title: 'uSHARE',
  						links: links,
  						// tracks: JSON.stringify([]),
  						tracks: JSON.stringify(dummy_tracks),
  						metadata: JSON.stringify(dummy_metadata), 						
  					});
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'uSHARE',
              links: links
            });
});

router.get('/login', spotifyApi.promptLogin);

router.get('/spotifyTest/callback', spotifyApi.requestAccessToken);

router.get('/promptRoomOption', function(req, res, next) {
  res.render('promptCreateOrJoin', { title: 'uSHARE' });
  spotifyApi.getPlaylists(function(error, response, body) {
    console.log(body);
  });
});

router.post('/newPlaylist', function(req, res, next) {
  spotifyApi.createPlaylist(req.body.playlistName, function(error, response, body) {
    // TODO: check error flag for API calls
    var access_code = generateRandomString(5);
    while (roomAccessCodes.indexOf(access_code) != -1)
      access_code = generateRandomString(5);

    roomAccessCodes.push(access_code);
    console.log('playlist created');
    res.redirect('/' + access_code);
  });
});

router.post('/joinRoom', function(req, res, next) {
  if (roomAccessCodes.indexOf(req.body.roomAccessCode) == -1)
    console.log('Not a valid access code');
  else
    res.redirect('/' + req.body.roomAccessCode);
});

router.get('/:access_code', function(req, res, next) {
  if (roomAccessCodes.indexOf(req.params.access_code) != -1) {
    res.render('room', { title: 'uSHARE',
      tracks: JSON.stringify(dummy_tracks),
      metadata: JSON.stringify(dummy_metadata),             
    });  
  } else 
    console.log('Invalid Room');
});

function generateRandomString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

module.exports = router;
