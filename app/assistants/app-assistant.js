var gblLaunchParams;
var gblRelaunched;

var watchType = "Pebble";

var gblTimeOutHdl = 0;

var valueAll = 0;
var valueOther = 0;

var appidPhone = "com.palm.app.phone";
var valuePhone = 0;
var namePhone = "Phone";
var appidEmail = "com.palm.app.email";
var valueEmail = 0;
var nameEmail = "Email";
var appidMessage = "com.palm.app.messaging";
var valueMessage = 0;
var nameMessage = "Messaging";
var appidMusicPlayer = "com.palm.app.musicplayer";
var valueMusicPlayer = 0;
var nameMusicPlayer = "Music";
var appidMusicRemix = "com.hedami.musicplayerremix";
var valueMusicRemix = 0;
var nameMusicRemix = "Music";
var appidMacaw = "net.minego.phnx";
var valueMacaw = 0;
var nameMacaw = "Twitter";
var appidBattery = "luna.battery.alert";
var valueBattery = 0;
var nameBattery = "Battery";
var appidCalendar = "com.palm.app.calendar";
var valueCalendar = 0;
var nameCalendar = "Calendar";

var timeoutValue = 0;
var timeoutMusicPhoneValue = 5 * 60; // hardcoded: 5 min timeout for phone and music messages
var lostConnectionValue = 0;

var lastMusicAppId = appidMusicPlayer;

var MainStageName = "main";
var DashboardName = "dashboard";
var bluetoothModel = null;
function AppAssistant (appController) {
	this.appController = appController;
	bluetoothModel = new BluetoothModel(this.logInfo, this.showInfo);

    this.urlgap     = 'palm://com.palm.bluetooth/gap';
    this.urlspp     = 'palm://com.palm.bluetooth/spp';
    this.urlservice = 'palm://com.palm.service.bluetooth.spp';

	this.sppNotificationService = null;
	this.serverEnabled = false;
	this.instanceId = -1;

	this.lastNotify = 0;
	this.logArray = [];

	this.lastMusicPhoneWrite = 0;

	var cookie = new Mojo.Model.Cookie("WATCH");
	watchType = cookie.get();
	if ((watchType != "Pebble") && (watchType != "MW150") && (watchType != "LiveView")) {watchType = "Pebble";}

	patternDB = openDatabase("ext:WhiteList", "1.0", "WhiteList", "10000");
	refreshPatterns();
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

AppAssistant.prototype.timerHandler = function() {
	bluetoothModel.read(watchType, this.instanceId, this.targetAddress);
	//gblUpdateID = setTimeout(this.timerHandler.bind(this), 5000);
};

AppAssistant.prototype.getOpen = function() {
	return bluetoothModel.getOpen();
};

AppAssistant.prototype.subscribe = function() {
	this.showInfo("Subscribing to Bluetooth notifications");
	var msg = {
		method: "subscribenotifications",
		parameters: {"subscribe": true},
		onSuccess: this.sppNotify.bind(this),
		onFailure: function (e) {
			this.logInfo("subscribe failure " + e.errorText);
			this.sppNotificationService = null;
		}.bind(this)
	};
	this.sppNotificationService = new Mojo.Service.Request(this.urlspp, msg);
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

//Notification handler for SPP events.
AppAssistant.prototype.sppNotify = function(objData)
{
	var that = this; // for scoping

	this.logInfo("sppNotify started for " + watchType + " " + Object.toJSON(objData));
	this.lastNotify = (new Date()).getTime();
	if (!objData.notification) {
		if (valueAll == 2) {
			return;
		}
		if ((watchType == "MW150") || (watchType == "LiveView")) {
			if (objData.returnValue && objData.subscribed) {
				this.enableserver(true);
			}
		} else if (watchType == "Pebble") {
		}
		return;
	}
	var cookie = new Mojo.Model.Cookie("TIMEOUT");
	timeoutValue = cookie.get();

	var cookie = new Mojo.Model.Cookie("LOSTCONNECTION");
	lostConnectionValue = cookie.get();

	switch(objData.notification)
	{
		case "notifnserverenabled":
			this.logInfo(objData.notification + ((objData.error != 0) ? (" Error = " + objData.error) : ""));
			if (objData.error == 0) {
				this.showInfo("Ready for connection.");
			} else {
				this.showInfo("Error, try re-enabling Bluetooth.");
			}
			break;

		case "notifnserverdisabled":
			this.logInfo(objData.notification + " Error = " + objData.error);
			this.ServerEnabled = false;
			//this.enableserver(true);
			break;

		case "notifnconnected":
			this.logInfo(objData.notification + " InstanceId = " + objData.instanceId + ((objData.error != 0) ? (" Error = " + objData.error) : ""));
			if (objData.error == 0) {
				this.instanceId = objData.instanceId;
				bluetoothModel.open(this.urlservice, watchType, this.instanceId, this. targetAddress);
			}
			break;

		case "notifndisconnected":
			if ((watchType == "MW150") || (watchType == "LiveView")) {
				this.showInfo("Connection terminated/Out of range.");
				this.ServerEnabled = false;
				this.enableserver(true);
			} else if (watchType == "Pebble") {
				this.logInfo("Connection terminated/Out of range.");
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

AppAssistant.prototype.playAlarm = function(cnt) {
	Mojo.Controller.getAppController().playSoundNotification("vibrate", "");
	if (cnt < 5) {
		setTimeout(this.playAlarm.bind(this), 1000, cnt+1);
	}
};

CreateLVMsg = function(id, payload) {
	var result = [];
	result.push(id);
	result.push(0x04);
	result.push((payload.length >> 24) & 0xff, (payload.length >> 16) & 0xff, (payload.length >> 8) & 0xff, payload.length & 0xff);
	for (var i=0; i<payload.length; i++) {
		result.push(payload[i]);
	}
	this.logInfo(result + " " + result.length);
	for (var i=0; i<result.length; i++) {
		this.logInfo(result[i]);
	}
	return result;
};

ConvertString = function(payload) {
	var result = [];
	result.push(payload.length);
	for (var i=0; i<payload.length; i++) {
		result.push(payload.charCodeAt(i));
	}
	return result;
};

AppAssistant.prototype.EvalPixel = function(inputData, index, value, THRESHOLD) {
	if ((inputData[index + 0] + inputData[index + 1] + inputData[index + 2] + inputData[index + 3]) > THRESHOLD) {
		return value;
	}
	return 0;
};

Dec2Hex = function(decimal) {
	//Mojo.Log.error(decimal);
	var hexChars = "0123456789ABCDEF";
	var a = decimal % 16;
	var b = (decimal - a)/16;
	hex = "" + hexChars.charAt(b) + hexChars.charAt(a);
	return hex;
};

padString = function(str, len) {
	str = "" + str;
	if (str.length > len) {
		return str.substr(str.length - len);
	}
	while (str.length < len) {
		str = "0" + str;
	}
	return str;
};

AppAssistant.prototype.logInfo = function(logText) {
	Mojo.Log.error(logText);
	var stageProxy = Mojo.Controller.getAppController().getStageProxy(MainStageName);
	if (stageProxy) {
		stageProxy.delegateToSceneAssistant("logInfo", logText, bluetoothModel.getOpen());
	}
	var stageProxy = Mojo.Controller.getAppController().getStageProxy(DashboardName);
	if (stageProxy) {
		stageProxy.delegateToSceneAssistant("logInfo", logText, bluetoothModel.getOpen());
	}
	//this.logArray.push(encodeURIComponent(logText));
	//if (this.logArray.length == 1) {
	//	this.sendLog();
	//}
};

AppAssistant.prototype.sendLog = function() {
	//Removed a section that seemed to send text messages to someone in Texas
	return;
};

AppAssistant.prototype.showInfo = function(logText, logger) {
	Mojo.Controller.getAppController().showBanner({messageText: logText, icon: 'icon24.png'}, "", "");
	if (logger)
		logger(logText);
	else
		this.logInfo(logText);
};

AppAssistant.prototype.showMsg = function(logText) {
	Mojo.Controller.getAppController().showBanner({messageText: logText, icon: 'icon24.png'}, "", "");
};

AppAssistant.prototype.cleanup = function(event) {
	bluetoothModel.close(watchType, this.instanceId, this.targetAddress);
	//this.enableserver(false);

	new Mojo.Service.Request("palm://com.palm.power/com/palm/power", {
		method: "activityEnd",
		parameters: {
			id: Mojo.appInfo.id + "-1"
		},
		onSuccess: function() {},
		onFailure: function() {}
	});

};

var closeWindowTimeout = false;
AppAssistant.prototype.handleLaunch = function(launchParams) {
	//clearTimeout(closeWindowTimeout);
	//closeWindowTimeout = false;
	gblLaunchParams = launchParams;
	this.loadCookieValues();
	this.logInfo('Params: ' + Object.toJSON(launchParams));

	try {
		var dashboardFound = false;
		if (launchParams && (typeof(launchParams) == 'object')) {
			var dashboardStage = this.appController.getStageController(DashboardName);
			if (dashboardStage) {
				this.logInfo('App Dashboard launch, dashboard already exists.');
				gblRelaunched = true;
				dashboardStage.delegateToSceneAssistant("displayDashboard", launchParams.dashInfo);
				dashboardFound = true;
			} else {
				this.logInfo('App Dashboard launch, dashboard could not be found');
			};
		}
		if (!dashboardFound)
		{
			// Look for an existing main stage by name.
			var stageProxy = this.controller.getStageProxy(MainStageName);
			var stageController = this.controller.getStageController(MainStageName);
			if (stageProxy) {
				this.logInfo('App launching existing main scene.');
				gblRelaunched = true;
				// If the stage exists, just bring it to the front by focusing its window.
				// Or, if it is just the proxy, then it is being focused, so exit.
				if (stageController) {
					//stageController.window.focus();
				}
				if (!(gblLaunchParams.dockMode || gblLaunchParams.touchstoneMode)) {
					stageProxy.delegateToSceneAssistant("handleLaunchParams");
				}
			} else {
				this.logInfo('App launching with new main scene.');
				gblRelaunched = false;
				// Create a callback function to set up the new main stage
				// after it is done loading. It is passed the new stage controller
				// as the first parameter.
				var pushMainScene = function(stageController) {
					stageController.pushScene(MainStageName);
				};
				var stageArguments = {name: MainStageName, lightweight: true};
				// Specify the stage type with the last property.
				this.controller.createStageWithCallback(stageArguments, pushMainScene, (gblLaunchParams.dockMode || gblLaunchParams.touchstoneMode) ? "dockMode" : "card");
			}
		}

		if (launchParams && (typeof(launchParams) == 'object')) {
			Mojo.Log.error("***** launch called with: " + JSON.stringify(launchParams) + " ******");
			if (1 || bluetoothModel.getOpen()) {
				if (launchParams.command == "SMS") {
					bluetoothModel.sendInfo(launchParams.info, launchParams.wordwrap, launchParams.icon, launchParams.reason, appidMessage, true, watchType, this.instanceId, this.targetAddress);
				} else if (launchParams.command == "RING") {
					bluetoothModel.sendRing(launchParams.caller, launchParams.number, watchType, this.instanceId, this.targetAddress);
				} else if (launchParams.command == "INFO") {
					bluetoothModel.sendInfo(launchParams.info, launchParams.wordwrap, launchParams.icon, launchParams.reason, launchParams.appid, false, watchType, this.instanceId, this.targetAddress);
				} else if (launchParams.command == "HANGUP") {
					bluetoothModel.hangup(watchType, this.instanceId, this.targetAddress);
				} else if (launchParams.command == "PING") {
					bluetoothModel.sendPing("", "", watchType, this.instanceId, this.targetAddress);
				}
			}
			//If we weren't already running, and this is a notification launch, we should close ourselves after a delay
			//	So as not to annoy the user
			if (!gblRelaunched)
			{
				clearTimeout(closeWindowTimeout);
				closeWindowTimeout = false;
				switch (launchParams.command)
				{
					case "RING":
					{
						Mojo.Log.warn("****** This is a ring, waiting 12 seconds to close");
						//closeWindowTimeout = setTimeout("closeAfterNotification()", 12000);
						break;
					}
					default:
					{
						Mojo.Log.warn("****** This is another notification, waiting 3 seconds to close");
						//closeWindowTimeout = setTimeout("closeAfterNotification()", 3500);
						break;
					}
				}
			}
				
		}

		var now = (new Date()).getTime();
		this.logInfo("handleLaunch " + watchType + " " + (now - this.lastNotify));
		// not registered for notification or last notification too long ago
		if (!this.sppNotificationService) {
			if (watchType == "MW150") {
				this.subscribe();
			} else if (watchType == "Pebble") {
				// bluetooth
				Mojo.Log.warn("** subscribing to pebble");
				this.subscribe();
				this.logInfo("** gettrusteddevices start " + this.urlgap);
				new Mojo.Service.Request(this.urlgap, {
					method: 'gettrusteddevices',
					parameters: {},
					onSuccess: function (e) {
						Mojo.Log.error("gettrusteddevices success");
						for (var i=0; i<e.trusteddevices.length; i++) {
							Mojo.Log.error(e.trusteddevices[i].name + " " + e.trusteddevices[i].address);
							if (e.trusteddevices[i].name.search(/Pebble/i) > -1) {
								//buttons.push({label: e.trusteddevices[i].name, value: e.trusteddevices[i].address});
								Mojo.Log.error("** Connecting to " + e.trusteddevices[i].name);
								this.targetAddress = e.trusteddevices[i].address;
								bluetoothModel.connect(watchType, this.targetAddress);
								Mojo.Log.error("** Connected to " + e.trusteddevices[i].name);
								break;
							}
							else
								Mojo.Log.error("can't find a pebble");
						}
					}.bind(this),
					onFailure: function (e) {tMojo.Log.error("gettrusteddevices failure, results="+JSON.stringify(e));}.bind(this)
				});
				this.logInfo("** gettrusteddevices done " + this.urlgap);
			} else if (watchType == "LiveView") {
				this.subscribe();
			}
		}
	} catch (e) {
		Mojo.Log.error(e);
	}
};

closeAfterNotification = function()
{
	closeWindowTimeout = false;
	clearTimeout(closeWindowTimeout);
	Mojo.Log.error("Closing after notification");
	Mojo.Controller.getAppController().closeAllStages()
}

AppAssistant.prototype.loadCookieValues = function()
{
	var cookie = new Mojo.Model.Cookie("TIMEOUT");
	timeoutValue = cookie.get();

	var cookie = new Mojo.Model.Cookie("LOSTCONNECTION");
	lostConnectionValue = cookie.get();

	var cookie = new Mojo.Model.Cookie("ALL");
	valueAll = cookie.get();
	if (!(valueAll >= 0 && valueAll <= 2)) {valueAll = 0;}
	var cookie = new Mojo.Model.Cookie("OTHER");
	valueOther = cookie.get();
	if (!(valueOther >= 0 && valueOther <= 2)) {valueOther = 0;}
	var cookie = new Mojo.Model.Cookie("PHONE");
	valuePhone = cookie.get();
	if (!(valuePhone >= 0 && valuePhone <= 2)) {valuePhone = 0;}
	var cookie = new Mojo.Model.Cookie("EMAIL");
	valueEmail = cookie.get();
	if (!(valueEmail >= 0 && valueEmail <= 2)) {valueEmail = 0;}
	var cookie = new Mojo.Model.Cookie("MESSAGE");
	valueMessage = cookie.get();
	if (!(valueMessage >= 0 && valueMessage <= 2)) {valueMessage = 0;}
	var cookie = new Mojo.Model.Cookie("MUSICPLAYER");
	valueMusicPlayer = cookie.get();
	if (!(valueMusicPlayer >= 0 && valueMusicPlayer <= 2)) {valueMusicPlayer = 0;}
	var cookie = new Mojo.Model.Cookie("MUSICREMIX");
	valueMusicRemix = cookie.get();
	if (!(valueMusicRemix >= 0 && valueMusicRemix <= 2)) {valueMusicRemix = 0;}
	var cookie = new Mojo.Model.Cookie("MACAW");
	valueMacaw = cookie.get();
	if (!(valueMacaw >= 0 && valueMacaw <= 2)) {valueMacaw = 0;}
	var cookie = new Mojo.Model.Cookie("BATTERY");
	valueBattery = cookie.get();
	if (!(valueBattery >= 0 && valueBattery <= 2)) {valueBattery = 0;}
}

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