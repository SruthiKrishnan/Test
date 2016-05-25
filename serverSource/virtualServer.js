var net = require('net');

var serverHost = '192.168.2.69';
var hubHost    = '192.168.2.69';
var serverPort = 8080;
var hubPort    = 6969;
var data       = "NTREG:09324568A31D3F87067DD4B4BBA40C7A:201605127143723.543683942:100:N:100:E:7:16";

var client = new net.Socket();
client.connect(serverPort, serverHost, function() {

    console.log('CONNECTED TO: ' + serverHost + ':' + serverPort);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    client.write(data);

});

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
    
    //console.log('DATA: ' + data);
    // Close the client socket completely
    //client.destroy();
    
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});


net.createServer(function(sock) {
    
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    
    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
		deviceDetails = data.toString().split(':');
		var status = 0;
        // Write the data back to the socket, the client will receive it as data from the server
		if (deviceDetails[3] == "7" || deviceDetails[4] == "16") {
			status = 1;
			sock.write('ACK:' +  status);
		} else if (deviceDetails[3] != "3" ) { 
			
			sock.write('ACK:' +  status);
		} 
		if (deviceDetails[3] == "3" || deviceDetails[4] == "12" && 
		   (deviceDetails[5] == "AUE76341ASA" || deviceDetails[5] == "AUE76341ASB" ||
			deviceDetails[5] == "AUE76341ASC" || deviceDetails[5] == "AUE76341ASD" || 
			deviceDetails[5] == "AUE76341ASE")) {
			
			status = 1;
			sock.write('ACK:' +  data + ':100:N:100:E:'+ status);
			
		} else if (deviceDetails[3] != "7") {
	
			sock.write('ACK:' +  data + ':100:N:100:E:'+ status);
		}
        
    });
    
    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(hubPort, hubHost);

console.log('Hub listening on ' + hubHost +':'+ hubPort);
