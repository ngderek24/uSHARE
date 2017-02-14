var SpotifyApi = require('../spotify-api');
var express = require('express');
var router = express.Router();

var spotifyApi = new SpotifyApi();
spotifyApi.setup();

var roomIds = new Object();

// TODO: fix spotify url endpoint
// TODO: pass template the approriate links based on user login status
var links = [
  				{ name:"Login via Spotify",
  				  endpoint: "/login" }
  			]

var dummyTracks = [
											{ id: 123,
												name: "Silver Lining",
												artist: "Oddisee"
											},
											{ id: 234123,
												name: "All the Secrets",
												artist: "Flying Lotus"
											}
									]

var dummyMetadata = {
  							role: "guest",
  							uid: 123243434,
  							rid: 1243254305943,
  						}

// router.get('/room', function(req, res, next) {
//   res.render('room', { title: 'uSHARE',
//   						links: links,
//   						// tracks: JSON.stringify([]),
//   						tracks: JSON.stringify(dummyTracks),
//   						metadata: JSON.stringify(dummyMetadata), 						
//   					});
// });

router.get('/', function(req, res, next) {
  res.render('index', { title: 'uSHARE',
              links: links
            });
});

router.get('/login', spotifyApi.promptLogin);

router.get('/spotifyTest/callback', spotifyApi.requestAccessToken);

router.get('/promptRoomOption', function(req, res, next) {
  res.render('promptCreateOrJoin', { title: 'uSHARE' });
  /*spotifyApi.getPlaylists(function(error, response, body) {
    console.log(body);
  });*/
});

router.post('/newPlaylist', function(req, res, next) {
  spotifyApi.createPlaylist(req.body.playlistName, function(error, response, body) {
    if (error)
      console.log('create playlist error');
    else {
      var playlistBodyObject = JSON.parse(body);
      var roomId = generateRandomString(10);
      while (roomId in roomIds)
        roomId = generateRandomString(10);

      roomIds[roomId] = playlistBodyObject.id;

      console.log('playlist created');
      res.redirect('/room/' + roomId);
    }
  });
});

router.post('/joinRoom', function(req, res, next) {
  if (!(req.body.roomId in roomIds))
    console.log('Not a valid room ID');
  else
    res.redirect('/' + req.body.roomId);
});

/*
  Keep the data passed to this route to a minimum since we need to handle both rooms
  created from new playlists and existing playlists
*/
router.get('/room/:roomId', function(req, res, next) {
  var roomId = req.params.roomId;

  //TO DO: handle access code stuff
  if (roomId in roomIds) {
    //TODO: generate room metadata dynamically
    dummyMetadata["playlistId"] = roomIds[roomId];

    res.render('room', { 
                          title: "DON'T LET YOUR MEMES BE DREAMS",
                          metadata: JSON.stringify(dummyMetadata)           
                       });  
  } else 
    console.log('Invalid Room Code');
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
