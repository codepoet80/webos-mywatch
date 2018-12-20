function MainAssistant() {
	this.logOutputNum = 1;
}

MainAssistant.prototype.setup = function() {
	var launchParams = {dashInfo: ""};
	var dashboardStage = Mojo.Controller.getAppController().getStageController("dashboard");
	if (dashboardStage) {
		// Dashboard stage is already open
		Mojo.Log.error("DELEGATING TO SCENE ASST");
		dashboardStage.delegateToSceneAssistant("displayDashboard", launchParams.dashInfo);
	} else {
		Mojo.Log.error("No dashboardStage found.");
		var pushDashboard = function (stageController) {
			stageController.pushScene('dashboard', launchParams.dashInfo);
		};
		Mojo.Controller.getAppController().createStageWithCallback({name: "dashboard", lightweight: true}, pushDashboard, 'dashboard');
	}

	this.controller.setupWidget("test-ring", {}, {label: "Test Call"});
	Mojo.Event.listen(this.controller.get('test-ring'), Mojo.Event.tap, this.testRing.bind(this));
	this.controller.setupWidget("test-sms", {}, {label: "Test Message"});
	Mojo.Event.listen(this.controller.get('test-sms'), Mojo.Event.tap, this.testSms.bind(this));
	this.controller.setupWidget("test-email", {}, {label: "Test Email"});
	Mojo.Event.listen(this.controller.get('test-email'), Mojo.Event.tap, this.testEmail.bind(this));
	this.controller.setupWidget("test-music", {}, {label: "Test Music"});
	Mojo.Event.listen(this.controller.get('test-music'), Mojo.Event.tap, this.testMusic.bind(this));

	this.controller.setupWidget("watchSelector",
								{label: "Watch", labelPlacement: Mojo.Widget.labelPlacementLeft,
									choices: [{label: "Pebble", value: "Pebble"}, {label: "MW150", value: "MW150"}, {label: "LiveView", value: "LiveView"}]},
								{value: watchType});
	Mojo.Event.listen(this.controller.get("watchSelector"), Mojo.Event.propertyChange, this.handleWatchUpdate.bind(this));

	this.controller.setupWidget("timeoutSelector",
								{label: "Timeout", labelPlacement: Mojo.Widget.labelPlacementLeft,
									choices: [{label: "Never", value: "0"}, {label: "5 min", value: "300"}, {label: "1 min", value: "60"}, {label: "20 sec", value: "20"}]},
								this.timeoutModel = {value: timeoutValue, disabled: (watchType != "Pebble")});
	Mojo.Event.listen(this.controller.get("timeoutSelector"), Mojo.Event.propertyChange, this.handleTimeoutUpdate.bind(this));

	if (timeoutValue > 0) {
		lostConnectionValue = false;
	}
	this.controller.setupWidget("lostConnectionSignal", {trueValue: true, falseValue: false},
								this.lostConnectionModel = {value: lostConnectionValue, disabled: (watchType != "Pebble") || (timeoutValue > 0)});
	Mojo.Event.listen(this.controller.get("lostConnectionSignal"), Mojo.Event.propertyChange, this.handleLostConnectionUpdate.bind(this));

	var choices = [{label: "Default", value: 0}, {label: "Msg only", value: 1}, {label: "Disabled", value: 2}];
	this.controller.setupWidget("allSelector", {label: "All", labelPlacement: Mojo.Widget.labelPlacementLeft, choices: choices}, {value: valueAll});
	Mojo.Event.listen(this.controller.get("allSelector"), Mojo.Event.propertyChange, this.handleAllUpdate);
	this.controller.setupWidget("phoneSelector", {label: "Phone", labelPlacement: Mojo.Widget.labelPlacementLeft, choices: choices}, {value: valuePhone});
	Mojo.Event.listen(this.controller.get("phoneSelector"), Mojo.Event.propertyChange, this.handlePhoneUpdate);
	this.controller.setupWidget("emailSelector", {label: "Email", labelPlacement: Mojo.Widget.labelPlacementLeft, choices: choices}, {value: valueEmail});
	Mojo.Event.listen(this.controller.get("emailSelector"), Mojo.Event.propertyChange, this.handleEmailUpdate);
	this.controller.setupWidget("messageSelector", {label: "Message", labelPlacement: Mojo.Widget.labelPlacementLeft, choices: choices}, {value: valueMessage});
	Mojo.Event.listen(this.controller.get("messageSelector"), Mojo.Event.propertyChange, this.handleMessageUpdate);
	this.controller.setupWidget("batterySelector", {label: "Battery", labelPlacement: Mojo.Widget.labelPlacementLeft, choices: choices}, {value: valueBattery});
	Mojo.Event.listen(this.controller.get("batterySelector"), Mojo.Event.propertyChange, this.handleBatteryUpdate);
	this.controller.setupWidget("musicplayerSelector", {label: "Music Player", labelPlacement: Mojo.Widget.labelPlacementLeft, choices: choices}, {value: valueMusicPlayer});
	Mojo.Event.listen(this.controller.get("musicplayerSelector"), Mojo.Event.propertyChange, this.handleMusicPlayerUpdate);
	this.controller.setupWidget("musicremixSelector", {label: "Music Player Remix", labelPlacement: Mojo.Widget.labelPlacementLeft, choices: choices}, {value: valueMusicRemix});
	Mojo.Event.listen(this.controller.get("musicremixSelector"), Mojo.Event.propertyChange, this.handleMusicRemixUpdate);
	this.controller.setupWidget("macawSelector", {label: "Project Macaw", labelPlacement: Mojo.Widget.labelPlacementLeft, choices: choices}, {value: valueMacaw});
	Mojo.Event.listen(this.controller.get("macawSelector"), Mojo.Event.propertyChange, this.handleMacawUpdate);
	this.controller.setupWidget("otherSelector", {label: "Others", labelPlacement: Mojo.Widget.labelPlacementLeft, choices: choices}, {value: valueOther});
	Mojo.Event.listen(this.controller.get("otherSelector"), Mojo.Event.propertyChange, this.handleOtherUpdate);
	//Testing drawer
	this.hideTesting = this.hideTesting.bind(this);
	this.controller.setupWidget("drawerTesting",
		this.attributes = {
			modelProperty: 'open',
			unstyled: false
		},
		this.model = {
			open: true
		}
	);
	Mojo.Event.listen(this.controller.get("testingTwisty"), Mojo.Event.tap, this.hideTesting);
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

	menuattr = {omitDefaultItems: true};
	menumodel = {visible: true,
	items: [
			{label: "Whitelist", command: "do-whitelist"},
			{label: "Bluetooth", command: "do-bluetooth"},
			{label: "Help", command: "do-help"}
		]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, menuattr, menumodel);

};

testDrawerOpen = true;
MainAssistant.prototype.hideTesting = function() {
	Mojo.Log.error("should show testing drawer now!");
	this.controller.get("drawerTesting").mojo.toggleState();
	if (!testDrawerOpen)
	{
		this.controller.get("testingTwistyImg").src = "images/arrow-down.png";
		testDrawerOpen = true;
	}
	else
	{
		this.controller.get("testingTwistyImg").src = "images/arrow-right.png";
		testDrawerOpen = false;
	}
}

logDrawerOpen = false;
MainAssistant.prototype.showLogging = function() {
	Mojo.Log.error("should show log drawer now!");
	this.controller.get("drawerLogging").mojo.toggleState();
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
}

MainAssistant.prototype.handleWatchUpdate = function(event) {
	var cookie = new Mojo.Model.Cookie("WATCH");
	cookie.put(event.value);
	watchType = event.value;
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

MainAssistant.prototype.handleTimeoutUpdate = function(event) {
	var cookie = new Mojo.Model.Cookie("TIMEOUT");
	cookie.put(event.value);
	timeoutValue = event.value;
	if (timeoutValue > 0) {
		lostConnectionValue = false;
		var cookie = new Mojo.Model.Cookie("LOSTCONNECTION");
		cookie.put(lostConnectionValue);
	}
	if (timeoutValue == 0) {
		this.lostConnectionModel.disabled = false;
	} else {
		this.lostConnectionModel.disabled = true;
	}
	this.lostConnectionModel.value = lostConnectionValue;
	this.controller.modelChanged(this.lostConnectionModel, this);
};

MainAssistant.prototype.handleLostConnectionUpdate = function(event) {
	var cookie = new Mojo.Model.Cookie("LOSTCONNECTION");
	cookie.put(event.value);
	lostConnectionValue = event.value;
};

MainAssistant.prototype.handleAllUpdate = function(event) {
	var cookie = new Mojo.Model.Cookie("ALL");
	cookie.put(event.value);
	valueAll = event.value;
};

MainAssistant.prototype.handlePhoneUpdate = function(event) {
	var cookie = new Mojo.Model.Cookie("PHONE");
	cookie.put(event.value);
	valuePhone = event.value;
};

MainAssistant.prototype.handleEmailUpdate = function(event) {
	var cookie = new Mojo.Model.Cookie("EMAIL");
	cookie.put(event.value);
	valueEmail = event.value;
};

MainAssistant.prototype.handleMessageUpdate = function(event) {
	var cookie = new Mojo.Model.Cookie("MESSAGE");
	cookie.put(event.value);
	valueMessage = event.value;
};

MainAssistant.prototype.handleBatteryUpdate = function(event) {
	var cookie = new Mojo.Model.Cookie("BATTERY");
	cookie.put(event.value);
	valueBattery = event.value;
};

MainAssistant.prototype.handleMusicPlayerUpdate = function(event) {
	var cookie = new Mojo.Model.Cookie("MUSICPLAYER");
	cookie.put(event.value);
	valueMusicPlayer = event.value;
};

MainAssistant.prototype.handleMusicRemixUpdate = function(event) {
	var cookie = new Mojo.Model.Cookie("MUSICREMIX");
	cookie.put(event.value);
	valueMusicRemix = event.value;
};

MainAssistant.prototype.handleMacawUpdate = function(event) {
	var cookie = new Mojo.Model.Cookie("MACAW");
	cookie.put(event.value);
	valueMacaw = event.value;
};

MainAssistant.prototype.handleOtherUpdate = function(event) {
	var cookie = new Mojo.Model.Cookie("OTHER");
	cookie.put(event.value);
	valueOther = event.value;
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

MainAssistant.prototype.activate = function(event) {

};

MainAssistant.prototype.cleanup = function(event) {
	Mojo.Controller.getAppController().closeAllStages()
	/*
	this.controller.serviceRequest("palm://com.palm.power/com/palm/power", {
		method: "activityEnd",
		parameters: {
			id: Mojo.appInfo.id + "-1"
		},
		onSuccess: function() {},
		onFailure: function() {}
	});
	*/
};
