var SpotifyApi = require("./spotify-api.js");
var socketIo = require("socket.io");

var socketManager = new Object();

var spotifyApi = new SpotifyApi();
spotifyApi.setup();

var io = socketIo();
socketManager.io = io;

io.on("connection", function(socket){
  var pid = socket.handshake.query['pid'];
  socket.join(pid);

  spotifyApi.getPlaylist("7zasXV1JnlTMke8IQvCSs1", function(error, response, body){
    var playlist = JSON.parse(body);
    var tracks = new Array();

    (playlist.tracks.items).forEach(function(d){      
      tracks.push({
                    id: 0,
                    name: d.track.name,
                    artist: "TEST"
                  });
    });

    socket.emit('playlist_loaded', { tracks: tracks });
  });

  socket.on('add_track', function(data){
    socket.to(pid).emit('playlist_changed', { track: { id: 123,
                                                        name: "Silver Lining",
                                                        artist: "Oddisee"                                                      
                                                      },
                                               status: "add"
                                             });
    socket.emit('playlist_changed', { track: { id: 123,
                                         name: "Silver Lining",
                                         artist: "Oddisee"
                                        },
                                      status: "add"
                                    });
  });

  socket.on('remove_track', function(data){
    socket.to(pid).emit('playlist_changed', { track: { id: data.id
                                                      },
                                               status: "remove"
                                             });
    socket.emit('playlist_changed', { track: { id: data.id
                                           },
                                      status: "remove"
                                    });
  });

  socket.on('close_room', function(data){
    socket.to(pid).emit('kicked', {});
  });

  socket.on('disconnect', function(){    
    socket.leave(pid);
  })
});

module.exports = socketManager;