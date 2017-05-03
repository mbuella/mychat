var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};

app.use(express.static('assets'))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	//if there are more than two 
	//members we can start pairing

  socket.on('chat intro', function(codename){
	users[socket.id] = codename;
    console.log(codename+' has joined the chat.');
    //inform all active chatters
	socket.broadcast.emit('chat intro', codename);

    //listen for disconnects
	socket.on('disconnect', function(){
		console.log(users[socket.id]+' has disconnected');
		socket.broadcast.emit('chat leave', users[socket.id]);
		//remove the username from the users array
		delete users[socket.id];
	});

	//chat messages
	socket.on('chat message', function(msg){
		console.log(users[socket.id]+': ' + msg);
		socket.broadcast.emit('chat message', {
			'cn': users[socket.id],
			'text': msg
		});
	});

	//listen for typing members
	socket.on('chat typing', function(typing){
		if(typing) {
			console.log(users[socket.id]+' is typing a message.');
		}
		else {
			console.log(users[socket.id]+' has stopped typing.');			
			types = false;
		}
		socket.broadcast.emit('chat typing',{
			'cn': users[socket.id],
			'typing': typing
		});
	});

  });

  //broadcast chat msg  

  //private message to random 1

  //private message to random 2

});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});