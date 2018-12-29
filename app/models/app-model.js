/*
App Model
 Version 0.3b
 Created: 2018
 Author: Jonathan Wise
 License: MIT
 Description: Common functions for webOS apps, particularly for managing persisted options in cookies
*/

var AppModel = function()
{
	//Define your app-wide static settings here
    this.AlarmLaunch = false;
	this.AlarmLaunchName = null;
    this.BaseDateString = "August 25, 2001 ";
	this.DefaultScene = "main";    //This is used when defaults are re-loaded

	this.AppSettingsCurrent = null;
	//Define cookie defaults here and they will be loaded and enforced below
    this.AppSettingsDefaults = {
		watchType: "Pebble",
		timeoutValue: 0,
		lostConnectionValue: 0,
		showLogging: false,
		lastInstanceId: 25,
		sppState: "notyetconnected",
		inactiveAllNotifications: 0,
		inactiveOtherNotifications: 0,
		perAppSettings : {
			"com.palm.app.phone": {"inactive":0, "name":"Phone", "icon":"ICON_NOTIFICATION_GENERIC", "installed":-1},
			"com.palm.app.email": {"inactive":0, "name":"Email", "icon":"ICON_GENERIC_EMAIL", "installed":-1},
			"com.palm.app.messaging": {"inactive":0, "name":"Messaging", "icon":"ICON_GENERIC_SMS", "installed":-1},
			"com.palm.app.musicplayer": {"inactive":0, "name":"Music", "icon":"ICON_AUDIO_CASSETTE", "installed":-1},
			"com.hedami.musicplayerremix": {"inactive":0, "name":"Music Player Remix", "icon":"ICON_AUDIO_CASSETTE", "installed":0},
			"net.minego.phnx": {"inactive":0, "name":"Twitter", "icon":"ICON_NOTIFICATION_TWITTER", "installed":0},
			"luna.battery.alert": {"inactive":0, "name":"Battery", "icon":"ICON_BLUESCREEN_OF_DEATH", "installed":0},
			"com.palm.app.calendar": {"inactive":0, "name":"Calendar", "icon":"ICON_BLUESCREEN_OF_DEATH", "installed":0},
			"de.schdefoon.toooor2": {"inactive":0, "name":"Gooooal", "icon":"ICON_SOCCER_GAME", "installed":0},
			"com.rustyapps.jogstatstrial": {"inactive":0, "name":"Jog Stats", "icon":"ICON_TIMELINE_SPORTS", "installed":0},
			"com.palm.futurepr0n.batterymonitorplus": {"inactive":0, "name":"Battery Monitor", "icon":"ICON_BLUESCREEN_OF_DEATH", "installed":0},
			"de.schdefoon.mediadb": {"inactive":0, "name":"Media DB", "icon":"ICON_TV_SHOW", "installed":0},
			"de.tamspalm.amigo2trial": {"inactive":0, "name":"Amigo Music", "icon":"ICON_MUSIC_EVENT", "installed":0},
			"de.schdefoon.tagesverse": {"inactive":0, "name":"Daily Verse", "icon":"ICON_NEWS_EVENT", "installed":0},
			"org.webosinternals.linphone": {"inactive":0, "name":"LinPhone", "icon":"ICON_NOTIFICATION_VIBER", "installed":0},
			"com.hobbyistsoftware.newsfeed": {"inactive":0, "name":"Newsfeed", "icon":"ICON_NEWS_EVENT", "installed":0},
			"com.jonandnic.webos.stopwatch": {"inactive":0, "name":"Stopwatch", "icon":"ICON_ALARM_CLOCK", "installed":0},
		}
	};
}

//You probably don't need to change the below functions since they all work against the Cookie defaults you defined above.
//  LoadSettings: call when your app starts, or you want to load previously persisted options.
//  SaveSettings: call any time you want to persist an option.
//  ResetSettings: call if you want to forget stored settings and return to defaults. Your default scene will be popped and re-pushed.
AppModel.prototype.LoadSettings = function () {
    this.AppSettingsCurrent = this.AppSettingsDefaults;
    var loadSuccess = false;
    var settingsCookie = new Mojo.Model.Cookie("settings");
	try
	{
		appSettings = settingsCookie.get();
		if (typeof appSettings == "undefined" || appSettings == null || !this.checkSettingsValid(appSettings)) {
			Mojo.Log.error("** Using first run default settings");
		}
		else
		{
			Mojo.Log.info("** Using cookie settings!");
            Mojo.Log.info(JSON.stringify(appSettings))
            this.AppSettingsCurrent = appSettings;
            loadSuccess = true;
		}
	}
	catch(ex)
	{
		settingsCookie.put(null);
		Mojo.Log.error("** Settings cookie were corrupt and have been purged!");
		Mojo.Log.error(ex);
	}
	return loadSuccess;
}

AppModel.prototype.checkSettingsValid = function (loadedSettings)
{
	var retValue = true;
	for (var key in this.AppSettingsDefaults) {
		if (typeof loadedSettings[key] === undefined || loadedSettings[key] == null)
		{
			Mojo.Log.warn("** An expected saved setting, " + key + ", was null or undefined.");
			retValue = false;
		}
		if (typeof loadedSettings[key] !== typeof this.AppSettingsDefaults[key])
		{
			Mojo.Log.warn("** A saved setting, " + key + ", was of type " + typeof(loadedSettings[key]) + " but expected type " + typeof(this.AppSettingsDefaults[key]));
			retValue = false;
		}
		if (typeof this.AppSettingsDefaults[key] === "string" && this.AppSettingsDefaults[key].indexOf(this.BaseDateString) != -1 && loadedSettings[key].indexOf(this.BaseDateString))
		{
			Mojo.Log.warn("** A saved setting could not be compared to an expected date value.");
			retValue = false;
		}
		if (typeof this.AppSettingsDefaults[key] === "string" && (this.AppSettingsDefaults[key] == "false" || this.AppSettingsDefaults[key] == "true"))
		{
			if (loadedSettings[key] != "false" && loadedSettings[key] != "true")
			{
				Mojo.Log.warn("** A saved setting did not have the expected boolean value.");
				retValue = false;
			}
		}
	 }
	 return retValue;
}

AppModel.prototype.SaveSettings = function ()
{
	var settingsCookie = new Mojo.Model.Cookie("settings");
	settingsCookie.put(appModel.AppSettingsCurrent);
}

AppModel.prototype.ResetSettings = function()
{
	//Tell main scene to drop settings
	this.AppSettingsCurrent = this.AppSettingsDefaults;
	this.SaveSettings();
	Mojo.Log.info("reset settings");
	
	if (this.DefaultScene)
	{
		var stageController = Mojo.Controller.getAppController().getActiveStageController("card");
		stageController.popScene(this.DefaultScene);
		Mojo.Log.info("closed default scene");

		//Restart main scene
		stageController.pushScene(this.DefaultScene);
		Mojo.Log.info("re-opened default scene");
	}
}