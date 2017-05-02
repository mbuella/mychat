var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	//if there are more than two 
	//members we can start pairing
  console.log('a user connected');
  // console.log(socket.id);

  socket.on('chat intro', function(codename){
	users[socket.id] = codename;
    console.log('Codename: '+codename);
    //inform all active chatters
	socket.broadcast.emit('chat intro', codename);

    //listen for disconnects
	socket.on('disconnect', function(){
		console.log(users[socket.id]+' has disconnected');
	});

	socket.on('chat message', function(msg){
		console.log(users[socket.id]+': ' + msg);
		socket.broadcast.emit('chat message', {
			'cn': users[socket.id],
			'text': msg
		});
	});

  });

  //broadcast chat msg  

  //private message to random 1

  //private message to random 2

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});