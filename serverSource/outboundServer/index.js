var express = require ('express')
var app = express()
var net = require('net');
var client = new net.Socket();
var bodyParser = require ('body-parser');
var crypto = require ('crypto');
var fs = require('fs');
var ts = require('../commonFunctions/lib/tcplib');
var outBoundFun = require('../commonFunctions/lib/outboundFunctions');
var msg = require('../commonFunctions/lib/message');

var port = process.env.PORT || 8082;
var hubPort = 6969;
var ipAddress = "172.31.37.10";
hubDataAck ="";
//app.use(cookieParser());
app.use (bodyParser.json());
app.use (bodyParser.urlencoded({extended: true}));

// Use the session middleware
//app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
var log_Timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
var today = new Date();
var log_FileName = today.toISOString().substring(0, 10) + "-" +"server.log";
var log_file  = fs.createWriteStream(__dirname + "/"+log_FileName, {flags : 'a'});

var postToHub = function(hubdata,callType) {
   
  client.connect(hubPort, ipAddress, function() {
    // console.log('CONNECTED TO: ' + HOST + ':' + PORT);
   // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
   //client.write('NTGreet0000-CC2D15800700-"Hello Server"');
	client.write(hubdata);
       console.log(hubdata);
       	var logData = log_Timestamp + ":::" + hubdata;
	log_file.write(logData);
        log_file.write("\r\n");
        log_file.write(" ");
//console.log ('Wrote to the client');
  });

  client.on('data', function(data) {
    // Close the client socket completely
         hubDataAck = data;
         var logData = log_Timestamp + ":::" + hubDataAck;
        log_file.write(logData);
        log_file.write("\r\n");
        log_file.write(" ");
        client.destroy();
        console.log(data.toString('utf8'));    
  });

  client.on('error',function () {

    var logData = log_Timestamp + ":::" + "Hub Not Connected";
    log_file.write(logData);
    log_file.write("\r\n");
    log_file.write(" ");
});

  client.on('close', function() {
     hubDataAck = hubDataAck;
   // console.log(hubDataAck.toString('utf8'));
    if(callType =="deviceReg" ){
       fileName='hubAck.txt';
    }else{
       fileName='hubAckManual.txt';
    }

   fs.writeFile(fileName, hubDataAck, function(err) {
      if(err) {
        return console.log(err);
      }
    });
        
	
   // console.log('Connection closed');
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


app.post('/api/networks/controllers/devices', function(req, res) {
 
   var deviceType = req.body.deviceType;
   var macAddress = req.body.macAddress;
   var guid = req.body.guid;
   var controllerIPAddress = req.body.controllerIPAddress;
   var controllerUniqueId = req.body.controllerUniqueId;
   var signature = ts.getSignature(controllerUniqueId,guid);
   var timeStamp = ts.getTimeStamp();
   var MessageType = 3;
   var serviceType = 12
   var regDeviceStr = "NTSYS" + ":" + signature + ":" + timeStamp + ":"  + MessageType + ":"  + serviceType + ":" + macAddress ;
   var callType = "deviceReg";
   var retdata = postToHub(regDeviceStr,callType)
   var data = fs.readFileSync("hubAck.txt");
   deviceDetails = data.toString().split(':');
   console.log("Device status:"+deviceDetails[11]);
   if(deviceDetails[11] == 0 ){
	   var resp = outBoundFun.getDeviceRegFailed(device_Reg_Failed);
    }else if(deviceDetails[11] == 1){
	  var resp = outBoundFun.getDeviceRegSuccess(deviceType,macAddress,device_Reg_Success);
    } else{
        var resp = outBoundFun.getDeviceRegFailed(connection_Failed);
   }
  /*fs.readFile("hubAck.txt", 'utf8', function (err,data) {
		  if (err) {
			return console.log(err);
		  }
		  var result = data.replace(data, 'CON_NOT_EST');

		  fs.writeFile("hubAck.txt", result, 'utf8', function (err) {
			 if (err) return console.log(err);
		  });
   });*/   
   res.send(resp); 
});


app.put('/api/networks/controllers/devices/profileStatus', function(req, res) {
 
   var deviceType = req.body.deviceType;
   var macAddress = req.body.macAddress;
   var guid = req.body.guid;
   var controllerIPAddress = req.body.controllerIPAddress;
   var controllerUniqueId = req.body.controllerUniqueId;
   var zoneId = req.body.zoneId;
   var profileStatus = req.body.profileStatus;
   var signature = ts.getSignature(controllerUniqueId,guid);
   var timeStamp = ts.getTimeStamp();
   var MessageType = 0;
   var serviceType = 14;
   if(profileStatus == 2){
      profileStatus = 0;
    }
   if(deviceType==1){
      messageType = 4;
    }else if(deviceType==2){
     messageType=3;
   }
   var regDeviceStr = "NTSYS" + ":" + signature + ":" + timeStamp + ":" + messageType +":" + serviceType + ":" + macAddress + ":" + zoneId + ":"  
   + profileStatus ;
   var callType="deviceManual";
   var retdata = postToHub(regDeviceStr,callType);
   var data = fs.readFileSync("hubAckManual.txt");
   deviceDetails = data.toString().split(':');
   if(deviceDetails[0] == ""|| deviceDetails[0] == undefined ){
       var resp = outBoundFun.getDeviceProfileFailed(device_Pro_Failed);
   }else{
      var resp = outBoundFun.getDeviceProfileSuccess(deviceType,macAddress,profileStatus,zoneId,device_Pro_Success);
    }
  res.send(resp); 	  

});

app.listen(port);
console.log('Server started!!');
