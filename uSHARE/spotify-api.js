function SpotifyApi(clientID, clientSecret, redirectURI) {
  this._clientID = clientID;
  this._clientSecret = clientSecret;
  this._redirectURI = redirectURI;
}

SpotifyApi.prototype = {
};

module.exports = SpotifyApi;
