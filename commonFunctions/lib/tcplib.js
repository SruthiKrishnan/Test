//include crypto library
var crypto = require('crypto');
//Get Timestamp
exports.getTimeStamp = function (){

    var hrTime = process.hrtime();
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + month +  day + hour + min + sec+"."+hrTime[1];	
};
//Generate Signature
exports.getSignature = function(hubID,GUID) {

  var timeStamp = new Date().valueOf();
  var controllerHash = hubID;
  var text = controllerHash + "|" + timeStamp;
  var secretKey = GUID;
  var hash = crypto.createHmac('sha512',secretKey);
  hash.update(text);
  var signature = hash.digest('hex');
  return signature;
};

