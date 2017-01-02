var express = require('express')
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var port = process.env.PORT || 5000; // Heroku ka chu*iyapa
server.listen(port);


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var usernames = {};

var rooms = ['room1','room2','room3'];

io.sockets.on('connection', function (socket) {

    socket.on('adduser', function(username){
        socket.username = username;
        socket.room = 'room1';
        usernames[username] = username;
        socket.join('room1');
        socket.emit('updatechat', 'SERVER', 'you have connected to room1');
        socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
        socket.emit('updaterooms', rooms, 'room1');
    });

    socket.on('sendchat', function (data) {
        io.sockets.in(socket.room).emit('updatechat', socket.username, data);
    });

    socket.on('switchRoom', function(newroom){
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');

        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
        socket.emit('updaterooms', rooms, newroom);
    });


    socket.on('disconnect', function(){

        delete usernames[socket.username];

        io.sockets.emit('updateusers', usernames);

        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
});
