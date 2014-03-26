
/**
 * Module dependencies.
 */

  var express = require('express')
  , app  = require('express')()
  , server = require('http').createServer(app)
  , io   = require('socket.io').listen(server)
  , path = require('path');

// Change to acceptible port
  server.listen(3000);

  app.use(express.static(path.join(__dirname, 'public')));

  var isInitiator = false;

// Fall back to xhr-polling for hosts that don't support Web Sockets. Not needed for those that do.
 io.configure('development', function(){
  io.set('transports', ['xhr-polling']);
});
  
  io.sockets.on('connection', function(socket) {

    if(!isInitiator)
    {
      isInitiator = true;
      socket.emit('initiatorFound', {setInitiator: isInitiator});
    } else {
      socket.emit('initiatorFound', {setInitiator: !isInitiator});
    }

    // Signaling Channel
    socket.on('message', function(message) {

      if(message.type == 'streamAdd') {
        console.log('Got message: ' + message);
      }
      socket.broadcast.emit('message' ,message);

    });

  });
