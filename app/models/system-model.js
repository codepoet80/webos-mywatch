
var SystemModel = function() {
}

SystemModel.prototype.deleteFile = function(file, onSuccess, onFailure) {
	return this.doFileRequest('delete', {file:file}, onSuccess, onFailure);
};

SystemModel.prototype.checkFileExists = function(file, onSuccess, onFailure) {
	return this.doFileRequest('exists', {file:file}, onSuccess, onFailure);
}

SystemModel.prototype.doFileRequest = function(method, params, onSuccess, onFailure) {
	Mojo.Log.info("Sending file service request for: " + JSON.stringify(params))
	fileRequest = new Mojo.Service.Request("palm://ca.canucksoftware.filemgr", {
		method: method,
		parameters: params || {},
		onSuccess: onSuccess || Mojo.doNothing,
		onFailure: onFailure || Mojo.doNothing
	});
	return fileRequest;
};

//Create a named System Alarm using relative time ("in")
SystemModel.prototype.SetSystemAlarmRelative = function(alarmTime, params)
{
	var success = true;
    this.wakeupRequest = new Mojo.Service.Request("palm://com.palm.power/timeout", {
		method: "set",
		parameters: {
			"key": Mojo.Controller.appInfo.id + "-Relaunch",
			"in": alarmTime,
			"wakeup": true,
			"uri": "palm://com.palm.applicationManager/open",
			"params": {
				"id": Mojo.Controller.appInfo.id,
				"params": params
			}
		},
		onSuccess: function(response) {
			Mojo.Log.info("Alarm Set Success", JSON.stringify(response));
			success = true;
		},
		onFailure: function(response) {
			Mojo.Log.error("Alarm Set Failure, " + alarmTime + ":",
				JSON.stringify(response), response.errorText);
			success = false;
		}
	});
	return success;
}