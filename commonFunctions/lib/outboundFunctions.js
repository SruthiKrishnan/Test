//Get Timestamp
exports.getDeviceRegSuccess = function (deviceType,macAddress,msg){

    var deviceSucessMsg = {
                "code": 200,
               "message": msg,
               "data": { "deviceType": deviceType, "macAddress": macAddress }                                         
    };	
			
	return deviceSucessMsg;
};

exports.getDeviceRegFailed = function (msg) {

	var deviceFailedmsg = {
		"code": 400,
		"message": msg,
		"error": null
    };		
		return deviceFailedmsg;

};

exports.getDeviceProfileSuccess = function (deviceType,macAddress,profileStatus,zoneId,msg){

    var devicePorfileSucessMsg = {
                "code": 200,
               "message": msg,
               "data": { "deviceType": deviceType, "macAddress": macAddress,"profileStatus" : profileStatus ,"zoneId":zoneId }                                         
    };	
			
	return devicePorfileSucessMsg;
};

exports.getDeviceProfileFailed = function (msg) {

	var deviceProfileFailedmsg = {
		"code": 400,
		"message": msg,
		"error": null
    };		
		return deviceProfileFailedmsg;

};

