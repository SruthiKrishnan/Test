var ts = require('/lib/tcplib');
var timeout = ts.getTimeStamp();
var GUID = '657a39ec-ff1e-480a-afc3-6c0db632b9fb';
var hudID = '868923040824208;MP85B2944008908';
var sign = ts.getSignature(hudID,GUID);
console.log("Time Log : " + timeout );
console.log("Signature : " + sign );