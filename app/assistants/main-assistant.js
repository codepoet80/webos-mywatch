function MainAssistant() {
	this.logOutputNum = 1;
	this.menuattr = {omitDefaultItems: true};
	this.menumodel = {visible: true,
		items: [
				{label: "Whitelist", command: "do-whitelist"},
				{label: "Bluetooth", command: "do-bluetooth"},
				{label: "Help", command: "do-help"}
			]
		};
}

MainAssistant.prototype.setup = function() {
	var launchParams = {dashInfo: ""};
	var dashboardStage = Mojo.Controller.getAppController().getStageController("dashboard");
	if (dashboardStage) {
		// Dashboard stage is already open
		Mojo.Log.info("DELEGATING TO SCENE ASST");
		dashboardStage.delegateToSceneAssistant("displayDashboard", launchParams.dashInfo);
	} else {
		Mojo.Log.info("No dashboardStage found.");
		if (appModel.AppSettingsCurrent["showLogging"] == true)
			this.showLoggingDashboard(launchParams.dashInfo);
	}

	//Options
	this.controller.setupWidget("watchSelector",
		{label: "Watch", labelPlacement: Mojo.Widget.labelPlacementLeft,
			choices: [{label: "Pebble", value: "Pebble"}, {label: "MW150", value: "MW150"}, {label: "LiveView", value: "LiveView"}]},
		{value: watchType});
	Mojo.Event.listen(this.controller.get("watchSelector"), Mojo.Event.propertyChange, this.handleWatchOptionUpdate.bind(this));

	/*this.controller.setupWidget("timeoutSelector",
		{label: "Timeout", labelPlacement: Mojo.Widget.labelPlacementLeft,
			choices: [{label: "Never", value: "0"}, {label: "5 min", value: "300"}, {label: "1 min", value: "60"}, {label: "20 sec", value: "20"}]},
		this.timeoutModel = {value: timeoutValue, disabled: (watchType != "Pebble")});
	Mojo.Event.listen(this.controller.get("timeoutSelector"), Mojo.Event.propertyChange, this.handleTimeoutOptionUpdate.bind(this));

	if (timeoutValue > 0) {
		lostConnectionValue = false;
	}
	this.controller.setupWidget("lostConnectionSignal", {trueValue: true, falseValue: false},
		this.lostConnectionModel = {value: lostConnectionValue, disabled: (watchType != "Pebble") || (timeoutValue > 0)});
	Mojo.Event.listen(this.controller.get("lostConnectionSignal"), Mojo.Event.propertyChange, this.handleLostConnectionOptionUpdate.bind(this));
	*/

	//App Option Toggles from Settings
	for (var key in appModel.AppSettingsCurrent)
	{
		if (key.indexOf("value") == 0)
		{
			try
			{
				var optName = key.replace("value", "");
				this.setupOptionToggles(optName);
			}
			catch(e)
			{
				//Option removed
			}
		}
	}

	//Testing drawer
	this.showTesting = this.showTesting.bind(this);
	this.controller.setupWidget("drawerTesting",
		this.attributes = {
			modelProperty: 'open',
			unstyled: false
		},
		this.model = {
			open: true
		}
	);
	Mojo.Event.listen(this.controller.get("testingTwisty"), Mojo.Event.tap, this.showTesting);
	this.controller.setupWidget("test-ring", {}, {label: "Test Call"});
	Mojo.Event.listen(this.controller.get('test-ring'), Mojo.Event.tap, this.testRing.bind(this));
	this.controller.setupWidget("test-sms", {}, {label: "Test Message"});
	Mojo.Event.listen(this.controller.get('test-sms'), Mojo.Event.tap, this.testSms.bind(this));
	this.controller.setupWidget("test-email", {}, {label: "Test Email"});
	Mojo.Event.listen(this.controller.get('test-email'), Mojo.Event.tap, this.testEmail.bind(this));
	//this.controller.setupWidget("test-music", {}, {label: "Test Music"});
	//Mojo.Event.listen(this.controller.get('test-music'), Mojo.Event.tap, this.testMusic.bind(this));

	//Logging drawer
	this.showLogging = this.showLogging.bind(this);
	this.controller.setupWidget("drawerLogging",
		this.attributes = {
			modelProperty: 'open',
			unstyled: false
		},
		this.model = {
			open: false
		}
	);
	Mojo.Event.listen(this.controller.get("logTwisty"), Mojo.Event.tap, this.showLogging);

	//Main menu
	this.controller.setupWidget(Mojo.Menu.appMenu, this.menuattr, this.menumodel);
};

MainAssistant.prototype.activate = function(event) {
};

MainAssistant.prototype.showLoggingDashboard = function(dashInfo) {
	var pushDashboard = function (stageController) {
		stageController.pushScene('dashboard', dashInfo);
	};
	Mojo.Controller.getAppController().createStageWithCallback({name: "dashboard", lightweight: true}, pushDashboard, 'dashboard');
}

MainAssistant.prototype.handleWatchOptionUpdate = function(event) {
	watchType = event.value;
	appModel.AppSettingsCurrent["watchType"] = watchType;
	if (watchType == "Pebble") {
		this.lostConnectionModel.disabled = false;
		if (timeoutValue == 0) {
			this.timeoutModel.disabled = false;
		} else {
			this.timeoutModel.disabled = true;
		}
	} else {
		this.lostConnectionModel.disabled = true;
		this.timeoutModel.disabled = true;
	}
	this.controller.modelChanged(this.timeoutModel, this);
	this.controller.modelChanged(this.lostConnectionModel, this);
};

MainAssistant.prototype.handleTimeoutOptionUpdate = function(event) {
	appModel.AppSettingsCurrent["timeoutValue"] = timeoutValue;
	if (timeoutValue > 0) {
		lostConnectionValue = false;
		appModel.AppSettingsCurrent["lostConnectionValue"] = lostConnectionValue;
	}
	if (timeoutValue == 0) {
		this.lostConnectionModel.disabled = false;
	} else {
		this.lostConnectionModel.disabled = true;
	}
	this.lostConnectionModel.value = lostConnectionValue;
	this.controller.modelChanged(this.lostConnectionModel, this);
};

MainAssistant.prototype.setupOptionToggles = function(optionName)
{
	var choices = [{label: "Enabled", value: 0}, {label: "Only Messages", value: 1}, {label: "Disabled", value: 2}];
	this.controller.setupWidget(optionName + "Selector", {label: optionName, labelPlacement: Mojo.Widget.labelPlacementLeft, choices: choices}, {value: appModel.AppSettingsCurrent["value" + optionName]});
	Mojo.Event.listen(this.controller.get(optionName + "Selector"), Mojo.Event.propertyChange, this.handleToggleOptionUpdate);
};

MainAssistant.prototype.handleToggleOptionUpdate = function(event) {
	Mojo.Log.info("handle toggle update: " + event.srcElement.id + " = " + event.value);
	var optName = event.srcElement.id
	var optName = "value" + optName.replace("Selector", "");
	appModel.AppSettingsCurrent[optName] = Number(event.value);
	appModel.SaveSettings();
	Mojo.Log.info('Options after save: ' + Object.toJSON(appModel.AppSettingsCurrent));
	eval(optName + "=" + Number(event.value));
	Mojo.Log.info(optName + " = " + eval(optName));
};

MainAssistant.prototype.handleLostConnectionOptionUpdate = function(event) {
	lostConnectionValue = event.value;
	appModel.AppSettingsCurrent["lostConnectionValue"] = lostConnectionValue;
};

MainAssistant.prototype.showTesting = function() {
	this.controller.get("drawerTesting").mojo.toggleState();
	testDrawerOpen = Boolean(this.controller.get("drawerTesting").tag);
	if (testDrawerOpen)
	{
		this.controller.get("testingTwistyImg").src = "images/arrow-down.png";
		testDrawerOpen = false;
	}
	else
	{
		this.controller.get("testingTwistyImg").src = "images/arrow-right.png";
		testDrawerOpen = true;
	}
	this.controller.get("drawerTesting").tag = testDrawerOpen;
};

MainAssistant.prototype.showLogging = function() {
	this.controller.get("drawerLogging").mojo.toggleState();
	logDrawerOpen = Boolean(this.controller.get("drawerLogging").tag);
	if (!logDrawerOpen)
	{
		this.controller.get("logTwistyImg").src = "images/arrow-down.png";
		logDrawerOpen = true;
	}
	else
	{
		this.controller.get("logTwistyImg").src = "images/arrow-right.png";
		logDrawerOpen = false;
	}
	this.controller.get("drawerLogging").tag = logDrawerOpen;
};

MainAssistant.prototype.sendHangup = function() {
	Mojo.Log.error("Sending hangup request");
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: myAppId,
			params: {command: "HANGUP"}
		},
		onSuccess: function() {},
		onFailure: function() {}
	});
};

MainAssistant.prototype.testRing = function() {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: myAppId,
			params: {command: "RING", caller: "Hello", number: "+1-605-475-6968", test: true}
		},
		onSuccess: function() {},
		onFailure: function() {}
	});
	setTimeout(this.sendHangup.bind(this), 20000);
};

MainAssistant.prototype.testSms = function() {
	Mojo.Log.error("Sending SMS request from app id " + myAppId);
	var messagingId = findAppIdByName("Messaging");
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: myAppId,
			params: {command: "SMS", info: "I've seen things you people wouldn't believe. Attack ships on fire off the shoulder of Orion.", appid: messagingId, test: true}
		},
		onSuccess: function() {},
		onFailure: function() {}
	});
};

MainAssistant.prototype.testEmail = function() {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: myAppId,
			params: {command: "INFO", info: "I watched C-beams glitter in the dark near the Tannhauser Gate...", wordwrap: true, appid: "com.palm.app.email", test: true}
		},
		onSuccess: function() {},
		onFailure: function() {}
	});
};

/*
MainAssistant.prototype.testMusic = function() {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: "myAppId",
			params: {command: "INFO", info: "Test(artist)\n\nTest(tracl)", appid: "com.palm.app.musicplayer", test: true}
		},
		onSuccess: function() {},
		onFailure: function() {}
	});
};
*/

MainAssistant.prototype.handleCommand = function(event) {
	if (event.type == Mojo.Event.commandEnable &&
	    (event.command == Mojo.Menu.helpCmd)) {
         event.stopPropagation(); // enable help. now we have to handle it
    }

	if (event.type == Mojo.Event.command) {
		switch (event.command) {
			case "do-help":
				this.controller.showAlertDialog({
					onChoose: function(value) {},
					title: "Help",
					allowHTMLMessage: true,
					message: "Connect your webOS device with a Pebble, a LiveView from Sony or a MBW 150/200 watch from Sony-Ericsson.<br/>" +
							"If you like it check out my other apps in the AppCatalog.<br/><br/>" +
							"(c) 2011 <a href='http://www.metaviewsoft.de/wordpress'>MetaViewSoft</a>",
					choices:[
						{label: 'OK', value:"ok", type:'dismiss'}
					]
				});
			break;
			case "do-whitelist":
				this.controller.stageController.pushScene("whitelist");	
			break;
			case "do-showLogging":
				appModel.AppSettingsCurrent["showLogging"] = !appModel.AppSettingsCurrent["showLogging"];
				this.controller.modelChanged(this.menumodel, this);
				if (appModel.AppSettingsCurrent["showLogging"])
					this.showLoggingDashboard(null);
				else
				{
					var appController = Mojo.Controller.getAppController();
					appController.closeStage(DashboardName);
				}

			break;
			case "do-bluetooth":
				new Mojo.Service.Request('palm://com.palm.applicationManager', {
					method: 'launch',
					parameters: {
						id: "com.palm.app.bluetooth"
					}
				});
			break;
		}
	}
};

MainAssistant.prototype.logInfo = function(logText, open) {
	Mojo.Log.info("logInfo:", logText);
	this.controller.get('log-output').innerHTML = "<strong>" + (this.logOutputNum++) + "</strong>: " + logText + "<br />" + this.controller.get('log-output').innerHTML.substr(0, 1000) + "<br /><br />";
	if (open) {
		this.controller.get('watchWrapper').style.backgroundColor = "green";
	} else {
		this.controller.get('watchWrapper').style.backgroundColor = "red";
	}
};

MainAssistant.prototype.cleanup = function(event) {
	appModel.SaveSettings();
	Mojo.Controller.getAppController().closeAllStages()
};
