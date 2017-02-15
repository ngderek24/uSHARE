var SpotifyApi = require('../spotify-api');
var express = require('express');
var router = express.Router();

var spotifyApi = new SpotifyApi();
spotifyApi.setup();

var roomIdsToPlaylistIds = new Object();
var hostIdsToRoomIds = new Object();
var privateRoomIdsToAccessCodes = new Object();

// TODO: fix spotify url endpoint
// TODO: pass template the approriate links based on user login status
var links = [
  				{ name:"Login via Spotify",
  				  endpoint: "/login" }
  			]

var dummyMetadata = {
  							role: "host",
  							uid: 123243434,
  							rid: 1243254305943 }

router.get('/', function(req, res, next) {
  res.render('index', { title: 'uSHARE',
              links: links
            });
});

router.get('/login', spotifyApi.promptLogin);

router.get('/spotifyTest/callback', spotifyApi.requestAccessToken);

router.get('/promptRoomOption', function(req, res, next) {
  spotifyApi.getPlaylists(function(error, response, body) {
    if (error) {
      console.log('error getting playlists');
    } else {
      res.render('promptCreateOrJoin', { title: 'uSHARE',
                                          playlists: JSON.stringify(body)});
    }
  });
});

router.post('/newPlaylist', function(req, res, next) {
  var userId = spotifyApi.getUserID();
  if (userId in hostIdsToRoomIds)
    console.log('You cannot host more than 1 room');
  else {
    if (req.body.playlistName == undefined || req.body.playlistName == "")
      console.log('Playlist name is empty');
    else {
      spotifyApi.createPlaylist(req.body.playlistName, function(error, response, body) {
        if (error)
          console.log('create playlist error');
        else {
          var playlistBodyObject = JSON.parse(body);
          var roomId = generateRandomString(10);
          while (roomId in roomIdsToPlaylistIds)
            roomId = generateRandomString(10);

          roomIdsToPlaylistIds[roomId] = playlistBodyObject.id;
          hostIdsToRoomIds[userId] = roomId;
          if (req.body.isPrivate) {
            if (req.body.accessCode == undefined || req.body.accessCode == "")
              console.log('No access code used. Room will be public.');
            else
              privateRoomIdsToAccessCodes[roomId] = req.body.accessCode;
          }

          req.session.roomId = roomId;

          console.log('playlist created');
          res.redirect('/room/' + roomId);
        }
      });
    }
  }
});

router.get('/playlist/:playlistId', function(req, res, next) {
  console.log(req.params.playlistId);
  var userId = spotifyApi.getUserID();
  if (userId in hostIdsToRoomIds)
    console.log('You cannot host more than 1 room');
  else {
    var roomId = generateRandomString(10);
    while (roomId in roomIdsToPlaylistIds)
      roomId = generateRandomString(10);

    roomIdsToPlaylistIds[roomId] = req.params.playlistId;
    hostIdsToRoomIds[userId] = roomId;
    req.session.roomId = roomId;

    console.log('got existing playlist');
    res.redirect('/room/' + roomId);
  }
});

router.post('/joinRoom', function(req, res, next) {
  if (!(req.body.roomId in roomIdsToPlaylistIds))
    console.log('Not a valid room ID');
  else {
    if (req.body.accessCode != privateRoomIdsToAccessCodes[req.body.roomId])
      console.log('Invalid access code');
    else
      res.redirect('/room/' + req.body.roomId);
  }
});

/*
  Keep the data passed to this route to a minimum since we need to handle both rooms
  created from new playlists and existing playlists
*/
router.get('/room/:roomId', function(req, res, next) {
  var roomId = req.params.roomId;

  //TO DO: handle access code stuff
  if (roomId in roomIdsToPlaylistIds) {
    //TODO: generate room metadata dynamically
    dummyMetadata['rid'] = roomId;
    dummyMetadata["playlistId"] = roomIdsToPlaylistIds[roomId];

    res.render('room', { 
                          title: "DON'T LET YOUR MEMES BE DREAMS",
                          metadata: JSON.stringify(dummyMetadata)           
                       });  
  } else 
    console.log('Invalid Room Code');
    res.redirect('/promptRoomOption');
});

router.get('/closeRoom/:rid', function(req, res, next){
  var rid = req.params.rid;

  for(roomId in roomIds){
    if(roomId == rid){
      delete roomIds[roomId];
      break;
    }
  }
  
  res.redirect('/promptRoomOption');
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
