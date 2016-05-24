var express = require ('express')
var app = express()
var net = require('net');
var client = new net.Socket();
var bodyParser = require ('body-parser');
var crypto = require ('crypto');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var Promise = require('bluebird');

var ts = require('../lib/tcplib');
var outBoundFun = require('../lib/outboundFunctions');
var msg = require('../lib/message');

var port = process.env.PORT || 8082;
var hubPort = 6969;
var ipAddress = "127.0.0.1";
mtdata = "";
hubdataack = [];
app.use(cookieParser());
app.use (bodyParser.json());
app.use (bodyParser.urlencoded({extended: true}));

// Use the session middleware
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

var postToHub = function(hubdata) {
   
  client.connect(hubPort, ipAddress, function() {
    // console.log('CONNECTED TO: ' + HOST + ':' + PORT);
   // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
   //client.write('NTGreet0000-CC2D15800700-"Hello Server"');
	client.write(hubdata);
    console.log ('Wrote to the client');
  });

  client.on('data', function(data) {
    // Close the client socket completely
	       hubdataack = data;
	  client.destroy();
  });

  client.on('close', function() {

    console.log("mdata : " +hubdataack);	
    console.log('Connection closed');
  });
  
  return new Promise(function(resolve, reject){
        //return hubdataack;
		//hubdataack = 0;
		resolve(hubdataack);
    });
}


app.get('/api/health', function(req, res) {
  res.send({ message: "OK"});
});

app.post('/api/message', function (req, res) {
  var guid = req.body.guid;
  var ipAddress = req.body.ipAddress;
  var controllerHash = req.body.hash;
  var zoneId = req.body.zoneId;
  var deviceId = req.body.device_id;

  // Prepare the Signature
  var timestamp = new Date().valueOf();
  var hash = crypto.createHmac('sha512', guid);
  var signatureContent = controllerHash + "|" + timestamp;
  hash.update(signatureContent);
  var signature = hash.digest('hex');
  console.log ('Timestamp: ' + timestamp);
  console.log('Signature: ' + signature);
  res.send({message: "SUCCESS!!"});
});


app.post('/api/networks/controllers/devices/register', function(req, res) {
 
   var deviceType = req.body.deviceType;
   var macAddress = req.body.macAddress;
   var guid = req.body.guid;
   var controllerIPAddress = req.body.controllerIPAddress;
   var controllerUniqueId = req.body.controllerUniqueId;
   var signature = ts.getSignature(controllerUniqueId,guid);
   var timeStamp = ts.getTimeStamp();
   var resp = outBoundFun.getDeviceRegSuccess(deviceType,macAddress,device_Reg_Success);
   //var resp = outBoundFun.getDeviceRegFailed(device_Reg_Failed);
   var MessageType = 3;
   var serviceType = 12;
   var regDeviceStr = "NTSYS" + ":" + signature + ":" + timeStamp  + MessageType + serviceType + macAddress ;
   postToHub(regDeviceStr).then(function(finalResult){
            console.log("Final result " + finalResult);
	  if(finalResult == 0){
	       var resp = outBoundFun.getDeviceRegFailed(device_Reg_Failed);
	  }else{
	      var resp = outBoundFun.getDeviceRegSuccess(deviceType,macAddress,device_Reg_Success);
	  }
     res.send(resp); 	  
 }).error(function(e){
       console.log("Error handler " + e);
}).catch(function(e){
      console.log("Catch handler " + e);
});
   
});
app.listen(port);
console.log('Server started!!');
