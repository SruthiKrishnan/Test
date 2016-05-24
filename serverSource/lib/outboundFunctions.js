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

