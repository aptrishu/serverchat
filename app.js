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

var onlineMembers = {}; // {'roomname': ['user1','user2',...] }

var roomSizes = {};

function updateRoomSize(){
    roomSizes = {'room1': 0, 'room2': 0, 'room3': 0};
    for(var room in onlineMembers){
        roomSizes[room] = onlineMembers[room].length;
    }
}

function showOnlineMembersInTheRoom(socket){ // shows the members already present in the room at the time of joining
    var clients = onlineMembers[socket.room];
    for(i=0;clients!=null && i<clients.length;i++){
        socket.emit('updatechat', 'SERVER', clients[i] + ' is also present in this room');
    }
    if(onlineMembers[socket.room] == undefined) onlineMembers[socket.room] = [];
    onlineMembers[socket.room].push(socket.username); // add the username of the current socket in the list of members present in the room
}

io.sockets.on('connection', function (socket) {

    socket.on('adduser', function(username){
        socket.username = username;
        socket.room = 'room1';
        usernames[username] = username;
        socket.join('room1');
        socket.emit('updatechat', 'SERVER', 'you have connected to room1');
        showOnlineMembersInTheRoom(socket);
        socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
        updateRoomSize();
        socket.broadcast.emit('updaterooms', rooms, roomSizes);
        socket.emit('updaterooms', rooms, roomSizes);
    });

    socket.on('sendchat', function (data) {
        io.sockets.in(socket.room).emit('updatechat', socket.username, data);
    });

    socket.on('switchRoom', function(newroom){
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);

        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
        var oldroom = socket.room;
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');

        var index = onlineMembers[oldroom].indexOf(socket.username);
        if(index>-1) onlineMembers[oldroom].splice(index,1);
        showOnlineMembersInTheRoom(socket);

        updateRoomSize();
        socket.broadcast.emit('updaterooms', rooms, roomSizes);
        socket.emit('updaterooms', rooms, roomSizes);
    });

    socket.on('disconnect', function(){
        var index = -1;
        if(onlineMembers[socket.room]!=null && onlineMembers[socket.room].length>0) index = onlineMembers[socket.room].indexOf(socket.username);
        if(index>-1) onlineMembers[socket.room].splice(index,1);
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
});
