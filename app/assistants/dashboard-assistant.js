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
	/*
	if (info != undefined) {
		this.controller.get("song-name").innerHTML = info;
	}
	if (msg != undefined) {
		this.controller.get("artist-name").innerHTML = msg;
	}
	*/
};

DashboardAssistant.prototype.pingWatch = function() {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: "de.metaviewsoft.mwatch",
			params: {command: "PING"}
		}
	});
};

DashboardAssistant.prototype.relaunchApp = function() {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: "de.metaviewsoft.mwatch"
		}
	});
};

DashboardAssistant.prototype.logInfo = function(logText, open) {
	//Mojo.Log.error("logInfo", logText);
	this.controller.get('log-output').innerHTML = "<strong>" + logText + "</strong><br />" + this.controller.get('log-output').innerHTML.substr(0, 300) + "<br /><br />";
	if (open) {
		this.controller.get('log-signal').style.backgroundColor = "green";
	} else {
		this.controller.get('log-signal').style.backgroundColor = "red";
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
	appController.closeStage("dashboard");
	this.controller.stopListening("dashicon", Mojo.Event.tap, this.iconHandler);
	this.controller.stopListening("dashtext", Mojo.Event.tap, this.textHandler);
};
