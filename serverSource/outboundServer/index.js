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
var Promise = require('bluebird');
var port = process.env.PORT || 8082;
var hubPort = 6969;
var ipAddress = "127.0.0.1";
hubDataAck ="";
app.use (bodyParser.json());
app.use (bodyParser.urlencoded({extended: true}));
var log_Timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
var today = new Date();
var log_FileName = today.toISOString().substring(0, 10) + "-" +"server.log";
var log_file  = fs.createWriteStream(__dirname + "/"+log_FileName, {flags : 'a'});
var i="";
function postToHub(hubdata,callType) {
   
        	  return new Promise(function(resolve, reject){

					client.connect(hubPort, ipAddress,function() {
					client.write(hubdata);
					console.log(hubdata);
					i =0 ;
					var logData = log_Timestamp + ":::" + hubdata;
					log_file.write(logData);
					log_file.write("\r\n");
					log_file.write(" ");		
				});

				client.on('data', function(data) {
					   hubDataAck = data;						    
					   client.destroy();         
				});	
					
				client.on('error',function () {
					var logData = log_Timestamp + ":::" + "Hub Not Connected";
					log_file.write(logData);
					log_file.write("\r\n");
					log_file.write(" ");	
			   });

				client.on('close', function() {					 
					hubDataAck = hubDataAck;						 	
					if(i==0){
						console.log(hubDataAck.toString('utf8'));
						var logData = log_Timestamp + ":::" + hubDataAck;
						log_file.write(logData);
						log_file.write("\r\n");
						log_file.write(" ");							   
					}
					i=i+1;					    
					 p = "success";
					 return resolve(hubDataAck);						
				});
		   
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
   var retdata = postToHub(regDeviceStr,callType).then(function(finalResult){
       deviceDetails = finalResult.toString().split(':');
       console.log(deviceDetails);
			if(deviceDetails[11] == 0 ){
			   var resp = outBoundFun.getDeviceRegFailed(device_Reg_Failed);
			}else if(deviceDetails[11] == 1){
                var resp = outBoundFun.getDeviceRegSuccess(deviceType,macAddress,device_Reg_Success);
			}else{
				var resp = outBoundFun.getDeviceRegFailed(connection_Failed);
			}	
	res.send(resp);        
   }).error(function(e){   
       console.log("Error handler " + e);
   }).catch(function(e){   
        console.log("Catch handler " + e);   
   });
    
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
   var retdata = postToHub(regDeviceStr,callType).then(function(finalResult){
   deviceDetails = finalResult.toString().split(':');
   console.log(deviceDetails);
	if(deviceDetails[0] == ""|| deviceDetails[0] == undefined ){
		  var resp = outBoundFun.getDeviceProfileFailed(device_Pro_Failed);
	}else{
		  var resp = outBoundFun.getDeviceProfileSuccess(deviceType,macAddress,profileStatus,zoneId,device_Pro_Success);
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
