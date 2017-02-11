var querystring = require('querystring');
var request = require('request');

function SpotifyApi() {}

var clientID = '211aae652e324de8b0237d55d0fa3030';
var clientSecret = '691fdcd98e054278aac41672f119f9dd';
var redirectURI = 'http://localhost:3000/spotifyTest/callback';
var scopes = 'playlist-modify-public';
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
            userID = body.id;
          });

          // We can also pass the token to the browser to make requests from there
          // res.redirect('/#' +
          //   querystring.stringify({
          //     access_token: accessToken,
          //     refresh_token: refreshToken
          //   }));
          res.redirect('/spotifyTest');
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
  },

  // Creats a playlist with the provided name
  createPlaylist: function(playlistName, callback) {
    console.log("userID: " + userID);
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
      if (error) {
        console.log(error);
        if (callback) {
          callback(error);
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
  addTrack: function(playlistID, trackURI, callback) {
    var options = {
      url: "https://api.spotify.com/v1/users/" + encodeURIComponent(userID)
           + "/playlists/" + encodeURIComponent(playlistID) + "/tracks",
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + accessToken
      },
      body: JSON.stringify([trackURI])
    };

    request.post(options, function(error, response, body) {
      if (error) {
        console.log(error);
        callback(error);
      } else {
        callback(null, response, body);
      }
    });
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
