var SpotifyApi = require('../spotify-api');
var express = require('express');
var router = express.Router();

var spotifyApi = new SpotifyApi();
spotifyApi.setup();

// TODO: fix spotify url endpoint
// TODO: pass template the approriate links based on user login status
var links = [
  				{ name:"Login via Spotify",
  				  endpoint: "/login" }
  			] 

var createRoom = [
          { name: "Create Room"}
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
  res.render('promptCreateOrJoin', { title: 'uSHARE',
              links: createRoom
            });
});

/*router.get('/create', function(req, res, next) {
  res.render('create_room');
  
});

router.get('/join', function(req, res, next) {
  res.render('join_room');
});*/

router.get('/:access_code', function(req, res, next) {
  res.send(req.params.access_code);
});

module.exports = router;
