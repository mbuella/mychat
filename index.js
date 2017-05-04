var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};

app.use(express.static('assets'))
/* We're using the node modules instead :) */
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//general chat
/*io.on('connection', function(socket){
	//if there are more than two 
	//members we can start pairing

  socket.on('chat intro', function(codename){
	users[socket.id] = codename;
    console.log(codename+' has joined the chat.');
    //inform all active chatters
	socket.broadcast.emit('chat intro', codename);

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
		socket.broadcast.emit('chat typing',{
			'cn': users[socket.id],
			'typing': typing
		});
	});

	//listen for leave requests
	socket.on('chat leave', function(){
		socket.leave('chat intro');
		console.log(users[socket.id]+' has left the chat.');
		//inform other chatters
		socket.broadcast.emit('chat leave', users[socket.id]);
		//remove the username from the users array
		delete users[socket.id];
	});

    //listen for disconnects
	socket.on('disconnect', function(){
		console.log(users[socket.id]+' has been disconnected from the chat.');
		//inform other chatters
		socket.broadcast.emit('chat disconnect', users[socket.id]);
		//remove the username from the users array
		delete users[socket.id];
	});

  });

  //broadcast chat msg  

  //private message to random 1

  //private message to random 2

});*/

//namespace for public room chat
var pbchat = io.of('/public-chat');
//namespace for private chat (one-to-one)
var pvchat = io.of('/private-chat');

pbchat.on('connection', function(socket){
	//a chatter joined public chat

	//a chatter wants to join to his
	//preferred room
	socket.on('room join', function(info){
		//join to the preferred room
		var codename = info.cn;
		var room = info.room.toLowerCase();

		socket.join(room);
		//inform other chatters in the room
		//a chatter has just joined
		socket.to(room).emit('room join', codename);
		socket.emit('room name',room);
		console.log('[OPENCHAT] ***'+codename+' has joined the '+room+' room.***');

		//a chatter is typing a message
		socket.on('room typing', function(typing){
			socket.to(room).emit('room typing',{
				'cn': codename,
				'typing': typing
			});
		});

		//a chatter sends a message
		socket.on('room message', function(msg){
			//send info to all clients in the room
			socket.to(room).emit('room message',{
				'cn': codename,
				'text': msg
			});
			console.log('[OPENCHAT] '+codename+': '+msg);
		});

		//a chatter leaves the room
		socket.on('room leave', function(){
			//inform other chatters in the room
			//leave the room
			socket.leave(room);
			//a chatter has just left the room
			socket.to(room).emit('room leave',codename);
			console.log('[OPENCHAT] ***'+codename+' has left the room.***');
		});

		//the socket has been disconnected
		socket.on('disconnect', function(){
			//inform all chatters
			socket.to(room).emit('room disconnect', codename);
			console.log('[OPENCHAT] ***'+codename+' has been disconnected from the room.***');
		});

	});
});



http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});