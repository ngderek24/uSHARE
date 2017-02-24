var SpotifyApi = require('../spotify-api');
var express = require('express');
var router = express.Router();

var spotifyApi = new SpotifyApi();
spotifyApi.setup();

var roomIdsToPlaylistIds = new Object();
var hostIdsToRoomIds = new Object();
var privateRoomIdsToAccessCodes = new Object();
var roomIdsToRoomNames = new Object();

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
  var userId = spotifyApi.getUserID();
  if (userId in hostIdsToRoomIds) {
    res.redirect('/room/' + hostIdsToRoomIds[userId]);
  } else {
    spotifyApi.getPlaylists(function(error, response, body) {
      if (error) {
        res.render('error', { message: 'Could not get playlists',
                              error: error });
      } else {
        res.render('promptCreateOrJoin', { title: 'uSHARE',
                                            playlists: JSON.stringify(body)});
      }
    });
  }
});

router.get('/newPlaylist/:roomName/:playlistName/:isPrivate/:accessCode', function(req, res, next) {
  var userId = spotifyApi.getUserID();
  if (userId in hostIdsToRoomIds)
    console.log('You cannot host more than 1 room');
  else {
    spotifyApi.createPlaylist(req.params.playlistName, function(error, response, body) {
      if (error)
        res.render('error', { message: 'Cannot create playlist',
                          error: error });
      else {
        var playlistBodyObject = JSON.parse(body);
        var roomId = generateRandomString(10);
        while (roomId in roomIdsToPlaylistIds)
          roomId = generateRandomString(10);

        roomIdsToPlaylistIds[roomId] = playlistBodyObject.id;
        hostIdsToRoomIds[userId] = roomId;
        roomIdsToRoomNames[roomId] = req.params.roomName;
        if (req.params.isPrivate) {
          if (req.params.accessCode == undefined || req.params.accessCode == "")
            console.log('No access code used. Room will be public.');
          else
            privateRoomIdsToAccessCodes[roomId] = req.params.accessCode;
        }

        req.session.roomId = roomId;

        console.log('playlist created');
        res.redirect('/room/' + roomId);
      }
    });
  }
});

router.get('/playlist/:roomName/:playlistId/:isPrivate/:accessCode', function(req, res, next) {
  var userId = spotifyApi.getUserID();
  if (userId in hostIdsToRoomIds)
    console.log('You cannot host more than 1 room');
  else {
    var roomId = generateRandomString(10);
    while (roomId in roomIdsToPlaylistIds)
      roomId = generateRandomString(10);

    roomIdsToPlaylistIds[roomId] = req.params.playlistId;
    hostIdsToRoomIds[userId] = roomId;
    roomIdsToRoomNames[roomId] = req.params.roomName;

    if (req.body.isPrivate) {
      if (req.body.accessCode == undefined || req.body.accessCode == "")
        console.log('No access code used. Room will be public.');
      else
        privateRoomIdsToAccessCodes[roomId] = req.body.accessCode;
    }

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

  for (roomId in roomIdsToPlaylistIds) {
    if (roomId == rid) {
      delete roomIdsToPlaylistIds[roomId];
      break;
    }
  }

  delete hostIdsToRoomIds[spotifyApi.getUserID()];
  
  for (privateRoomId in privateRoomIdsToAccessCodes) {
    if (privateRoomId == rid) {
      delete privateRoomIdsToAccessCodes[privateRoomId];
      break;
    }
  }
  
  for (roomId in roomIdsToRoomNames) {
    if (roomId == rid) {
      delete roomIdsToRoomNames[roomId];
      break;
    }
  }

  res.redirect('/promptRoomOption');
});

router.get('/addTrack/:roomId/:playlistId/:uri', function(req, res, next) {
  spotifyApi.addTrack(req.params.playlistId, req.params.uri, function(error, response, body) {
    console.log(body);
    if (error) {
      res.render('error', { message: 'Could not add track',
                            error: error });
    } else {
      res.redirect('/room/' + req.params.roomId);
    }
  });
});

router.get('/removeTrack/:roomId/:playlistId/:uri', function(req, res, next) {
  spotifyApi.removeTrack(req.params.playlistId, req.params.uri, function(error, response, body) {
    console.log(body);
    if (error) {
      res.render('error', { message: 'Could not add track',
                            error: error });
    } else {
      res.redirect('/room/' + req.params.roomId);
    }
  });
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
