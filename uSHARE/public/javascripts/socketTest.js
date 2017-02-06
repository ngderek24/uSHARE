var socket = io('http://localhost:3000');
socket.on('message_to_client', function (data) {
	console.log("Message from server: " + data.msg);
	socket.emit('message_to_server', { msg: 'Message received!' });
});