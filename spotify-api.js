var querystring = require('querystring');
var request = require('request');

function SpotifyApi() {}

var clientID = '211aae652e324de8b0237d55d0fa3030';
var clientSecret = '691fdcd98e054278aac41672f119f9dd';
var redirectURI = 'http://localhost:3000/spotifyTest/callback';

/*
  Deploy credentials: remember to swap in
*/
// var clientID = 'b31f86324a784e9db76255fc4467363d';
// var clientSecret = 'b31f86324a784e9db76255fc4467363d';
// var redirectURI = 'https://radiant-peak-71546.herokuapp.com/spotifyTest/callback';


var scopes = 'playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative';
var stateKey = 'spotify_auth_state';
var accessToken = '';
var refreshToken = '';
var userID = '';

SpotifyApi.prototype = {
  
  setup: function() {},

  // Prompts user to login to spotify
  promptLogin: function(req, res) {
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // Request authorization for app
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: clientID,
        scope: scopes,
        redirect_uri: redirectURI,
        state: state
      }));
  },

  requestAccessToken: function(req, res) {
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

          accessToken = body.access_token;
          refreshToken = body.refresh_token;

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
            userID = body.id;

            res.redirect('/promptRoomOption?' +
              querystring.stringify({
                id: userID,
                access_token: accessToken
              }));
          });
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
  },

  // Creats a new playlist with the provided name
  createPlaylist: function(playlistName, callback) {
    var bodyParams = {
      'name': playlistName,
      'public': true
    };

    var options = {
      url: "https://api.spotify.com/v1/users/" + encodeURIComponent(userID) + "/playlists",
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + accessToken
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
  },

  // Get a list of user's playlists
  getPlaylists: function(callback) {
    var options = {
      url: "https://api.spotify.com/v1/users/" + encodeURIComponent(userID) + "/playlists",
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + accessToken
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
  },

  // Get tracks from a playlist
  getPlaylist: function(ownerID, playlistID, ownerAccessToken, callback) {
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
  },

  // Adds a track to the playlist.
  // trackURI must be in the following form: 'spotify:track:<uri>'
  addTrack: function(ownerID, playlistID, trackURI, ownerAccessToken, callback) {
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
  },

  // Remove track with the given URI from the playlist
  // If there are multiple instances of the same track, all are removed.
  removeTrack: function(ownerID, playlistID, trackURI, ownerAccessToken, callback) {
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
  },

  // Search for upto 10 tracks that matches search string
  searchTrack: function(searchString, callback) {
    var queryString = querystring.stringify({
        q: encodeURIComponent(searchString),
        type: "track",
        limit: 10
      });

    var options = {
      url: "https://api.spotify.com/v1/search?" + queryString,
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + accessToken
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
  },

  // Get user id.
  // Instantaneous, does not require a callback.
  getUserID: function() {
    return userID;
  }
};

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
