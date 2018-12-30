var myAppId = "de.metaviewsoft.mwatch";
var watchType = "Pebble";
var appModel;
var systemModel = null;
var bluetoothModel = null;
var pebbleModel = null;
var MainStageName = "main";
var DashboardName = "dashboard";
var LoadingStageName = "loading"
var AppRunning = false;
var gblLaunchParams;
var gblRelaunched;
var gblTimeOutHdl = 0;
var timeoutValue = 0;
var lostConnectionValue = 0;
var closeWindowTimeout = false;
var radioOff = false;
var timeoutMusicPhoneValue = 5 * 60; // hardcoded: 5 min timeout for phone and music messages
var lastMusicAppId = "com.palm.app.musicplayer";

function AppAssistant (appController) {
	Mojo.Log.error("Creating app assistant");
	this.appController = appController;
	appModel = new AppModel();
	appModel.LoadSettings();
	systemModel = new SystemModel();
	pebbleModel = new PebbleModel(appModel.AppSettingsCurrent["perAppSettings"]);
	bluetoothModel = new BluetoothModel(this.logInfo, this.showInfo, pebbleModel, this.lastCommAttemptCallback, this);

    this.urlgap     = 'palm://com.palm.bluetooth/gap';
    this.urlspp     = 'palm://com.palm.bluetooth/spp';
    this.urlservice = 'palm://com.palm.service.bluetooth.spp';

	this.sppNotificationService = null;
	this.serverEnabled = false;
	this.instanceId = appModel.AppSettingsCurrent["lastInstanceId"];

	this.lastNotify = 0;
	this.logArray = [];
	this.lastMusicPhoneWrite = 0;

	watchType = appModel.AppSettingsCurrent["watchType"];
	if ((watchType != "Pebble") && (watchType != "MW150") && (watchType != "LiveView")) 
		watchType = "Pebble";

	patternDB = openDatabase("ext:WhiteList", "1.0", "WhiteList", "10000");
	refreshPatterns();
}

var closeWindowTimeout = false;
AppAssistant.prototype.handleLaunch = function(launchParams) {
	Mojo.Log.error("***** launch called with: " + JSON.stringify(launchParams) + " ******");
	clearTimeout(closeWindowTimeout);
	closeWindowTimeout = false;
	myAppId = Mojo.Controller.appInfo.id;
	gblLaunchParams = launchParams;
	if (launchParams.retryCount)
		sendAttempts = launchParams.retryCount;

	this.logInfo('Params: ' + Object.toJSON(launchParams));
	this.logInfo('Options: ' + Object.toJSON(appModel.AppSettingsCurrent));

	var dashboardProxy = this.controller.getStageProxy(DashboardName);
	if (dashboardProxy) {
		this.logInfo('App Dashboard launch, dashboard already exists.');
		dashboardFound = true;
		gblRelaunched = true;
		var dashboardStage = this.appController.getStageController(DashboardName);
		dashboardStage.delegateToSceneAssistant("displayDashboard", launchParams.dashInfo);
	} else {
		this.logInfo('Creating App Dashboard stage.');
		var pushDashboard = function (stageController) {
			stageController.pushScene(DashboardName, launchParams.dashInfo);
		};
		Mojo.Controller.getAppController().createStageWithCallback({name: DashboardName, lightweight: true}, pushDashboard, 'dashboard');
	};

	// Look for an existing main stage by name.
	var stageProxy = this.controller.getStageProxy(MainStageName);
	var stageController = this.controller.getStageController(MainStageName);
	if (stageProxy) {
		this.logInfo('App launching existing main scene.');
		gblRelaunched = true;
		// If the stage exists, just bring it to the front by focusing its window.
		// Or, if it is just the proxy, then it is being focused, so exit.
		if (stageController && launchParams && (typeof(launchParams) == 'object'))
		{
			stageController.window.focus();
		}
		this.doEventLaunch(launchParams);
		if (!(gblLaunchParams.dockMode || gblLaunchParams.touchstoneMode)) {
			stageProxy.delegateToSceneAssistant("handleLaunchParams");
		}
		return;
	} else {
		var useScene = MainStageName;
		if (launchParams && (typeof(launchParams) == 'object'))
		{
			this.logInfo('App launching with loading scene.');
			useScene = LoadingStageName;
		}
		var pushMainScene = function(stageController) {
			stageController.pushScene(useScene);
		};
		var stageArguments = {name: useScene, lightweight: true};
		this.controller.createStageWithCallback(stageArguments, pushMainScene, (gblLaunchParams.dockMode || gblLaunchParams.touchstoneMode) ? "dockMode" : "card");	
		this.doEventLaunch(launchParams);
		return;
	}
};

AppAssistant.prototype.abortIfRadioOff = function()
{
	radioOff = true;
	this.logInfo("Bluetooth radio reports off, not attempting to send message to watch.")
	var logText = "Bluetooth off: My Watch can't send."
	this.showInfo(logText);
	if (launchParams && (typeof(launchParams) == 'object')) {
		Mojo.Controller.getAppController().showBanner({messageText: logText, icon: 'icon24.png'}, "", "");
		this.closeAfterNotification();
	}
}

AppAssistant.prototype.doEventLaunch = function(launchParams)
{
	// Check if the radio is off -- in which case, we abort
	bluetoothModel.getRadioState(null, null, null, this.abortIfRadioOff.bind(this));

	// Register for SPP Notifications	
	if (!this.sppNotificationService) {
		if (watchType == "MW150") {
			this.subscribe();
		} else if (watchType == "Pebble") {
			// bluetooth
			this.logInfo("Getting trusted devices " + this.urlgap);
			new Mojo.Service.Request(this.urlgap, {
				method: 'gettrusteddevices',
				parameters: {},
				onSuccess: function (e) {
					this.logInfo("Successful trusted devices query: " + JSON.stringify(e));
					for (var i=0; i<e.trusteddevices.length; i++) {
						if (e.trusteddevices[i].name.search(/Pebble/i) > -1) {
							this.logInfo("Connecting to trusted device: " + e.trusteddevices[i].name);
							this.targetAddress = e.trusteddevices[i].address;
							bluetoothModel.connect(watchType, this.targetAddress, this.subscribe());
							break;
						}
						else
						this.logInfo("Can't find a pebble", "error");
					}
				}.bind(this),
				onFailure: function (e) {Mojo.Log.error("Failure to query trusted devices: "+JSON.stringify(e));}.bind(this)
			});
			
		} else if (watchType == "LiveView") {
			this.subscribe();
		}
	}
	this.sendLaunchMessageToWatch();
}

AppAssistant.prototype.subscribe = function() {
	if (this.sppNotificationService == null)
	{
		this.showInfo("Subscribing to Bluetooth notifications.");
		var msg = {
			method: "subscribenotifications",
			parameters: {"subscribe": true},
			onSuccess: this.sppNotify.bind(this),
			onFailure: function (e) {
				this.showInfo("Failed to subscribe to Bluetooth notifications!");
				this.sppNotificationService.cancel();
				this.sppNotificationService = null;
			}.bind(this)
		};
		this.sppNotificationService = new Mojo.Service.Request(this.urlspp, msg);
	}
	else
	{
		this.logInfo("Not re-subscribing to notifications. Handler already subscribed.", "error");
	}
};

//Notification handler for SPP events.
AppAssistant.prototype.sppNotify = function(objData)
{
	this.logInfo("SPP Notification for " + watchType + " " + Object.toJSON(objData));
	this.lastNotify = (new Date()).getTime();
	if (!objData.notification) {
		if ((watchType == "MW150") || (watchType == "LiveView")) {
			if (objData.returnValue && objData.subscribed) {
				this.enableserver(true);
			}
		} else if (watchType == "Pebble") {
		}
		return;
	}

	timeoutValue = appModel.AppSettingsCurrent["timeoutValue"];
	lostConnectionValue = appModel.AppSettingsCurrent["lostConnectionValue"];
	appModel.AppSettingsCurrent["sppState"] = objData.notification;

	switch(objData.notification)
	{
		case "notifnserverenabled":
			this.logInfo(objData.notification + ((objData.error != 0) ? (" Error = " + objData.error) : ""));
			if (objData.error == 0) {
				this.showInfo("Ready for connection.");
			} else {
				this.showInfo("Error getting ready for connection.");
			}
			break;

		case "notifnserverdisabled":
			this.logInfo(objData.notification + " Error = " + objData.error);
			this.showInfo("Error: notification server disabled");
			this.ServerEnabled = false;
			//this.enableserver(true);
			break;

		case "notifnconnected":
			this.logInfo(objData.notification + " InstanceId = " + objData.instanceId + ((objData.error != 0) ? (" Error = " + objData.error) : ""));
			if (objData.error != 0) {
				this.showInfo("Error " + objData.error + " with notification connection to " + watchType);
				this.logInfo(JSON.stringify(objData), "error");
			}
			this.showInfo("Connected to " + watchType);
			this.instanceId = objData.instanceId;
			bluetoothModel.open(this.urlservice, watchType, this.instanceId, this.targetAddress);
			break;

		case "notifndisconnected":
			if ((watchType == "MW150") || (watchType == "LiveView")) {
				this.showInfo("Connection terminated/Out of range.");
				this.ServerEnabled = false;
				this.enableserver(true);
			} else if (watchType == "Pebble") {
				this.showInfo("Connection terminated/Out of range.");
				if (lostConnectionValue && (timeoutValue == 0)) {
					clearTimeout(gblTimeOutHdl);
					gblTimeOutHdl = setTimeout(this.playAlarm.bind(this), 1000, 0);
				}
				bluetoothModel.close(watchType, this.instanceId, this.targetAddress);
			}
			//this.enableserver(false);
			break;

		case "notifnservicenames":
			this.instanceId = objData.instanceId;
			new Mojo.Service.Request(this.urlspp, {
				method: 'selectservice',
				parameters: {
					"instanceId": objData.instanceId,
					"servicename": objData.services[0]
				}
			});
			break;

		default:
			this.logInfo(objData.notification + " " + Object.toJSON(objData));
			break;
	}
};

var sendAttempts = 0;
var sendRetryTimeout = false;
AppAssistant.prototype.sendLaunchMessageToWatch = function()
{
	//Check if this app is allowed to send a message, per the preferences
	if (appModel.AppSettingsCurrent["inactiveAllNotifications"] > 0)
	{
		this.showInfo("All notifications disabled, not sending to watch.");
		return;
	}
	launchParams = gblLaunchParams;
	clearTimeout(sendRetryTimeout);
	sendRetryTimeout = false;
	if (launchParams && (typeof(launchParams) == 'object') && !radioOff) {
		this.logInfo("We have a message to send to the watch, checking for connection.");
		if (this.getOpen())
		{
			this.logInfo("SPP connection reports ready. Sending message to watch.");
			if (launchParams.command == "SMS") {
				if (appModel.AppSettingsCurrent.perAppSettings["com.palm.app.messaging"].inactive == 0)
				{
					bluetoothModel.sendInfo(launchParams.info, launchParams.wordwrap, launchParams.icon, launchParams.reason, "com.palm.app.messaging", true, watchType, this.instanceId, this.targetAddress);
				}
				else
				{
					this.showInfo("SMS disabled, not sending to watch.");
					return;
				}
			} else if (launchParams.command == "RING") {
				if (appModel.AppSettingsCurrent.perAppSettings["com.palm.app.phone"].inactive == 0)
				{
					bluetoothModel.sendRing(launchParams.caller, launchParams.number, watchType, this.instanceId, this.targetAddress);
				}
				else
				{
					this.showInfo("Phone disabled, not sending to watch.");
					return;
				}
			} else if (launchParams.command == "INFO" && launchParams.appid ) {
				if (appModel.AppSettingsCurrent.perAppSettings[launchParams.appid] && appModel.AppSettingsCurrent.perAppSettings[launchParams.appid].inactive == 0)
				{
					bluetoothModel.sendInfo(launchParams.info, launchParams.wordwrap, launchParams.icon, launchParams.reason, launchParams.appid, false, watchType, this.instanceId, this.targetAddress);
				}
				else
				{
					this.showInfo(appModel.AppSettingsCurrent.perAppSettings[launchParams.appid].name + " disabled, not sending to watch.");
					return;
				}
			} else if (launchParams.command == "INFO" && !launchParams.appid) {
				if (appModel.AppSettingsCurrent.inactiveOtherNotifications == 0)
				{
					bluetoothModel.sendInfo(launchParams.info, launchParams.wordwrap, launchParams.icon, launchParams.reason, myAppId, false, watchType, this.instanceId, this.targetAddress);
				}
				else
				{
					this.showInfo("Other apps disabled, not sending to watch.");
					return;
				}
			} else if (launchParams.command == "HANGUP") {
				bluetoothModel.hangup(watchType, this.instanceId, this.targetAddress);
			} else if (launchParams.command == "PING") {
				bluetoothModel.sendPing("", "", watchType, this.instanceId, this.targetAddress);
			}
			checkMessageSentTimeout = setTimeout(this.checkMessageSentToWatch.bind(this), 2000);
		}
		else
		{
			sendAttempts++;
			sppState = appModel.AppSettingsCurrent["sppState"];
			this.logInfo("SPP not ready for messages. State is: " + sppState + ".");
			if (sendAttempts == 5 || sendAttempts == 15 || sendAttempts == 25 || sendAttempts == 50 || sendAttempts == 70)
			{
				if (sppState == "notifndisconnected" || sppState == "notifnconnected")
				{
					this.logInfo("Trying to restart sending procedure.");
					appModel.AppSettingsCurrent["sppState"] = "notyetconnected";
					setTimeout(this.relaunchApp.bind(this), 3000);
					return;
				}
			}
			else if (sendAttempts >= 75)
			{
				this.logInfo("Nothing left to try. Unable to send message.");
				sendAttempts = 0;
				this.cleanup();
				this.checkMessageSentToWatch();
			}
			else
			{
				this.logInfo("Waiting to re-try (" + sendAttempts + ").")
				sendRetryTimeout = setTimeout(this.sendLaunchMessageToWatch.bind(this), 3000);
			}
		}
	}
	else
	{
		this.logInfo("No message found to send to watch.");
	}
	
}

var lastMessageSentStatus = false;
var checkMessageSentTimeout = false;
AppAssistant.prototype.checkMessageSentToWatch = function()
{
	clearTimeout(checkMessageSentTimeout);
	checkMessageSentTimeout = false;
	this.logInfo("Checking to see if last message sent successfully. Open is: " + this.getOpen() + ", last status is: " + bluetoothModel.getLastCommStatus());
	if (this.getOpen() && bluetoothModel.getLastCommStatus())
	{
		this.showInfo(gblLaunchParams.command + " message sent to " + watchType, logger);
		var stageProxy = this.controller.getStageProxy(MainStageName);
		if (!stageProxy)
		{
			this.logInfo("Main window not found. Shutting down after successful notification in 8 seconds.");
			closeWindowTimeout = setTimeout(this.closeAfterNotification.bind(this), 8000);
		}
		else
			this.logInfo("Main window was found. NOT shutting down after successful notification.");
	}
	else
	{
		this.logInfo("NOT shutting down after failed notificiation.");
		this.cleanup();
		this.showInfo(gblLaunchParams.command + " message to " + watchType + " failed", logger);
	}
}

AppAssistant.prototype.closeAfterNotification = function()
{
	//TODO: If the main scene doesn't exist, close the dashboard
	var stageProxy = this.controller.getStageProxy(MainStageName);
	if (!stageProxy)
	{
		closeWindowTimeout = false;
		clearTimeout(closeWindowTimeout);
		var appController = Mojo.Controller.getAppController();
		appController.closeAllStages();
	}
}

AppAssistant.prototype.relaunchApp = function() {
	gblLaunchParams.retryCount = sendAttempts;
	systemModel.SetSystemAlarmRelative("00:00:05", gblLaunchParams);
	var appController = Mojo.Controller.getAppController();
	appController.closeAllStages();
};

AppAssistant.prototype.getOpen = function() {
	return bluetoothModel.getOpen();
};

AppAssistant.prototype.enableserver = function(enable) {
	if (enable) {
		if (!this.ServerEnabled && !this.InEnableServer) {
			this.InEnableServer = true;
			this.logInfo("enabling server " + this.InEnableServer);
			new Mojo.Service.Request(this.urlspp, {
				method: 'enableserver',
				parameters: {"servicename": "SPP slave"},
				onSuccess: function (e) {
					this.InEnableServer = false;
					this.ServerEnabled = true;
					this.logInfo("Enableserver success");
				}.bind(this),
				onFailure: function (e) {
					this.InEnableServer = false;
					this.ServerEnabled = false;
					this.logInfo("Enableserver failure " + Object.toJSON(e));
				}.bind(this)
			});
		}
	} else {
		if (this.ServerEnabled) {
			this.logInfo("disabling server");
			new Mojo.Service.Request(this.urlspp, {
				method: 'disableserver',
				parameters: {"servicename": "SPP slave"},
				onSuccess: function (e) {
					this.ServerEnabled = false;
					this.logInfo("Disableserver success");
				}.bind(this),
				onFailure: function (e) {
					this.ServerEnabled = true;
					this.logInfo("Disableserver failure " + Object.toJSON(e));
				}.bind(this)
			});
		}
	}
};

AppAssistant.prototype.playAlarm = function(cnt) {
	Mojo.Controller.getAppController().playSoundNotification("vibrate", "");
	if (cnt < 5) {
		setTimeout(this.playAlarm.bind(this), 1000, cnt+1);
	}
};

AppAssistant.prototype.EvalPixel = function(inputData, index, value, THRESHOLD) {
	if ((inputData[index + 0] + inputData[index + 1] + inputData[index + 2] + inputData[index + 3]) > THRESHOLD) {
		return value;
	}
	return 0;
};

var lastLoggingConnectionStatus = false;
AppAssistant.prototype.logInfo = function(logText, level) {
	if (level == "info")
		Mojo.Log.info(logText);
	else if (level == "warn")
		Mojo.Log.info(logText);
	else
		Mojo.Log.error(logText);

	lastLoggingConnectionStatus = bluetoothModel.getOpen()
	//Update UI loggers, if present
	var stageProxy = Mojo.Controller.getAppController().getStageProxy(MainStageName);
	if (stageProxy) {
		stageProxy.delegateToSceneAssistant("logInfo", logText, lastLoggingConnectionStatus, level);
	}
	var stageProxy = Mojo.Controller.getAppController().getStageProxy(DashboardName);
	if (stageProxy) {
		stageProxy.delegateToSceneAssistant("logInfo", logText, lastLoggingConnectionStatus, level);
	}
};

AppAssistant.prototype.sendLog = function() {
	//Removed a section that seemed to send text messages to someone in Texas
	return;
};

AppAssistant.prototype.showInfo = function(logText, logger) {
	var stageProxy = Mojo.Controller.getAppController().getStageProxy(DashboardName);
	if (stageProxy) {
		stageProxy.delegateToSceneAssistant("showInfo", logText, bluetoothModel.getOpen());
	}
	else
		Mojo.Controller.getAppController().showBanner({messageText: logText, icon: 'icon24.png'}, "", "");
	
	if (logger)
		logger(logText);
	else
		this.logInfo(logText, "error");
};

AppAssistant.prototype.cleanup = function(event) {
	//Forceable clean-up of SPP device files
	systemModel.deleteFile("/dev/spp_tx_" + this.instanceId);
	systemModel.deleteFile("/dev/spp_rx_" + this.instanceId);
	appModel.AppSettingsCurrent["lastInstanceId"] = this.instanceId;
	appModel.SaveSettings();

	if (this.sppNotificationService)
		this.sppNotificationService.cancel();
	this.sppNotificationService = null
	bluetoothModel.close(watchType, this.instanceId, this.targetAddress);

	Mojo.Log.error ("Cleaned up Bluetooth connections");
};

String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		var chr = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
};

findAppIdByName = function(name)
{
	for (var app in appModel.AppSettingsCurrent.perAppSettings) {
		if (appModel.AppSettingsCurrent.perAppSettings[app].name.toLowerCase() == name.toLowerCase())
			return app;
	}
	Mojo.Log.error("App ID couldn't be resolved for the app name " + name);
}

refreshPatterns = function() {
	pattern = [];
	patternDB.transaction(function (tx) {
		tx.executeSql("SELECT pattern FROM WhiteList; GO;", [],
			function(tx, result) {
				if (result.rows) {
					for (var i=0; i<result.rows.length; i++) {
						var row = result.rows.item(i);
						pattern.push(row.pattern);
					}
				}
			}.bind(this),
			function(tx, error) {}
		);
	}.bind(this));
};