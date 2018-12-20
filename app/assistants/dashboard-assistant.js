function DashboardAssistant() {
}

DashboardAssistant.prototype.setup = function() {
	this.iconHandler = this.pingWatch.bindAsEventListener(this);
	this.textHandler = this.relaunchApp.bindAsEventListener(this);
	this.controller.listen("dashicon", Mojo.Event.tap, this.iconHandler);
	this.controller.listen("dashtext", Mojo.Event.tap, this.textHandler);

	var cookie = new Mojo.Model.Cookie("LastInfo");
	var info = cookie.get();
	var cookie = new Mojo.Model.Cookie("LastMsg");
	var msg = cookie.get();
};

DashboardAssistant.prototype.pingWatch = function() {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: myAppId,
			params: {command: "PING"}
		}
	});
};

DashboardAssistant.prototype.relaunchApp = function() {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: myAppId
		}
	});
};

DashboardAssistant.prototype.logInfo = function(logText, open) {
	//Mojo.Log.error("logInfo", logText);
	this.controller.get('log-output').innerHTML = "<strong>" + logText + "</strong><br />" + this.controller.get('log-output').innerHTML.substr(0, 300) + "<br /><br />";
	var signalDiv = this.controller.get('log-signal');
	if (open) {
		signalDiv.style.backgroundColor = "green";
		signalDiv.innerHTML = "<img src='images/watch-ok.png'>";
	} else {
		signalDiv.style.backgroundColor = "red";
		signalDiv.innerHTML = "<img src='images/watch-no.png'>";
	}
};

DashboardAssistant.prototype.considerForNotification = function(event) {
	Mojo.Log.error("considerForNotification");
};

DashboardAssistant.prototype.activate = function(event) {
	Mojo.Log.error("dashboard activate");
};

DashboardAssistant.prototype.deactivate = function(event) {
	Mojo.Log.error("dashboard deactivate");
};

// Close the dashboard
DashboardAssistant.prototype.cleanup = function() {
	var appController = Mojo.Controller.getAppController();
	appController.closeStage(watchType, "dashboard");
	this.controller.stopListening("dashicon", Mojo.Event.tap, this.iconHandler);
	this.controller.stopListening("dashtext", Mojo.Event.tap, this.textHandler);
};
