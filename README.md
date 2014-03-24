Experimenting with WebRTC


Trying to create a simple 1-to-1 video chat with as minimal code as possible.



Issues
======

For some reason, after the initial client reaches the server, when other clients join, there messages don't reach each other when socket.io's emit() method is called. The clients only receive their own emitted messages.