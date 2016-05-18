// Load the TCP Library
net = require('net');

// Keep track of the chat clients
var clients = [];

var port = 8080;
// Start a TCP Server
net.createServer(function (socket) {

  // Identify this client
  socket.name = socket.remoteAddress + ":" + socket.remotePort 

  // Put this new client in the list
  clients.push(socket);

  // Send a nice welcome message and announce
  console.log("Welcome " + socket.name + "\n");
  socket.write("Welcome " + socket.name + "\n");
  //broadcast(socket.name + " joined the chat\n", socket);

  // Handle incoming messages from clients.
  socket.on('data', function (data) {
    //broadcast(socket.name + "> " + data, socket);
    socket.write("Pong : " + data);
  });

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    console.log (socket.name + " left");
    //broadcast(socket.name + " left the chat.\n");
  });
  
  socket.on('error', function(err) {
    console.log('ERROR: ', err);
  });
  // Send a message to all clients
  function broadcast(message, sender) {
    clients.forEach(function (client) {
      // Don't want to send it to sender
      if (client === sender) return;
      client.write(message);
    });
    // Log it to the server output too
    process.stdout.write(message)
  }

}).listen(port);

// Put a friendly message on the terminal of the server.
console.log("Tcp server running at port ", port);
