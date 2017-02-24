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
  if(req.session.rid){
    res.redirect('/room/' + req.session.rid);
  }
  else if((spotifyApi.getUserID() && spotifyApi.getUserID().length > 0) && 
      (req.session.loggedIn && req.session.loggedIn == true)){
    res.redirect('/promptRoomOption');
  }
  else{
    res.render('index', { title: 'uSHARE',
                links: links
              });
  }
});

router.get('/login', spotifyApi.promptLogin);

router.get('/spotifyTest/callback', spotifyApi.requestAccessToken);

router.get('/promptRoomOption', function(req, res, next) {
  if(req.session.rid){
    res.redirect('/room/' + req.session.rid);
  }
  
  req.session.loggedIn = true;
  res.locals.loggedIn = true;

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

      console.log('playlist created');
      res.redirect('/room/' + roomId);
    }
  });
});

router.get('/playlist/:roomName/:playlistId/:isPrivate/:accessCode?', function(req, res, next) {
  var userId = spotifyApi.getUserID();
  var roomId = generateRandomString(10);
  while (roomId in roomIdsToPlaylistIds)
    roomId = generateRandomString(10);

  roomIdsToPlaylistIds[roomId] = req.params.playlistId;
  hostIdsToRoomIds[userId] = roomId;
  roomIdsToRoomNames[roomId] = req.params.roomName;
  
  if (req.params.isPrivate == "true") {      
    if (req.params.accessCode == undefined || req.params.accessCode == "")
      console.log('No access code used. Room will be public.');
    else{
      console.log("PRIVATE ROOM CREATION");
      privateRoomIdsToAccessCodes[roomId] = req.params.accessCode;
    }
  }

  console.log('got existing playlist');
  res.redirect('/room/' + roomId);
});

router.get('/joinRoom/:roomId/:accessCode?', function(req, res, next) {
  if (!(req.params.roomId in roomIdsToPlaylistIds))
    console.log('Not a valid room ID');
  else {
    if (req.params.accessCode && req.params.accessCode != privateRoomIdsToAccessCodes[req.params.roomId])
      console.log('Invalid access code');
    else{
      res.redirect('/room/' + req.params.roomId);
    }
  }
});

/*
  Keep the data passed to this route to a minimum since we need to handle both rooms
  created from new playlists and existing playlists
*/
router.get('/room/:roomId', function(req, res, next) {
  var roomId = req.params.roomId;
  req.session.rid = roomId;

  var role = spotifyApi.getUserID() in hostIdsToRoomIds ? "host" : "guest";

  //TO DO: handle access code stuff
  if (roomId in roomIdsToPlaylistIds) {
    var metadata = {
      role: role,
      rid: roomId,
      playlistId: roomIdsToPlaylistIds[roomId],
    }

    res.render('room', { 
                          title: roomIdsToRoomNames[roomId],
                          metadata: JSON.stringify(metadata)           
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

  res.redirect('/leaveRoom');
});

router.get('/leaveRoom', function(req, res, next){
  req.session.rid = null;
  res.redirect('/promptRoomOption');
});

router.get('/logout', function(req, res, next){
  req.session.loggedIn = false;
  res.locals.loggedIn = false;
  req.session.rid = null;
  res.redirect('/');
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
