var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket_io = require("socket.io");

var index = require('./routes/index');
var users = require('./routes/users');
var socketTest = require('./routes/socketTest');

var socketMgr = require('./socketMgr.js')

//Create Express app object
var app = express();

//Create socket
var io = socket_io();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// handles client angular requests for view partials
app.get('/partials/:name', function(req, res){
  var name = req.params.name;
  res.render('partials/' + name);
});

// set routers
app.use('/', index);
app.use('/users', users);
app.use('/socketTest', socketTest);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//Socket testing 
//TODO: move to separate js file
// io.on("connection", function(socket){
// 	console.log("New user connection.");

// 	socket.emit('playlist_changed', { track: { id: 123,
//                                              name: "Silver Lining",
//                                              artist: "Oddisee"
//                                            },
//                                     status: "add"
//                                   });
// 	socket.on('message_to_server', function(data){
// 		console.log('Message from client: ' + data.msg)
// 	});
// });
io.on("connection", function(socket){
  var lastConnected = socketMgr.lastConnected();
  console.log("Socket connected from User " + lastConnected.uid + " to Room " + lastConnected.rid + ". There are now " + socketMgr.count() + " connections.");
  socket.on('remove_track', function(data){
    socket.emit('playlist_changed', { track: { id: data.id
                                             },
                                      status: "remove"
                                    });
    socket.emit('removal_result', { success: true
                                  });
  });

  socket.on('disconnect', function(){    
    socketMgr.remove(lastConnected.uid);
    console.log("Socket (User: " + lastConnected.uid + " Room: " + lastConnected.rid + ") connected. There are now " + socketMgr.count() + " connections.");
  })
});


module.exports = app;
