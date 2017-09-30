var querystring = require('querystring');
var request = require('request');

var scopes = 'playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative';
var stateKey = 'spotify_auth_state';

//literally never do this irl
var userIdsToAccessTokens = new Object();

function SpotifyApi() {
  this.setup = function() {};

  // Prompts user to login to spotify
  this.promptLogin = function(req, res) {
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // Request authorization for app
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: clientID,
        scope: scopes,
        redirect_uri: redirectURI,
        state: state,
        show_dialog: true,
      }));
  };

  this.requestAccessToken = function(req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie(stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirectURI,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(clientID + ':' + clientSecret).toString('base64'))
        },
        json: true
      };

      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

          var accessToken = body.access_token;
          // refreshToken = body.refresh_token;

          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + accessToken },
            json: true
          };

          // Use access token to get user id
          request.get(options, function(error, response, body) {
            console.log(body);
            if (error) {
              console.log(error);
            }

            userIdsToAccessTokens[body.id] = accessToken;
            req.session.uid = body.id;

            res.redirect('/promptRoomOption?');
          });
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
  };

  // Creats a new playlist with the provided name
  this.createPlaylist = function(userID, playlistName, callback) {
    var bodyParams = {
      'name': playlistName,
      'public': true
    };

    var options = {
      url: "https://api.spotify.com/v1/users/" + encodeURIComponent(userID) + "/playlists",
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + userIdsToAccessTokens[userID]
      },
      body: JSON.stringify(bodyParams)
    };

    request.post(options, function(error, response, body) {
      bodyObj = JSON.parse(body);
      if (bodyObj.error) {
        if (callback) {
          callback(bodyObj.error);
        }
      } else {
        if (callback) {
          callback(null, response, body);
        }
      }
    });
  };

  // Get a list of user's playlists
  this.getPlaylists = function(userID, callback) {
    var options = {
      url: "https://api.spotify.com/v1/users/" + encodeURIComponent(userID) + "/playlists",
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + userIdsToAccessTokens[userID]
      }
    };

    request.get(options, function(error, response, body) {
      bodyObj = JSON.parse(body);

      if (bodyObj.error) {
        if (callback) {
          callback(bodyObj.error);
        }
      } else {
        var rawPlaylists = bodyObj.items;
        var playlists = new Array();

        for(var i = 0; i < rawPlaylists.length; i++) {
          playlists.push({
            'id': rawPlaylists[i]['id'],
            'uri': rawPlaylists[i]['uri'],
            'name': rawPlaylists[i]['name']
          });
        }

        var results = {
          'playlists': playlists
        };

        if (callback) {
          callback(null, response, results);
        }
      }
    });
  };

  // Get tracks from a playlist
  this.getPlaylist = function(ownerID, playlistID, callback) {
  	var ownerAccessToken = userIdsToAccessTokens[ownerID];

    var options = {
      url: "https://api.spotify.com/v1/users/" + encodeURIComponent(ownerID) +
           "/playlists/" + encodeURIComponent(playlistID) +
           "?fields=href,name,owner(!href,external_urls),tracks.items(added_by.id,track(id,name,artists(name),album(name)))",
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + ownerAccessToken
      }
    };

    request.get(options, function(error, response, body) {
      bodyObj = JSON.parse(body);

      if (bodyObj.error) {
        if (callback) {
          callback(bodyObj.error);
        }
      } else {
        if (callback) {
          callback(null, response, body);
        }
      }
    });
  };

  // Adds a track to the playlist.
  // trackURI must be in the following form: 'spotify:track:<uri>'
  this.addTrack = function(ownerID, playlistID, trackURI, callback) {
  	var ownerAccessToken = userIdsToAccessTokens[ownerID];

    var options = {
      url: "https://api.spotify.com/v1/users/" + encodeURIComponent(ownerID)
           + "/playlists/" + encodeURIComponent(playlistID) + "/tracks",
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + ownerAccessToken
      },
      body: JSON.stringify([trackURI])
    };

    request.post(options, function(error, response, body) {
      bodyObj = JSON.parse(body);
      if (bodyObj.error) {
        if (callback) {
          callback(bodyObj.error);
        }
      } else {
        if (callback) {
          callback(null, response, body);
        }
      }
    });
  };

  // Remove track with the given URI from the playlist
  // If there are multiple instances of the same track, all are removed.
  this.removeTrack = function(ownerID, playlistID, trackURI, callback) {
   	var ownerAccessToken = userIdsToAccessTokens[ownerID];

    var bodyParams = {
      "tracks": [ {
        "uri": trackURI
      } ]
    };

    var options = {
      url: "https://api.spotify.com/v1/users/" + encodeURIComponent(ownerID)
           + "/playlists/" + encodeURIComponent(playlistID) + "/tracks",
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + ownerAccessToken
      },
      body: JSON.stringify(bodyParams)
    };

    request.delete(options, function(error, response, body) {
      bodyObj = JSON.parse(body);
      if (bodyObj.error) {
        if (callback) {
          callback(bodyObj.error);
        }
      } else {
        if (callback) {
          callback(null, response, body);
        }
      }
    });
  };

  // Search for upto 10 tracks that matches search string
  this.searchTrack = function(userID, searchString, callback) {
    var queryString = querystring.stringify({
        q: encodeURIComponent(searchString),
        type: "track",
        limit: 10
      });

    var options = {
      url: "https://api.spotify.com/v1/search?" + queryString,
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + userIdsToAccessTokens[userID]
      }
    };

    request.get(options, function(error, response, body) {
      bodyObj = JSON.parse(body);

      if(!error && response.statusCode == 200){
        var rawTracks = bodyObj['tracks']['items'];
        var tracks = new Array();

        for(var i = 0; i < rawTracks.length; i++) {
          tracks.push({
            'id': rawTracks[i]['id'],
            'uri': rawTracks[i]['uri'],
            'name': rawTracks[i]['name'],
            'artist': rawTracks[i]['artists'][0]['name']
          });
        }

        var results = {
          'tracks': tracks
        };

        callback(null, response, results);
      } else {
        console.log(bodyObj.error);
        callback(bodyObj.error);
      }
    });
  };

  // // Get user id.
  // // Instantaneous, does not require a callback.
  // this.getUserID = function() {
  //   return userID;
  // };
}

// Generates a random string containing numbers and letters
function generateRandomString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

module.exports = SpotifyApi;
