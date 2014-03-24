
/**
 * Module dependencies.
 */

  var express = require('express')
  , app  = require('express')()
  , server = require('http').createServer(app)
  , io   = require('socket.io').listen(server)
  , path = require('path');

  server.listen(3000);

  app.use(express.static(path.join(__dirname, 'public')));

  var isInitiator = false;
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
      socket.emit('message' ,message);

    });

  });
