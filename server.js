// require express and path
var express = require("express"),
	path = require("path"),
	app = express();

var server = app.listen(9000, function() {
	console.log("listening on port 9000 ... ");
});

var io = require('socket.io').listen(server);

// static content 
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// list of users
users = [];
socketList = [];

// root route to render the index.ejs view
app.get('/', function(request, response) {
	response.render("index");
})

// socket controls
io.sockets.on('connection', function(socket) { 

	socket.on('new_user', function(data, callback){
		if (users.indexOf(data) != -1){
			callback(false);
		} else {
			callback(true);
			users.push(data);
			socketList.push(socket);
			updateUserList();
			var declareuser = data + " has joined the room!";
			io.sockets.emit('add_User', declareuser);
		}
	});

	socket.on('message_to_server', function(data) { 
		io.sockets.emit("message_to_client",data ); 
	});

	socket.on('disconnect', function() { 
		var i = socketList.indexOf(socket);
		declareuser = users[i] + ' has left the room!';
		io.sockets.emit('add_User', declareuser);
		users.splice(i,1)
		socketList.splice(i,1);
		updateUserList();
	});

	function updateUserList(){
		io.sockets.emit('userList', users);
	}
});