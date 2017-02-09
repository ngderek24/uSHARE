var querystring = require('querystring');

function SpotifyApi() {}

var clientID = '211aae652e324de8b0237d55d0fa3030';
var clientSecret = '691fdcd98e054278aac41672f119f9dd';
var redirectURI = 'http://localhost:3000/';
var scopes = 'playlist-modify-public';
var stateKey = 'spotify_auth_state';

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
