var crypto = require ('crypto');
var timestamp = new Date().valueOf();
var controllerHash = '09324568A31D3F87067DD4B4BBA40C7A';
var text = controllerHash + "|" + timestamp;
var secretKey = 'e6fa4659-9690-4253-bc94-50db9ee1e787';

var hash = crypto.createHmac('sha512', secretKey);
hash.update(text);
var signature = hash.digest('hex');
console.log ('Timestamp: ' + timestamp);
console.log('Signature: ' + signature);
