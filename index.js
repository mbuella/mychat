var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');

  //disconnect
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  //broadcast chat msg  
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    socket.broadcast.emit('chat message', msg);
  });

  //private message

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});