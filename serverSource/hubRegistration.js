var net = require('net');

var serverHost = '192.168.2.69';
var serverport = 8080;
var hubHost    = '192.168.2.69';
var hubPort    = 6969;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {
    
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    
    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        
	console.log('DATA ' + sock.remoteAddress + ': ' + data);
	// Write the data back to the socket, the client will receive it as data from the server
	sock.write('You said "' + data + '"');
	
	var ts  = require('./lib/tcplib');

	https   = require('https'); 
	var net = require('net');
	var client    = new net.Socket();
	deviceDetails = data.toString().split(':');
	var lat  = deviceDetails[3];
	var lon  = deviceDetails[5];
	var latitudeDirection  = deviceDetails[4];
	var longitudeDirection = deviceDetails[6];
	var controllerUniqueId = deviceDetails[1];
	var messageType = deviceDetails[7];
	var serviceType = deviceDetails[8];

	process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
	var latLong = ts.isValidLatLong(lat, lon);
	
	if ( controllerUniqueId != '' && latLong > 0 && 
		latitudeDirection == 'N' && longitudeDirection == 'E' ) { 

		jsonObject = JSON.stringify({					
			"latitude": lat, 
			"latitudeDirection": latitudeDirection, 
			"longitude": lon, 
			"longitudeDirection": longitudeDirection,
			"controllerUniqueId": controllerUniqueId			
		});
	
		// prepare the header
		var postheaders = {
			'Content-Type' : 'application/json',
			'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
		};		
		// the post options
		var optionspost = {
			host : 'services.noidtechservicesdev.com',
			path : '/networks/controllers',
			method : 'POST',
			headers : postheaders
		}; 	   
		// do the POST call
		var reqPost = https.request(optionspost, function(res) {	

			res.on('data', function(resdata) {	
		
				resdata_out =  JSON.parse(resdata);	
				
				if (resdata_out.code == 200) {
				
					process.stdout.write(resdata);	
					var guid        = resdata_out.data.guid;
					var hubUniqueId = resdata_out.data.controllerUniqueId;				  
					var signature   = ts.getSignature(hubUniqueId,guid);
					var timeStamp   = ts.getTimeStamp();
					var timeSync    = ts.getTimeStamp();
					
					var regHubStr   = "NTREG" + ":" + signature + ":" + timeStamp  + ":" + messageType + ":" + 		  		    serviceType + ":" + guid +  ":" + timeSync; 
				
					
					var retdata = postToHub(regHubStr);
					
					function postToHub(hubdata) {
					
						client.connect(hubPort, hubHost, function() {
							// console.log('CONNECTED TO: ' + HOST + ':' + PORT);
							// Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
							//client.write('NTGreet0000-CC2D15800700-"Hello Server"');
							client.write(hubdata);
							console.log ('Wrote to the client');
						});

					    client.on('data', function(data) {
							console.log('data: ' + data);
							// Close the client socket completely
						    //console.log(mtdata);
						    // return mtdata;
						    client.destroy();
					    });

						client.on('close', function() {
					       console.log('Connection closed');
					    });
  
					}
					
				} else {
					console.log(resdata_out.message);
				}
			});
						
		});
			
		// write the json data
		reqPost.write(jsonObject);
		reqPost.end();
		reqPost.on('error', function(e) {
			console.error(e);
		});
	
	} else {
		console.log("Validation Error");
		return;
	}

    });
    
    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(serverport, serverHost);

console.log('Server listening on ' + serverHost +':'+ serverport);