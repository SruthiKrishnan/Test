var tls = require('tls');
var fs  = require('fs');
var host = 'localhost';
var port = 4001;

var options = {
  key:  fs.readFileSync('../certs/tlsclient.key'),
  cert: fs.readFileSync('../certs/tlsclient.crt')
};

 
var client = tls.connect(port, host, options, function() {
  console.log('connected');
});
