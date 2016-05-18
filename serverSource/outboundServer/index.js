var express = require ('express')
var app = express()
var net = require('net');
var client = new net.Socket();
var bodyParser = require ('body-parser');
var crypto = require ('crypto');


app.use (bodyParser.json());
app.use (bodyParser.urlencoded({extended: true}));

var port = process.env.PORT || 8082;
var hubPort = 2020;

function postToHub() {
  client.connect(hubPort, ipAddress, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    client.write('NTGreet0000-CC2D15800700-"Hello Server"');
    console.log ('Wrote to the client');
  });

  client.on('data', function(data) {
    console.log('DATA: ' + data);
    // Close the client socket completely
    client.destroy();
  });

  client.on('close', function() {
    console.log('Connection closed');
  });
}

app.get ('/api/health', function(req, res) {
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

app.listen(port);
console.log('Server started!!');
