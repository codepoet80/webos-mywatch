function MainAssistant() {
	this.logOutputNum = 1;
	this.menuattr = {omitDefaultItems: true};
	this.menumodel = {visible: true,
		items: [
				{label: ('Troubleshooting'),
					items: [
						{label: "Persistent Dashboard", checkEnabled: true, command: 'do-togglePersistentDash', chosen:appModel.AppSettingsCurrent.debugPersistDash },
						{label: "Large Log Font", checkEnabled: true, command: 'do-toggleLogFont', chosen:appModel.AppSettingsCurrent.debugLargerFont },
						{label: "Verbose Logs", checkEnabled: true, command: 'do-toggleVerbose', chosen:appModel.AppSettingsCurrent.debugVerbose },
					]
				},
				{label: "Whitelist", command: "do-whitelist"},
				{label: "Bluetooth Preferences", command: "do-bluetooth"},
				{label: "Reset settings", command: "do-reset"},
				{label: "Help", command: "do-help"}
			]
		};
}

MainAssistant.prototype.setup = function() {
	var launchParams = {dashInfo: ""};
	var dashboardStage = Mojo.Controller.getAppController().getStageController("dashboard");
	if (dashboardStage) {
		// Dashboard stage is already open
		dashboardStage.delegateToSceneAssistant("displayDashboard", launchParams.dashInfo);
	} else {
		this.showLoggingDashboard(launchParams.dashInfo);
	}

	//Watch Type
	this.controller.setupWidget("watchSelector",
		{label: "Watch", labelPlacement: Mojo.Widget.labelPlacementLeft,
			choices: [{label: "Pebble", value: "Pebble"}, {label: "MW150", value: "MW150"}, {label: "LiveView", value: "LiveView"}]},
		{value: watchType});
	Mojo.Event.listen(this.controller.get("watchSelector"), Mojo.Event.propertyChange, this.handleWatchOptionUpdate.bind(this));

	//Build Per App Option List area
	this.showAppOptions = this.showAppOptions.bind(this);
	this.controller.setupWidget("drawerAppOptions",
		this.attributes = {
			modelProperty: 'open',
			unstyled: false
		},
		this.model = {
			open: true
		}
	);
	Mojo.Event.listen(this.controller.get("optionsTwisty"), Mojo.Event.tap, this.showAppOptions);
	this.controller.setupWidget("spinnerApps",
		this.attributes = {
			spinnerSize: "large"
		},
		this.model = {
			spinning: true
		}
	); 
	//Get an intial list of app options. This will be updated once apps are scanned.
	var appItems = this.makeAppItemList();
	this.listModel = {listTitle:$L('App Notifications'), items:""};
	this.controller.setupWidget('appOptionList', {itemTemplate:'main/list-item', listTemplate:'main/list-container'}, this.listModel);

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
	this.controller.setupWidget("test-music", {}, {label: "Test Music"});
	Mojo.Event.listen(this.controller.get('test-music'), Mojo.Event.tap, this.testMusic.bind(this));

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
	this.controller.setupWidget("scrollerLogs",
		this.attributes = {
			mode: 'vertical'
			},
		this.model = {}
	); 
	if (appModel.AppSettingsCurrent["debugLargerFont"] && appModel.AppSettingsCurrent["debugLargerFont"] == true)
		this.controller.get("log-output").style.fontSize = "18px";

	//Main menu
	this.controller.setupWidget(Mojo.Menu.appMenu, this.menuattr, this.menumodel);
};

MainAssistant.prototype.activate = function(event) 
{
	//Scan for installed apps to update the list
	this.getAppInstalledList();
};

MainAssistant.prototype.SetupOptionToggles = function(optionName, toggleValue)
{
	//Set then enforce the model for the option toggles cause Mojo is stupid
	var toggleWidgetName = optionName + "Option";
	if (appModel.AppSettingsCurrent.inactiveAllNotifications == 1)
		toggleValue = 1;
	if (toggleValue == 0) {	toggleValue = true; }
	else { toggleValue = false; }
		
	this.controller.setupWidget(this.controller.get(toggleWidgetName),
		this.attributes = {
			trueValue: 0,
			falseValue: 1
		},
		this.model = {
			value: toggleValue,
			disabled: false
		}
	); 
	this.SetToggleState(toggleWidgetName, toggleValue);
	Mojo.Event.listen(this.controller.get(toggleWidgetName), Mojo.Event.propertyChange, this.handleToggleOptionUpdate.bind(this));
}

MainAssistant.prototype.SetToggleState = function(widgetName, toggledValue)
{
    //There appears to be a bug in Mojo that means a toggle button doesn't reflect its model state during instantiation
	//	This work-around fixes it.

    var children = this.controller.get(widgetName).querySelectorAll('*');
    for (var i=0; i<children.length; i++) {
        if (children[i].className.indexOf("toggle-button") != -1)
        {
			children[i].className = "toggle-button " + toggledValue;
        }
        if (children[i].tagName == "SPAN")
        {
            if (toggledValue.toString().toLowerCase() == "true")
                children[i].innerHTML = "on";
            else
                children[i].innerHTML = "off";
        }
    }
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

MainAssistant.prototype.handleToggleOptionUpdate = function(event) {
	this.logInfo("handle toggle update: " + event.srcElement.id + " = " + event.value, "error");
	
	var optName = event.srcElement.id.replace("Option", "");
	//Translate the toggle widget value to a saveable value
	if (event.value)
		optValue = 0;
	else
		optValue = 1;
	if (optName == "All") 	//If Toggling the ALL value
	{
		appModel.AppSettingsCurrent["inactiveAllNotifications"] = optValue;
		var appItems = this.makeAppItemList();
		var otherItemValue = optValue;	//IF ALL is off, show the others as off
		for(var i = 0; i < appItems.length; i++) {
			if (optValue == 0)	//IF ALL is on, show the others are their saved value
				otherItemValue = appItems[i].definition;
			this.SetupOptionToggles(appItems[i].data, otherItemValue);
		}
		//Same thing for special "Other" case
		var otherItemValue = optValue;
		if (optValue == 0)
				otherItemValue = appModel.AppSettingsCurrent.inactiveOtherNotifications;
		this.SetupOptionToggles("Other", otherItemValue);
	}
	else	//If Toggling any other value
	{
		//Don't allow turning on individual options if ALL option is off
		if (optValue == 0 && appModel.AppSettingsCurrent["inactiveAllNotifications"] == 1)
		{
			this.logInfo("not setting option because ALL is off", null, "error");
			this.SetToggleState(optName + "Option", false);
		}
		else
		{
			if (optName == "Other")	//Toggling the Other special case
				appModel.AppSettingsCurrent["inactiveOtherNotifications"] = optValue;
			else	//Toggling any other option
			{
				var appId = findAppIdByName(optName);
				appModel.AppSettingsCurrent.perAppSettings[appId].inactive = optValue;
			}
		}
	}
	appModel.SaveSettings();
};

MainAssistant.prototype.handleLostConnectionOptionUpdate = function(event) {
	lostConnectionValue = event.value;
	appModel.AppSettingsCurrent["lostConnectionValue"] = lostConnectionValue;
};

MainAssistant.prototype.showAppOptions = function() {
	this.controller.get("drawerAppOptions").mojo.toggleState();
	appOptionsDrawerOpen = Boolean(this.controller.get("drawerAppOptions").tag);
	if (appOptionsDrawerOpen)
	{
		this.controller.get("appOptionsTwistyImg").src = "images/arrow-down.png";
		appOptionsDrawerOpen = false;
	}
	else
	{
		this.controller.get("appOptionsTwistyImg").src = "images/arrow-right.png";
		appOptionsDrawerOpen = true;
	}
	this.controller.get("drawerAppOptions").tag = appOptionsDrawerOpen;
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

MainAssistant.prototype.showLoggingDashboard = function(dashInfo) {
	var pushDashboard = function (stageController) {
		stageController.pushScene('dashboard', dashInfo);
	};
	Mojo.Controller.getAppController().createStageWithCallback({name: "dashboard", lightweight: true}, pushDashboard, 'dashboard');
}

MainAssistant.prototype.sendHangup = function() {
	this.logInfo("Sending hangup request", "error");
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
	this.logInfo("Sending SMS request from app id " + myAppId, "error");
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
			params: {command: "INFO", info: "I watched C-beams glitter in the dark near the Tannhauser Gate...\nRoy Batty", wordwrap: true, appid: "com.palm.app.email", test: true}
		},
		onSuccess: function() {},
		onFailure: function() {}
	});
};

MainAssistant.prototype.testMusic = function() {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: myAppId,
			params: {command: "INFO", info: "My Way\nFrank Sinatra", appid: "com.palm.app.musicplayer", test: true}
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
							"If you like it check out my other apps in PreWare.<br/><br/>" +
							"&copy; 2015 <a href='http://www.metaviewsoft.de/wordpress'>MetaViewSoft</a><br/>" +
							"2018 Updates by Jon W. MIT Licensed.",
					choices:[
						{label: 'OK', value:"ok", type:'dismiss'}
					]
				});
			break;
			case "do-whitelist":
				this.controller.stageController.pushScene("whitelist");	
			break;
			case "do-reset":
				appModel.ResetSettings(false);
				this.relaunchApp();
			break;
			case "do-togglePersistentDash":
				appModel.AppSettingsCurrent["debugPersistDash"] = !appModel.AppSettingsCurrent["debugPersistDash"];
				this.controller.modelChanged(this.menumodel, this);
				this.relaunchApp();
			break;
			case "do-toggleVerbose":
				appModel.AppSettingsCurrent["debugVerbose"] = !appModel.AppSettingsCurrent["debugVerbose"];
				this.controller.modelChanged(this.menumodel, this);
				this.relaunchApp();
			break;
			case "do-toggleLogFont":
				appModel.AppSettingsCurrent["debugLargerFont"] = !appModel.AppSettingsCurrent["debugLargerFont"];
				this.controller.modelChanged(this.menumodel, this);
				this.relaunchApp();
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

//Show Info send logs to log info at Error level, and show the message in a banner/dashboard and updates the connection state. It also works if the Dashboard is not open.
AppAssistant.prototype.showInfo = function(logText, forceState) {
	var useState = bluetoothModel.getOpen()
	if (forceState)
		useState = forceState;
	var stageProxy = Mojo.Controller.getAppController().getStageProxy(DashboardName);
	if (stageProxy) {
		stageProxy.delegateToSceneAssistant("showInfo", logText, useState);
	}
	else
		Mojo.Controller.getAppController().showBanner({messageText: logText, icon: 'icon24.png'}, "", "");
	
	if (this.logInfo)
		this.logInfo(logText, "error");
	else
		Mojo.Log.error("*** logInfo could not be found: " + logText)
};

MainAssistant.prototype.logInfo = function(logText, level, open) {
	if (level == "error" || appModel.AppSettingsCurrent["debugVerbose"] == true)
	{
		Mojo.Log.error(logText);
		this.controller.get('log-output').innerHTML = "<strong>" + (this.logOutputNum++) + "</strong>: " + logText + "<br />" + this.controller.get('log-output').innerHTML + "<br /><br />";
	}
	else if (level == "warn")
		Mojo.Log.warn(logText);
	else
		Mojo.Log.info(logText);
	if (open && open == true) {
		this.controller.get('watchWrapper').style.backgroundColor = "green";
	} else {
		this.controller.get('watchWrapper').style.backgroundColor = "red";
	}
	var stageProxy = Mojo.Controller.getAppController().getStageProxy(DashboardName);
	if (stageProxy) {
		stageProxy.delegateToSceneAssistant("showState", open);
	}
};

MainAssistant.prototype.cleanup = function(event) {
	appModel.SaveSettings();
	Mojo.Controller.getAppController().closeAllStages()
};

MainAssistant.prototype.makeAppItemList = function()
{
	var perAppSettings = appModel.AppSettingsCurrent["perAppSettings"];
	var appSettingList = [];
	appSettingList[appSettingList.length] = {data:"All", definition:appModel.AppSettingsCurrent["inactiveAllNotifications"]}
	for (var key in perAppSettings)
	{
		//-1 means always installed, 0 means not installed, 1 means installed
		if (perAppSettings[key].installed == -1 || perAppSettings[key].installed == 1)
			appSettingList[appSettingList.length] = {data:perAppSettings[key].name, definition:perAppSettings[key].inactive}
	}
	appSettingList[appSettingList.length] = {data:"Other", definition:appModel.AppSettingsCurrent["inactiveOtherNotifications"]}
	return appSettingList;
}

MainAssistant.prototype.updateInstalledAppsOptions = function()
{
	this.controller.get("spinnerAppsContainer").style.visibility = "hidden";
	this.controller.get("spinnerAppsContainer").style.height = "0px";
	this.controller.get("spinnerAppsContainer").style.padding = "0px";
	
	//Find all the options and set them up
	var appItems = this.makeAppItemList();
	this.listModel.items = appItems;
	this.controller.modelChanged(this.listModel);

	for(var i = 0; i < appItems.length; i++) {
		this.SetupOptionToggles(appItems[i].data, appItems[i].definition)
	}
	this.controller.get("appOptionList").style.visibility = "visible";
}

MainAssistant.prototype.relaunchApp = function() {
	systemModel.SetSystemAlarmRelative("00:00:02", gblLaunchParams);
	var appController = Mojo.Controller.getAppController();
	appController.closeAllStages();
};

var appsToCheck = 0;
var appCheckTimeout = false;
MainAssistant.prototype.getAppInstalledList = function()
{
	var perAppSettings = appModel.AppSettingsCurrent["perAppSettings"];
	for (var key in perAppSettings)
	{
		if (perAppSettings[key].installed != -1)
		{
			appsToCheck++;
			systemModel.checkFileExists("/media/cryptofs/apps/usr/palm/applications/" + key, this.appInstalledListCallback.bind(this));
		}
	}
	//Give this check a maximum of 4 seconds to complete. This way we're still function if FileMgr doesn't exist/respond
	appCheckTimeout = setTimeout(this.updateInstalledAppsOptions.bind(this), 4000);
}

var appsChecked = 0;
MainAssistant.prototype.appInstalledListCallback = function(response, request)
{
	appsChecked++;
	if (response && request && request.options && request.options.parameters && request.options.parameters.file)
	{
		var perAppSettings = appModel.AppSettingsCurrent["perAppSettings"];
		var whichApp = request.options.parameters["file"];
		whichApp = whichApp.replace("/media/cryptofs/apps/usr/palm/applications/", "");
		if (response.exists && response.exists)
		{
			perAppSettings[whichApp].installed = "1";
		}
		else
		{
			perAppSettings[whichApp].installed = "0";
		}
	}
	if (appsChecked >= appsToCheck)
	{
		this.logInfo("All apps checked, ready to update the options list", "info");
		clearTimeout(appCheckTimeout);
		appCheckTimeout = false;
		this.updateInstalledAppsOptions();
	}
}
