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

function AppAssistant (appController) {
	this.appController = appController;

    this.urlgap     = 'palm://com.palm.bluetooth/gap';
    this.urlspp     = 'palm://com.palm.bluetooth/spp';
    this.urlservice = 'palm://com.palm.service.bluetooth.spp';

	this.sppNotificationService = null;
	this.openspp = false;
	this.serverEnabled = false;
	this.firstWrite = true;
	this.instanceId = -1;
	this.volume1 = 4;
	this.volume2 = 4;
	this.volume3 = 4;
	this.sendArray = [];
	this.entries = [];
	this.InRead = false;
	this.toSendEntry = null;
	this.toSendTime = 0;
	this.lastNotify = 0;
	this.logArray = [];
	this.initOpen = true;
	this.lastWrite = 0;
	this.lastMusicPhoneWrite = 0;
	this.lastConnect = 0;
	this.version = 0;

	this.artist = "";
	this.album = "";
	this.track = "";

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

AppAssistant.prototype.sendRing = function(caller, number) {
	if ((valueAll < 2) && (valuePhone < 2)) {
		// RING: just vibrate
		caller = caller ? caller.replace(/\"/g, "'") : "";
		number = number ? number.replace(/\"/g, "'") : "";
		this.showInfo(caller + " " + number);
		if (watchType == "MW150") {
			var data = "\r\n+CIEV: 4,1\r\n";
			this.write(data, data.length);
			var data = "\r\n+CLIP: \"" + caller + "\",129,\"" + number + "\",,\"\"\r\n";
			this.write(data, data.length);
			if ((valueAll < 1) && (valuePhone < 1)) {
				var data = "\r\nRING\r\n";
				this.write(data, data.length);
			}
		} else if (watchType == "Pebble") {
			var data = this.CreatePebblePhoneinfo(caller, number);
			this.write(data, data.length);
			setTimeout(this.pebbleRing.bind(this), 2000);
		} else if (watchType == "LiveView") {
			// green
			var reply = [MSG_SETLED, 0x04, 0x00, 0x00, 0x00, 0x06, 0x07, 0xe0, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length);
			// red
			reply = [MSG_SETLED, 0x04, 0x00, 0x00, 0x00, 0x06, 0xf8, 0x00, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length);
			// blue
			reply = [MSG_SETLED, 0x04, 0x00, 0x00, 0x00, 0x06, 0x00, 0x1f, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length);
			// vibrate
			reply = [MSG_SETVIBRATE, 0x04, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length);
		}
	}
};

AppAssistant.prototype.pebbleRing = function() {
	var data = this.CreatePebbleRinger();
	this.write(data, data.length);
	setTimeout(this.pebbleRingEnd.bind(this), 10000);
	this.lastMusicPhoneWrite = (new Date()).getTime();
};

AppAssistant.prototype.pebbleRingEnd = function() {
	var data = this.CreatePebbleRingEnd();
	this.write(data, data.length);
};

AppAssistant.prototype.sendPing = function(caller, number) {
	if ((valueAll < 2) && (valuePhone < 2)) {
		// RING: just vibrate
		caller = caller ? caller.replace(/\"/g, "'") : "";
		number = number ? number.replace(/\"/g, "'") : "";
		this.showInfo(caller + " " + number);
		if (watchType == "MW150") {
			var data = "\r\nRING\r\n";
			this.write(data, data.length);
		} else if (watchType == "Pebble") {
			var data = this.CreatePebblePing();
			this.write(data, data.length);
		} else if (watchType == "LiveView") {
			// green
			var reply = [MSG_SETLED, 0x04, 0x00, 0x00, 0x00, 0x06, 0x07, 0xe0, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length);
			// red
			reply = [MSG_SETLED, 0x04, 0x00, 0x00, 0x00, 0x06, 0xf8, 0x00, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length);
			// blue
			reply = [MSG_SETLED, 0x04, 0x00, 0x00, 0x00, 0x06, 0x00, 0x1f, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length);
			// vibrate
			reply = [MSG_SETVIBRATE, 0x04, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length);
		}
	}
};

AppAssistant.prototype.sendInfo = function(info, wordwrap, icon, reason, appid, ring) {
	Mojo.Log.error("***** sending appid: " + appid + " *****");
	var value = valueOther;
	var from = "Unknown";
	var music = false;

	//Determine if a Message is actually an Email
	var findLB = info.indexOf("\n");
	var findAt = info.indexOf("@");
	if (findLB > -1 && findAt > findLB)
		appid = appidEmail;

	this.logInfo("sendInfo");

	if (appid == appidPhone) {
		value = valuePhone;
		from = namePhone;
	} else if (appid == appidEmail) {
		value = valueEmail;
		from = nameEmail;
	} else if (appid == appidMessage) {
		value = valueMessage;
		from = nameMessage;
	} else if (appid == appidMusicPlayer) {
		value = valueMusicPlayer;
		from = nameMusicPlayer;
		lastMusicAppId = appidMusicPlayer;
		music = true;
	} else if (appid == appidMusicRemix) {
		value = valueMusicRemix;
		from = nameMusicRemix;
		lastMusicAppId = appidMusicPlayer;
		music = true;
	} else if (appid == appidMacaw) {
		value = valueMacaw;
		from = nameMacaw;
	} else if (appid == appidBattery) {
		value = valueBattery;
		from = nameBattery;
	}

	//this.logInfo("pattern " + pattern);
	//this.logInfo("appid " + appid);
	var accepted = false;
	if ((appid != appidEmail) || (pattern.length == 0) || info.test) {
		accepted = true;
	} else {
		//this.logInfo("pattern.length " + pattern.length);
		for (var i=0; i<pattern.length; i++) {
			var myRegExp = new RegExp(pattern[i], "i");
			//this.logInfo("search " + info + " for " + pattern[i]);
			if (info.search(myRegExp) > -1) {
				//this.logInfo("match " + pattern[i]);
				//this.logInfo("accepted " + info);
				accepted = true;
				break;
			}
		}
	}

	if (accepted) {
		if ((valueAll < 2) && (value < 2)) {
			// remember what to display, then we don't need to extract it later
			info = info ? info.replace(/\"/, "") : "";
			var entry = {
				info: info,
				wordwrap: wordwrap,
				icon: icon,
				reason: reason,
				appid: appid,
				from: from,
				ring: ring,
				hash: info.hashCode(),
				value: value,
				music: music};
			this.entries.push(entry);
	
			if (((new Date()).getTime() - this.toSendTime) > (10 * 1000)) {
				this.sendText();
			}
		}
	}
};

AppAssistant.prototype.sendText = function() {
	this.logInfo("sendText " + this.entries.length);
	if (this.entries.length > 0) {
		this.toSendEntry = this.entries.shift();
		this.toSendTime = (new Date()).getTime();
		if (watchType == "MW150") {
			if ((valueAll < 1) && (this.toSendEntry.value < 1)) {
				if (this.toSendEntry.ring) {
					var data = "\r\nRING\r\n";
					this.write(data, data.length);
				}
			}
			var data = "\r\n*SEMMII: 2,\"" + this.toSendEntry.hash + "\"\r\n";
			this.write(data, data.length);
		} else if (watchType == "Pebble") {
			var data;
			if (this.toSendEntry.music) {
				var arr = this.toSendEntry.info.split("\n", 3);
				data = this.CreatePebbleMusicinfo((arr.length > 0) ? arr[0] : "", (arr.length > 2) ? arr[2] : "", (arr.length > 1) ? arr[1] : "");
			} else if (this.version == 3) {
				var from = this.toSendEntry.from;
				var info = this.toSendEntry.info;
				data = this.toSendEntry.info.split("\n", 2);
				if (data.length > 1) {
					from = data[1];
					info = data[0];
				}
				data = this.CreatePebbleNotification30(from, info, this.toSendEntry.appid);
			} else if (this.version == 2) {
				data = this.CreatePebbleNotification(this.toSendEntry.from, this.toSendEntry.info);
			} else {
				// unknown pebble version, send both types
				var from = this.toSendEntry.from;
				var info = this.toSendEntry.info;
				data = this.toSendEntry.info.split("\n", 2);
				if (data.length > 1) {
					from = data[1];
					info = data[0];
				}
				data = this.CreatePebbleNotification30(from, info, this.toSendEntry.appid);
				this.write(data, data.length);
				data = this.CreatePebbleNotification(this.toSendEntry.from, this.toSendEntry.info);
			}
			this.write(data, data.length);
			this.toSendEntry = null;
			this.toSendTime = 0;
			//trigger a timeout if we have more text to send
			if (this.entries.length > 0) {
				setTimeout(this.sendText.bind(this), 5 * 1000);
			}
		} else if (watchType == "LiveView") {
		}
	}
}

AppAssistant.prototype.hangup = function() {
	if (watchType == "MW150") {
		var data = "\r\n+CIEV: 4,0\r\n";
		this.write(data, data.length);
	} else if (watchType == "Pebble") {
		var data = this.CreatePebbleHangup();
		this.write(data, data.length);
		data = this.CreatePebbleRingEnd();
		this.write(data, data.length);
	} else if (watchType == "LiveView") {
	}
};

AppAssistant.prototype.timerHandler = function() {
	this.read();
	//gblUpdateID = setTimeout(this.timerHandler.bind(this), 5000);
};

AppAssistant.prototype.getOpen = function() {
	return this.openspp;
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

AppAssistant.prototype.connect = function() {
	this.lastConnect = (new Date()).getTime();
	this.connectBTDevice = new Mojo.Service.Request(this.urlspp, {
		method: 'connect',
		parameters: { "address": this.targetAddress },
		onSuccess: function (e) {
			this.logInfo("connect success, results="+JSON.stringify(e));
		}.bind(this),
		onFailure: function (e){
			this.logInfo("connect failure, results="+JSON.stringify(e));
		}.bind(this)
	});
};

AppAssistant.prototype.open = function() {
	if (!this.openspp) {
		this.logInfo("open " + this.urlservice + " " + this.instanceId);
		new Mojo.Service.Request(this.urlservice, {
			method: 'open',
			parameters: {"instanceId": this.instanceId},
			onSuccess: function (e) {
				this.logInfo("Open success");
				this.firstWrite = true;
				this.openspp = true;
				if (this.initOpen) {
					this.initOpen = false;
				}
				if (watchType == "MW150") {
					// deal with MW150
					this.read();
				} else if (watchType == "Pebble") {
					//this.read();
					var msg = this.CreatePebbleVersion();
					this.write(msg, msg.length);
					this.writeData();
				} else if (watchType == "LiveView") {
					// deal with LiveView: send MSG_GETCAPS
					var msg = this.CreateLVMsg(MSG_GETCAPS, this.ConvertString("0.0.6"));
					this.write(msg, msg.length);
					//this.write([MSG_GETCAPS, 0x04, 0x00, 0x00, 0x00, 0x06, 0x06, "0".charCodeAt(0), ".".charCodeAt(0), "0".charCodeAt(0), ".".charCodeAt(0), "3".charCodeAt(0), 0], 13);
				}
			}.bind(this),
			onFailure: function (e) {
				this.logInfo("Open failure " + Object.toJSON(e));
			}.bind(this)
		});
	}
};
AppAssistant.prototype.close = function() {
	if (this.openspp) {
		//this.sppNotificationService = null;
		this.logInfo("close " + this.urlservice + " " + this.instanceId);
		new Mojo.Service.Request(this.urlservice, {
			method: 'close',
			parameters: {"instanceId": this.instanceId},
			onSuccess: function (e) {
				this.logInfo("Close success");
			}.bind(this),
			onFailure: function (e) {
				this.logInfo("Close failure " + Object.toJSON(e));
			}.bind(this)
		});
		this.logInfo("disconnect " + this.urlspp + " " + this.targetAddress);
		this.connectBTDevice = new Mojo.Service.Request(this.urlspp, {
			method: 'disconnect',
			parameters: {
				"address": this.targetAddress
			},
			onSuccess : function (e){
				this.logInfo("disconnect success, results="+JSON.stringify(e));
			}.bind(this),
			onFailure : function (e){
				this.logInfo("disconnect failure, results="+JSON.stringify(e));
			}.bind(this)
		});
		this.openspp = false;
		this.logInfo("this.openspp " + this.openspp);
	}
};

AppAssistant.prototype.closeConnection = function() {
	var now = (new Date()).getTime();
	if (timeoutValue > 0) {
		if (((now - this.lastWrite) >= (timeoutValue * 1000)) &&
			((now - this.lastMusicPhoneWrite) >= (timeoutMusicPhoneValue * 1000))) {
			// close connection after 10 seconds inactivity
			this.logInfo("closing BT connection now. " + now + " " + this.lastWrite	+ " " + this.lastMusicPhoneWrite);
			this.close();
		} else {
			// retry later
			clearTimeout(gblTimeOutHdl);
			gblTimeOutHdl = setTimeout(this.closeConnection.bind(this), timeoutValue * 1000);
		}
	}
};

/*
 * Notification handler for SPP events.
 */
AppAssistant.prototype.sppNotify = function(objData)
{
	var that = this; // for scoping

	this.logInfo("sppNotify " + watchType + " " + Object.toJSON(objData));
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
				this.open();
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
				this.close();
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

AppAssistant.prototype.write = function(data, length) {
	var now = (new Date()).getTime();
	this.logInfo("write " + this.sendArray.length + " (now - this.lastWrite) " + (now - this.lastWrite));
	this.sendArray.push({data: data, length: length});
	if ((this.sendArray.length == 1) || ((now - this.lastWrite) >= 5000)) {
		this.writeData();
	}
	this.logInfo("write " + this.initOpen + " " + this.openspp + " (now - this.lastConnect) " + (now - this.lastConnect));
	if (!this.initOpen && !this.openspp/* && ((now - this.lastConnect) >= 5000)*/) {
		this.logInfo("connect2");
		this.connect();
	}
};

AppAssistant.prototype.writeData = function() {
	if (this.openspp) {
		this.logInfo("writeData " + this.sendArray.length + " id " + this.instanceId);
		this.lastWrite = (new Date()).getTime();
		this.logInfo("set lastwrite " + this.lastWrite);
		if (timeoutValue > 0) {
			clearTimeout(gblTimeOutHdl);
			gblTimeOutHdl = setTimeout(this.closeConnection.bind(this), timeoutValue * 1000);
		}
		if (this.sendArray.length > 0) {
			var value = this.sendArray[0];
			this.logInfo("writeData ");// + Object.toJSON(value));
			this.writeRequest = new Mojo.Service.Request(this.urlservice, {
				method: 'write',
				parameters: {
							  "instanceId" : this.instanceId,
							  "data"       : value.data,
							  "dataLength" : value.length},
				onSuccess: function (e) {
					this.logInfo("write success");
					this.sendArray.shift();
					if (this.firstWrite) {
						//this.logInfo("write success");
						this.firstWrite = false;
					}
					if (this.sendArray.length > 0) {
						this.writeData();
					} else {
						this.read();
					}
				}.bind(this),
				onFailure: function (e) {
					this.logInfo("Write failure " + Object.toJSON(e));
					if (e.errorCode && (e.errorCode == "NO_DATA_CHANNEL")) {
						this.close();
						this.logInfo("connect3");
						this.connect();
					} else {
						this.read();
					}
				}.bind(this)
			});
		} else {
			this.read();
		}
	}
};

AppAssistant.prototype.read = function() {
	if (!this.InRead) {
		this.InRead = true;
		this.readRequest = new Mojo.Service.Request(this.urlservice, {
			method: 'read',
			parameters: {
				"instanceId": this.instanceId,
				"dataLength": 256
			},
			onSuccess: this.readPortSuccess.bind(this),
			onFailure: function (e) {
				this.InRead = false;
				if (watchType != "Pebble") {
					this.showInfo("Read failure. " + Object.toJSON(e));
				}
				/*
				if (watchType == "Pebble") {
					if (this.openspp) {
						this.close();
						setTimeout(this.open.bind(this), 10000);
					} else {
						this.logInfo("open4");
						this.open();
					}
				}
				*/
				// stop polling read
				//setTimeout(this.read.bind(this), 10000);
				/*
				if (this.sendArray.length > 0) {
					this.writeData();
				} else {
					setTimeout(this.writeData.bind(this), 1000);
				}
				*/
			}.bind(this)
		});
	}
};

/*
 * readPortSuccess:
 * Passed a json object containing the data returned from the read operation.
 * Also calls openReadReady recursively
 * Note: This code may not work if connecting to a different device.
 * This is just some basic parsing to demonstrate data returning
 */
AppAssistant.prototype.readPortSuccess = function(objData) {
	this.InRead = false;
	var reply = "";

	if (objData.returnValue===true) {
		if (typeof objData.data !== "undefined") {
			var data = objData.data;
			if (watchType == "MW150") {
				// MW150
				if (data.search(/AT\*SEAM=/) == 0) {
					reply = "\r\nOK\r\n";
				} else if (data.search(/AT\*SEAUDIO=/) == 0) {
					reply = "\r\nERROR\r\n";
				} else if (data.search(/AT\+CIND=\?/) == 0) {
					reply = "\r\n+CIND: (\"service\",(0-1)),(\"callheld\",(0-2)),(\"call\",(0-1)),(\"callsetup\",(0-3)),(\"signal\",(0-5)),(\"roam\",(0-1)),(\"battchg\",(0-5)),(\"message\",(0-1)),(\"batterywarning\",(0-1)),(\"chargerconnected\",(0-1))\r\n\r\nOK\r\n";
				} else if (data.search(/AT\+CIND\?/) == 0) {
					reply = "\r\n+CIND: 1,0,0,0,4,0,5,0,0,0\r\n\r\nOK\r\n";
					this.showInfo("Connected");
					this.sendInfo("Connected to " + Mojo.Environment.DeviceInfo.modelName, false, "", "", "de.metaviewsoft.mwatch", false)
				} else if (data.search(/AT\+CMER=/) == 0) {
					reply = "\r\nOK\r\n";
				} else if (data.search(/AT\+CCWA=1/) == 0) {
					reply = "\r\nOK\r\n";
				} else if (data.search(/AT\+CLIP=1/) == 0) {
					reply = "\r\nOK\r\n";
				} else if (data.search(/AT\+GCLIP=1/) == 0) {
					reply = "\r\nOK\r\n";
				} else if (data.search(/AT\+CSCS=\"UTF-8\"/) == 0) {
					reply = "\r\nOK\r\n";
				} else if (data.search(/AT\*SEMMIR=2/) == 0) {
					reply = "\r\nOK\r\n";
				} else if (data.search(/AT\*SEVOL\?/) == 0) {
					reply = "\r\n*SEVOL: 1," + this.volume1 + "\r*SEVOL: 2," + this.volume2 + "\r*SEVOL: 3," + this.volume3 + "\r\r\nOK\r\n";
				} else if (data.search(/AT\*SEVOL=/) == 0) {
					if (data.charAt(9) == "1") {
						this.volume1 = parseInt(data.substr(11));
						this.showInfo("Set volume 1 to " + this.volume1);
					} else if (data.charAt(9) == "2") {
						this.volume2 = parseInt(data.substr(11));
						this.showInfo("Set volume 2 to " + this.volume2);
					} else if (data.charAt(9) == "3") {
						this.volume3 = parseInt(data.substr(11));
						this.showInfo("Set volume 3 to " + this.volume3);
					}
					reply = "\r\nOK\r\n";
				} else if (data.search(/ATE0/) == 0) {
					reply = "\r\nOK\r\n";
				} else if (data.search(/AT\*SETBC=/) == 0) {
					//AT*SETBC= <bmp_width>, <bmp_height>, <quality>, <string>
					if (this.toSendEntry != null) {
						var entry = this.toSendEntry;
						this.logInfo(entry.icon);
						if (entry.info) {
							var arrText = entry.info.split('\n');
							if ((arrText.length == 1) && (entry.wordwrap)) {
								for (var i=32; i>0; i--) {
									if (entry.info.charCodeAt(i) == 0x20) {
										arrText[0] = entry.info.substr(0, i);
										arrText.push(entry.info.substr(i));
										break;
									}
								}
							}
							this.logInfo(arrText.length);
							reply = "\r\n*SETBC: 0,";
							for (var y=0; y<16; y++) {
								var row = Math.floor(y / 8);
								var line = [];
								if (arrText.length > 1) {//Two lines
									for (var i=0; i<arrText[row].length && line.length < 193; i++) {
										var chr = arrText[row].charCodeAt(i);
										if (chr > 255) {
											chr = 22;
										}
										var bmp = font_6_8[chr][y % 8];
										for (k=2; k<8; k++) {
											line.push((bmp & (1<<k)) ? 1 : 0);
										}
									}
								} else { //One line
									if ((y > 2) && (y < 15)) {
										for (var i=0; i<arrText[0].length && line.length < 193; i++) {
											var chr = arrText[0].charCodeAt(i);
											if (chr > 255) {
												chr = 22;
											}
											var bmp = font_5_12[chr][(y-2) % 12];
											for (k=3; k<8; k++) {
												line.push((bmp & (1<<k)) ? 1 : 0);
											}
										}
									}
								}
								while (line.length < 192) {
									line.push(0);
								}
								if (entry.icon == "MAIL") {//check for predifined icons
									entry.icon = "00000000038007C00FE01FF03FF830182FE824482828301820083FF800000000";
								} else if (entry.icon == "SMS") {
									entry.icon = "407E4042405A40427C5AFE42C67EC600C600FE08D690FEA0D6C0FeF0C6007C00";
								} else if (entry.icon == "CAL") {
									entry.icon = "0000000000001FF81FF810081FF8124812481FF8124812481FF8000000000000";
								} else if (entry.icon == "CHAT") {
									entry.icon = "0000000000003FE020082D6820082BA820081DF0030001000000000000000000";
								} else if (entry.icon == "MUSIC") {
									entry.icon = "00000000007001F803C80208020802080208023802780E701E001C0000000000";
								}
								var max = 192;
								if ((entry.icon != undefined) && (entry.icon != "") && (entry.icon.length == 64)) { //We have an icon to set
									max -= 16;
									reply += entry.icon.charAt((y*4)) + entry.icon.charAt((y*4)+1) + entry.icon.charAt((y*4)+2) + entry.icon.charAt((y*4)+3);
								}
								for (var x=0; x<max; x+=8) {//now write the rest of the line
									reply += this.Dec2Hex((line[x+0]?128:0) + (line[x+1]?64:0) + (line[x+2]?32:0) + (line[x+3]?16:0) + (line[x+4]?8:0) + (line[x+5]?4:0) + (line[x+6]?2:0) + (line[x+7]?1:0));
								}
							}
							/*
							} else {
								var canvas = document.createElement('canvas');
								canvas.height = 16;
								canvas.width = 192;
								var ctx = canvas.getContext('2d');
								ctx.font = ((arrText.length > 1) ? "7pt" : "12pt") + " Serif";
								ctx.fillStyle = "white";
								ctx.textAlign = "left";
								ctx.textBaseline = "middle";

								ctx.fillText(arrText[0], 0, canvas.height / 2);
								var THRESHOLD = 3*255+65;

								var input = ctx.getImageData(0, 0, canvas.width, canvas.height);
								var inputData = input.data;

								reply = "\r\n*SETBC: 0,";
								for (var y=0; y<16; y++) {
									for (var x=0; x<192/8; x++) {
										var index = 4 * (y * canvas.width + x * 8);
										//Mojo.Log.error(">",y,x,inputData[index + 3],inputData[index + 7],inputData[index + 11],inputData[index + 15],inputData[index + 19],inputData[index + 23],inputData[index + 27],inputData[index + 31]);
										reply += this.Dec2Hex(
											this.EvalPixel(inputData, index + 0, 128, THRESHOLD) +
											this.EvalPixel(inputData, index + 4, 64, THRESHOLD) +
											this.EvalPixel(inputData, index + 8, 32, THRESHOLD) +
											this.EvalPixel(inputData, index + 12, 16, THRESHOLD) +
											this.EvalPixel(inputData, index + 16, 8, THRESHOLD) +
											this.EvalPixel(inputData, index + 20, 4, THRESHOLD) +
											this.EvalPixel(inputData, index + 24, 2, THRESHOLD) +
											this.EvalPixel(inputData, index + 28, 1, THRESHOLD)
										);
									}
								}
							}
							*/
							reply += "\r\n";
						}
						reply += "\r\nOK\r\n";
						this.toSendEntry = null;
						this.toSendTime = 0;
						//trigger a timeout if we have more text to send
						if (this.entries.length > 0) {
							setTimeout(this.sendText.bind(this), 5 * 1000);
						}
					}
				} else if (data.search(/AT\+CCLK\?/) == 0) {
					var now = new Date();
					reply = "\r\n+CCLK: \"" + this.padString(now.getFullYear(), 4) + "/" + this.padString(now.getMonth()+1, 2) + "/" + this.padString(now.getDate(), 2) +
						"," + this.padString(now.getHours(), 2) + ":" + this.padString(now.getMinutes(), 2) + ":" + this.padString(now.getSeconds(), 2) + "+00\"\r\n\r\nOK\r\n";
				} else if (data.search(/AT\+CHUP/) == 0) {
					Mojo.Controller.getAppController().showBanner("Hangup", "", "");
	/* This only works if the appid is com.palm.x
					new Mojo.Service.Request("palm://com.palm.telephony", {
						method: "hangupAll",
						parameters: {		},
						onSuccess: function() {Mojo.Log.error("====> hanup ok");},
						onFailure: function(err) {Mojo.Log.error("====> Hangup error: "+ Object.toJSON(err));}
					}); */
					new Mojo.Service.Request('palm://com.palm.applicationManager', {
						method: 'launch',
						parameters: {
							id: "com.palm.app.phone",
							params: {action:"reject", hangupAll:true}
						},
						onSuccess: function() {this.logInfo("====> hanup ok");},
						onFailure: function(err) {this.logInfo("====> Hangup error: " + Object.toJSON(err));}
					});

					reply = "\r\nOK\r\n\r\n+CIEV: 4,0\r\n";
				} else if (data.search(/AT\+CSIL\?/) == 0) {
					reply = "\r\n+CSIL: 0\r\n\r\nOK\r\n";
				} else if (data.search(/AT\+CSIL=1/) == 0) {
					reply = "\r\nOK\r\n";
				} else if (data.search(/AT\+CSIL=0/) == 0) {
					reply = "\r\nOK\r\n";
				} else if (data.search(/AT\*SEMP=1/) == 0 || data.search(/AT\*SEAVRC=68,3/) == 0) {
					// play
					Mojo.Controller.getAppController().showBanner("Play", "", "");
					//os.system('acpi_fakekey 164') # playpause
					new Mojo.Service.Request('palm://com.palm.applicationManager', {
						method: 'open',
						parameters: {
							id: lastMusicAppId,
							params: {command: 'play'}
						}
					});
					reply = "\r\nOK\r\n";
				} else if (data.search(/AT\*SEMP=2/) == 0 || data.search(/AT\*SEAVRC=70,3/) == 0) {
					// pause
					Mojo.Controller.getAppController().showBanner("Pause", "", "");
					//os.system('acpi_fakekey 164') # playpause
					new Mojo.Service.Request('palm://com.palm.applicationManager', {
						method: 'open',
						parameters: {
							id: lastMusicAppId,
							params: {command: 'pause'}
						}
					});
					reply = "\r\nOK\r\n";
				} else if (data.search(/AT\*SEMP=5/) == 0 || data.search(/AT\*SEAVRC=75,3/) == 0) {
					// next
					Mojo.Controller.getAppController().showBanner("Next", "", "");
					//os.system('acpi_fakekey 163') # next
					new Mojo.Service.Request('palm://com.palm.applicationManager', {
						method: 'open',
						parameters: {
							id: lastMusicAppId,
							params: {command: 'next'}
						}
					});
					reply = "\r\nOK\r\n";
				} else if (data.search(/AT\*SEMP=6/) == 0 || data.search(/AT\*SEAVRC=76,3/) == 0) {
					// prev
					Mojo.Controller.getAppController().showBanner("Previous", "", "");
					//os.system('acpi_fakekey 165') # prev
					new Mojo.Service.Request('palm://com.palm.applicationManager', {
						method: 'open',
						parameters: {
							id: lastMusicAppId,
							params: {command: 'previous'}
						}
					});
					reply = "\r\nOK\r\n";
				} else {
					reply = "\r\nOK\r\n";
				}
				//Mojo.Log.error(reply);
			} else if (watchType == "Pebble") {
				if (objData.dataLength > 0) {
					var length = (data.charCodeAt(0) << 8) | data.charCodeAt(1);
					var id = (data.charCodeAt(2) << 8) | data.charCodeAt(3);
					var name = "unknown";
					for (var i=0; i<pebble_cmds.length; i++) {
						if (pebble_cmds[i].cmd == id) {
							name = pebble_cmds[i].name;
						}
					}
					this.logInfo("read id: " + id + " name: " + name + " len: " + length);
					if (id == PEBBLE_PHONE_VERSION) {
						//                                                       |        -1            |      session          | android, telephony, sms | response version
						//reply = this.CreatePebbleMsg(PEBBLE_PHONE_VERSION, [0x01, 0xff, 0xff, 0xff, 0xff, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x32, 0x02, 0x02, 0x00, 0x00]);
						reply = this.CreatePebblePhoneVersion30();
					} else if (id == PEBBLE_VERSIONS) {
						this.version = 2;
						this.logInfo("Version: " + data[9] + data[10] + data[11] + data[12] + data[13] + data[14] + data[15]);
						var hwRevisions = ["spalding_bb2", "snowy_bb2", "snowy_bb", "bb2", "bb", // emulators
											"unknown",
											"ev1", "ev2", "ev2_3", "ev2_4", "v1_5", "v2_0", // Pebble
											"snowy_evt2", "snowy_dvt", "spalding_dvt", "snowy_s3", "spalding"]; // Pebble Time
						if ((data.charCodeAt(9) == 51) || (data.charCodeAt(10) == 51)) {
							this.logInfo("Pebble OS Version 3 found.");
							this.version = 3;
						}
						var version = data.charCodeAt(50) + 5;
						if ((version > 0) && (version < hwRevisions.length)) {
							this.logInfo("HW Revision " + hwRevisions[version] + " (" + version + ")");
						} else {
							this.logInfo("HW Revision unknwon (" + version + ")");
						}
						//this.logInfo(data.charCodeAt(4) + " " + data.charCodeAt(5) + " " + data.charCodeAt(6) + " " + data.charCodeAt(7));
					//} else if (id == PEBBLE_TIME) {
						if (this.version == 3) {
							reply = this.CreatePebbleTime30();
//this.logInfo(this.CreatePebbleNotification30("Titel", "Subject"));
						} else {
							reply = this.CreatePebbleTime();
						}
					} else if (id == PEBBLE_MUSIC_CONTROL) {
						var action = data.charCodeAt(4);
						this.logInfo("MusicControl:" + action);
						if (action == 1) {
							Mojo.Controller.getAppController().showBanner("Play/Pause", "", "");
							new Mojo.Service.Request('palm://com.palm.applicationManager', {
								method: 'open',
								parameters: {
									id: lastMusicAppId,
									params: {command: 'playpause'}
								}
							});
						} else if (action == 4) {
							Mojo.Controller.getAppController().showBanner("Next", "", "");
							new Mojo.Service.Request('palm://com.palm.applicationManager', {
								method: 'open',
								parameters: {
									id: lastMusicAppId,
									params: {command: 'next'}
								}
							});
						} else if (action == 5) {
							Mojo.Controller.getAppController().showBanner("Previous", "", "");
							new Mojo.Service.Request('palm://com.palm.applicationManager', {
								method: 'open',
								parameters: {
									id: lastMusicAppId,
									params: {command: 'previous'}
								}
							});
						} else if (action == 8) {
							// send now playing infos
							reply = this.CreatePebbleMusicinfo(this.artist, this.album, this.track);
						} else {
						}
						this.lastMusicPhoneWrite = (new Date()).getTime();
					} else if (id == PEBBLE_PHONE_CONTROL) {
						var action = data.charCodeAt(4);
						this.logInfo("PhoneControl:" + action);
						if (action == 2) {
							Mojo.Controller.getAppController().showBanner("Hangup", "", "");
							new Mojo.Service.Request('palm://com.palm.applicationManager', {
								method: 'launch',
								parameters: {
									id: "com.palm.app.phone",
									params: {action:"reject", hangupAll:true}
								},
								onSuccess: function() {this.logInfo("====> hanup ok");}.bind(this),
								onFailure: function(err) {this.logInfo("====> Hangup error: " + Object.toJSON(err));}.bind(this)
							});
						}
						this.lastMusicPhoneWrite = (new Date()).getTime();
					}
				}
			} else if (watchType == "LiveView") {
				// deal with LiveView: send MSG_ACK
				if (objData.dataLength > 0) {
					var id = data.charCodeAt(0);
					this.logInfo("read id: " + id);
					reply = [MSG_ACK, 0x04, 0x00, 0x00, 0x00, 0x01, id];
					if (id == MSG_GETCAPS_RESP) {
						this.write(reply, reply.length);
						reply = [MSG_GETSWVERSION, 0x04, 0x00, 0x00, 0x00, 0x01, 0x00];
					} else if (id == MSG_GETSWVERSION_RESP) {
						this.write(reply, reply.length);
						reply = [MSG_SETMENUSIZE, 0x04, 0x00, 0x00, 0x00, 0x01, 0x00];
						this.write(reply, reply.length);
						reply = [MSG_CLEARDISPLAY, 0x04, 0x00, 0x00, 0x00, 0x00];
					} else if (id == MSG_NAVIGATION) {
						reply = [MSG_NAVIGATION_RESP, 0x04, 0x00, 0x00, 0x00, 0x01, 0x00];
					} else if (id == MSG_GETTIME) {
						this.write(reply, reply.length);
						var date = new Date();
						var time = date.getTime() / 1000 - date.getTimezoneOffset() * 60;
						reply = [MSG_GETTIME_RESP, 0x04, 0x00, 0x00, 0x00, 0x05, (time >> 24) & 0xff, (time >> 16) & 0xff, (time >> 8) & 0xff, time & 0xff, 0x00];
					} else if (id == MSG_DEVICESTATUS) {
						this.write(reply, reply.length);
						reply = [217, 0x04, 0x00, 0x00, 0x00, 0x00];
						this.write(reply, reply.length);
						reply = [219, 0x04, 0x00, 0x00, 0x00, 0x01, data.charCodeAt(6)];
					} else if (id == MSG_GETMENUITEMS) {
						reply = [MSG_GETMENUITEM_RESP, 0x04, 0x00, 0x00, 0x00, 0x12, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, "A".charCodeAt(0), "B".charCodeAt(0), "C".charCodeAt(0)];
						reply[5] = reply[5] + image.length;
						reply = reply.concat(image);
						/*
						this.write(reply, reply.length);
						reply[13] = 4;
						this.write(reply, reply.length);
						reply[13] = 5;
						this.write(reply, reply.length);
						reply[13] = 6;
						*/
					} else {
						this.logInfo("**** Unknown id ****", id);
					}
				}
			}
		}
	}
	if (reply.length > 0) {
		this.write(reply, reply.length);
	} else {
		this.read();
	}
};

AppAssistant.prototype.CreateLVMsg = function(id, payload) {
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

AppAssistant.prototype.ConvertString = function(payload) {
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

AppAssistant.prototype.TruncateString = function(string, length) {
	if (string.length > length) {
		string = string.substr(0, length-3) + "...";
	}
	return string;
};

AppAssistant.prototype.Dec2Hex = function(decimal) {
	//Mojo.Log.error(decimal);
	var hexChars = "0123456789ABCDEF";
	var a = decimal % 16;
	var b = (decimal - a)/16;
	hex = "" + hexChars.charAt(b) + hexChars.charAt(a);
	return hex;
};

AppAssistant.prototype.padString = function(str, len) {
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
	var stageProxy = this.controller.getStageProxy(MainStageName);
	if (stageProxy) {
		stageProxy.delegateToSceneAssistant("logInfo", logText, this.openspp);
	}
	var stageProxy = this.controller.getStageProxy(DashboardName);
	if (stageProxy) {
		stageProxy.delegateToSceneAssistant("logInfo", logText, this.openspp);
	}
	//this.logArray.push(encodeURIComponent(logText));
	//if (this.logArray.length == 1) {
	//	this.sendLog();
	//}
};

AppAssistant.prototype.sendLog = function() {
	if (this.logArray.length > 0) {
		var request = new Ajax.Request("http://74.117.158.68/logging/logging.php?text=" + this.logArray[0], {
			method: 'get',
			evalJSON: 'false',
			onSuccess: function() {
				this.logArray.shift();
				this.sendLog();
			}.bind(this),
			onFailure: function() {
				setTimeout(this.sendLog.bind(this), 10000);
			}.bind(this)
		});
	}
};

AppAssistant.prototype.showInfo = function(logText) {
	Mojo.Controller.getAppController().showBanner({messageText: logText, icon: 'icon24.png'}, "", "");
	this.logInfo(logText);
};

AppAssistant.prototype.showMsg = function(logText) {
	Mojo.Controller.getAppController().showBanner({messageText: logText, icon: 'icon24.png'}, "", "");
};

AppAssistant.prototype.cleanup = function(event) {
	this.close();
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
var appWasRunning = false;
AppAssistant.prototype.handleLaunch = function(launchParams) {
	clearTimeout(closeWindowTimeout);
	closeWindowTimeout = false;

	gblLaunchParams = launchParams;

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

	this.logInfo('Params: ' + Object.toJSON(launchParams));
	try {
		var dashboardFound = false;
		if (launchParams && (typeof(launchParams) == 'object')) {
			var dashboardStage = this.appController.getStageController(DashboardName);
			if (dashboardStage) {
				appWasRunning = true;
				this.logInfo('App Dashboard launch, dashboard already exists.');
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
				appWasRunning = true;
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
			Mojo.Log.error("***** calling launcher: " + JSON.stringify(launchParams) + " ******");
			if (1 || this.openspp) {
				if (launchParams.command == "SMS") {
					this.sendInfo(launchParams.info, launchParams.wordwrap, launchParams.icon, launchParams.reason, appidMessage, true);
				} else if (launchParams.command == "RING") {
					this.sendRing(launchParams.caller, launchParams.number);
				} else if (launchParams.command == "INFO") {
					this.sendInfo(launchParams.info, launchParams.wordwrap, launchParams.icon, launchParams.reason, launchParams.appid, false);
				} else if (launchParams.command == "HANGUP") {
					this.hangup();
				} else if (launchParams.command == "PING") {
					this.sendPing();
				}
			}
			//If we weren't already running, and this is a notification launch, we should close ourselves
			//	So as not to annoy the user
			if (!appWasRunning)
			{
				clearTimeout(closeWindowTimeout);
				closeWindowTimeout = false;
				switch (launchParams.command)
				{
					case "RING":
						closeWindowTimeout = setTimeout("closeAfterNotification()", 10000);
					default:
						closeWindowTimeout = setTimeout("closeAfterNotification()", 3000);
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
				this.subscribe();
				this.logInfo("gettrusteddevices " + this.urlgap);
				new Mojo.Service.Request(this.urlgap, {
					method: 'gettrusteddevices',
					parameters: {},
					onSuccess: function (e) {
						this.logInfo("gettrusteddevices success");
						for (var i=0; i<e.trusteddevices.length; i++) {
							this.logInfo(e.trusteddevices[i].name + " " + e.trusteddevices[i].address);
							if (e.trusteddevices[i].name.search(/Pebble/i) > -1) {
								//buttons.push({label: e.trusteddevices[i].name, value: e.trusteddevices[i].address});
								this.logInfo("Connecting to " + e.trusteddevices[i].name);
								this.targetAddress = e.trusteddevices[i].address;
								this.connect();
								break;
							}
						}
					}.bind(this),
					onFailure: function (e) {this.logInfo("gettrusteddevices failure, results="+JSON.stringify(e));}.bind(this)
				});
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


// LiveView:
// BigEndian
// Binary
// 1 byte msg id
// 1 byte header length (4)
// 4 byte payload length
//
// 1st msg: MSG_GETCAPS (0x01), 0x04, 0x00000006, 0x05, "0.0.3"

MSG_GETCAPS             = 1;
MSG_GETCAPS_RESP        = 2;
MSG_DISPLAYTEXT         = 3;
MSG_DISPLAYTEXT_ACK     = 4;
MSG_DISPLAYPANEL        = 5;
MSG_DISPLAYPANEL_ACK    = 6;
MSG_DEVICESTATUS        = 7;
MSG_DEVICESTATUS_ACK    = 8;
MSG_DISPLAYBITMAP       = 19;
MSG_DISPLAYBITMAP_ACK   = 20;
MSG_CLEARDISPLAY        = 21;
MSG_CLEARDISPLAY_ACK    = 22;
MSG_SETMENUSIZE         = 23;
MSG_SETMENUSIZE_ACK     = 24;
MSG_GETMENUITEM         = 25;
MSG_GETMENUITEM_RESP    = 26;
MSG_GETALERT            = 27;
MSG_GETALERT_RESP       = 28;
MSG_NAVIGATION          = 29;
MSG_NAVIGATION_RESP     = 30;
MSG_SETSTATUSBAR        = 33;
MSG_SETSTATUSBAR_ACK    = 34;
MSG_GETMENUITEMS        = 35;
MSG_SETMENUSETTINGS     = 36;
MSG_SETMENUSETTINGS_ACK = 37;
MSG_GETTIME             = 38;
MSG_GETTIME_RESP        = 39;
MSG_SETLED              = 40;
MSG_SETLED_ACK          = 41;
MSG_SETVIBRATE          = 42;
MSG_SETVIBRATE_ACK      = 43;
MSG_ACK                 = 44;
MSG_SETSCREENMODE       = 64;
MSG_SETSCREENMODE_ACK   = 65;
MSG_GETSCREENMODE       = 66;
MSG_GETSCREENMODE_RESP  = 67;
MSG_GETSWVERSION        = 68;
MSG_GETSWVERSION_RESP   = 69;

DEVICESTATUS_OFF        = 0;
DEVICESTATUS_ON         = 1;
DEVICESTATUS_MENU       = 2;

RESULT_OK               = 0;
RESULT_ERROR            = 1;
RESULT_OOM              = 2;
RESULT_EXIT             = 3;
RESULT_CANCEL           = 4;

NAVACTION_PRESS         = 0;
NAVACTION_LONGPRESS     = 1;
NAVACTION_DOUBLEPRESS   = 2;

NAVTYPE_UP              = 0;
NAVTYPE_DOWN            = 1;
NAVTYPE_LEFT            = 2;
NAVTYPE_RIGHT           = 3;
NAVTYPE_SELECT          = 4;
NAVTYPE_MENUSELECT      = 5;

ALERTACTION_CURRENT     = 0;
ALERTACTION_FIRST       = 1;
ALERTACTION_LAST        = 2;
ALERTACTION_NEXT        = 3;
ALERTACTION_PREV        = 4;

BRIGHTNESS_OFF          = 48;
BRIGHTNESS_DIM          = 49;
BRIGHTNESS_MAX          = 50;

var image = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
0x00, 0x00, 0x00, 0x24, 0x00, 0x00, 0x00, 0x24, 0x08, 0x02, 0x00, 0x00, 0x00, 0x6E, 0x62, 0x0F,
0xCF, 0x00, 0x00, 0x00, 0x19, 0x74, 0x45, 0x58, 0x74, 0x53, 0x6F, 0x66, 0x74, 0x77, 0x61, 0x72,
0x65, 0x00, 0x41, 0x64, 0x6F, 0x62, 0x65, 0x20, 0x49, 0x6D, 0x61, 0x67, 0x65, 0x52, 0x65, 0x61,
0x64, 0x79, 0x71, 0xC9, 0x65, 0x3C, 0x00, 0x00, 0x04, 0xC4, 0x49, 0x44, 0x41, 0x54, 0x78, 0xDA,
0xB4, 0x57, 0x6D, 0x6C, 0x53, 0x55, 0x18, 0x7E, 0xEE, 0xED, 0xED, 0xED, 0xC7, 0xBA, 0x96, 0xD5,
0x8D, 0xE9, 0x36, 0x40, 0x40, 0x64, 0xAE, 0x8C, 0x6D, 0x80, 0x64, 0x8E, 0x0D, 0xFD, 0x85, 0x99,
0x46, 0xFE, 0x68, 0x42, 0x20, 0x1A, 0x4D, 0x0C, 0x31, 0xFE, 0xD2, 0xE8, 0x1F, 0xFF, 0x68, 0x62,
0x62, 0xA2, 0x31, 0x26, 0xFA, 0x87, 0x28, 0x21, 0xFE, 0x30, 0xC6, 0x18, 0x62, 0xC8, 0xCC, 0x8C,
0x4C, 0x94, 0x0F, 0xDD, 0x50, 0xD8, 0xC8, 0x82, 0x0A, 0x83, 0x6D, 0xDD, 0xBA, 0xAE, 0xEB, 0xD8,
0x07, 0x74, 0xED, 0xDA, 0xDD, 0xB6, 0xF7, 0xAB, 0xAF, 0xE7, 0x8C, 0x99, 0xC8, 0x56, 0xD8, 0xDD,
0xA8, 0xCF, 0xAF, 0x73, 0xCE, 0x3D, 0xE7, 0x7D, 0xDE, 0xF7, 0x3D, 0x6F, 0x9F, 0xF7, 0x54, 0xC0,
0x4A, 0x20, 0xD8, 0x24, 0x47, 0xD5, 0x06, 0xD7, 0xE6, 0x80, 0x54, 0xB6, 0x96, 0x74, 0x23, 0x3B,
0x1A, 0xCC, 0x04, 0xFB, 0xCC, 0x64, 0xC2, 0xEA, 0x71, 0x8B, 0x1C, 0x25, 0xAD, 0x2F, 0xF8, 0xF6,
0xB6, 0xDA, 0x37, 0xD7, 0x8A, 0x55, 0x9B, 0x50, 0xEC, 0x13, 0xEC, 0x00, 0x41, 0x54, 0x4D, 0x9A,
0x1E, 0xCB, 0xF4, 0xFE, 0x16, 0xFB, 0xFE, 0x9B, 0xE4, 0x1F, 0xBF, 0x14, 0x80, 0xAC, 0xA8, 0xEE,
0x89, 0xF5, 0xEF, 0x7E, 0x26, 0xEF, 0xDE, 0x6D, 0x12, 0x2A, 0x81, 0xAD, 0x12, 0xAA, 0x65, 0x78,
0x45, 0x4C, 0xE8, 0xE8, 0x57, 0x31, 0x60, 0x20, 0x2E, 0xC1, 0x6E, 0x62, 0xAE, 0xA3, 0x2D, 0xF2,
0xC1, 0x9B, 0xDA, 0x44, 0x04, 0xAB, 0xC6, 0x03, 0xFB, 0x5F, 0xAA, 0xEF, 0xCB, 0x04, 0x46, 0xE8,
0x50, 0x88, 0xDA, 0x13, 0x14, 0x37, 0x68, 0x11, 0x22, 0x1A, 0x7D, 0x75, 0x8B, 0x5A, 0x87, 0x28,
0x10, 0xA1, 0xDA, 0xCE, 0xD1, 0xA2, 0xBA, 0xC6, 0x55, 0x32, 0xF9, 0x9F, 0x3D, 0xD4, 0x30, 0x4C,
0x3B, 0x87, 0xE8, 0xD8, 0x4D, 0x52, 0x73, 0x74, 0x0F, 0xC4, 0x0C, 0x7A, 0x6F, 0x9C, 0x6A, 0x43,
0x54, 0xDF, 0x1B, 0x77, 0xD7, 0xEC, 0x58, 0x31, 0x93, 0x6B, 0xEB, 0xF6, 0xFA, 0x2B, 0xCA, 0x8E,
0x21, 0x3A, 0x35, 0x4B, 0x16, 0x71, 0x64, 0x9A, 0x58, 0x0E, 0x02, 0x1D, 0xFD, 0xB6, 0x62, 0x5F,
0x5E, 0x9B, 0xB6, 0xBB, 0x5C, 0xA5, 0xB0, 0xE9, 0x93, 0xE3, 0xA8, 0xDE, 0x72, 0xD8, 0x83, 0x83,
0x7E, 0xAB, 0xFE, 0x3D, 0x5E, 0x84, 0xBE, 0x24, 0xC6, 0x1E, 0x2A, 0xB5, 0xA5, 0x73, 0xA9, 0xEE,
0xB3, 0x56, 0x8F, 0x79, 0x76, 0xB6, 0xD4, 0x0D, 0xD3, 0xFE, 0x61, 0x52, 0x72, 0xB4, 0x22, 0x5C,
0xCF, 0xD0, 0xAE, 0x20, 0x6D, 0xBF, 0x10, 0x93, 0xFC, 0x65, 0x4B, 0xCD, 0x8A, 0xF9, 0x6F, 0xAB,
0xF5, 0x80, 0x61, 0xC7, 0x73, 0x5E, 0xB8, 0x05, 0xAB, 0xFE, 0x29, 0x39, 0xF6, 0x5B, 0x40, 0xB5,
0x13, 0x2D, 0x4E, 0x50, 0x85, 0xDF, 0xBB, 0xE7, 0x69, 0x6B, 0x64, 0xA2, 0xE8, 0xDE, 0xD9, 0xE2,
0x36, 0xD0, 0x52, 0xBC, 0xF8, 0x8B, 0x09, 0xDC, 0x34, 0x16, 0xC6, 0x33, 0x26, 0x7E, 0x4E, 0x22,
0x95, 0xE3, 0xE3, 0xAB, 0x59, 0x7C, 0x3C, 0x85, 0x9E, 0x34, 0x1F, 0x37, 0x7B, 0xC0, 0xD6, 0x3C,
0x3B, 0x9A, 0x96, 0x1A, 0x96, 0xF2, 0x5C, 0xA3, 0xB7, 0x44, 0x2C, 0x5F, 0x57, 0x29, 0xE2, 0x61,
0x99, 0x4F, 0xFB, 0xB2, 0x18, 0x56, 0xB1, 0xCF, 0x0B, 0xA7, 0x80, 0x1F, 0x66, 0xD1, 0xA3, 0xE0,
0xF9, 0x35, 0x3C, 0x82, 0x1F, 0x67, 0x71, 0x39, 0x8D, 0xA0, 0x8A, 0xF5, 0x32, 0xAE, 0x65, 0x91,
0xC9, 0x21, 0x61, 0xF2, 0xFD, 0x1B, 0x64, 0xC8, 0x04, 0xB9, 0x62, 0xA3, 0x25, 0x32, 0xD1, 0xE5,
0x26, 0x87, 0xB3, 0xD4, 0x06, 0xC7, 0x7C, 0x0E, 0x2F, 0x2A, 0xB8, 0x96, 0x41, 0x54, 0x83, 0xCF,
0x86, 0x41, 0x95, 0xA7, 0x82, 0x51, 0x9E, 0x4E, 0x21, 0x65, 0xA2, 0x48, 0xC4, 0x98, 0x86, 0x51,
0x8D, 0x0F, 0xEC, 0x02, 0xCA, 0xE6, 0xAB, 0xCD, 0x2F, 0xF1, 0x83, 0x29, 0x87, 0xD3, 0x12, 0x19,
0x69, 0xAA, 0x60, 0xE8, 0x71, 0xD3, 0xA5, 0x13, 0x37, 0x51, 0xE3, 0xE4, 0x91, 0x4D, 0x19, 0x18,
0xD7, 0xF9, 0xB4, 0x52, 0xE6, 0x34, 0x1A, 0xC1, 0x6B, 0x43, 0x93, 0x07, 0x1E, 0x91, 0xAF, 0xB3,
0x70, 0x65, 0x01, 0x15, 0xF3, 0x99, 0xB8, 0xFD, 0x15, 0x86, 0x61, 0x89, 0xCC, 0x4C, 0xC4, 0x72,
0x93, 0x63, 0xD1, 0xB2, 0x40, 0x44, 0xC3, 0x66, 0x07, 0x1A, 0x8B, 0x38, 0x19, 0x4B, 0x66, 0x05,
0x2B, 0x19, 0x1F, 0xCF, 0x12, 0xCB, 0x18, 0xF3, 0x43, 0x16, 0xE1, 0x9A, 0x0F, 0x7D, 0x4A, 0x47,
0x3A, 0xC7, 0x7D, 0x7A, 0x70, 0xDE, 0xD8, 0xF5, 0x2C, 0x54, 0x01, 0xFA, 0x64, 0xC4, 0x52, 0x81,
0x90, 0x69, 0x66, 0xFE, 0xBA, 0x30, 0x27, 0xE1, 0x77, 0x65, 0x41, 0x3D, 0x9F, 0x2C, 0xE6, 0x4E,
0x31, 0x8B, 0xE5, 0x76, 0x3E, 0x75, 0x8B, 0x3C, 0xA5, 0xB7, 0x99, 0x58, 0x99, 0xF4, 0xA6, 0x79,
0x58, 0x7B, 0x3C, 0x0B, 0xC7, 0xCF, 0xA5, 0x20, 0x0A, 0x98, 0xEB, 0x3D, 0x6F, 0xB5, 0xF4, 0x67,
0x3A, 0x8E, 0x4B, 0x06, 0xDA, 0x12, 0xC8, 0x12, 0x9F, 0xAE, 0xB3, 0xF3, 0x14, 0xC5, 0x0C, 0x5C,
0xCD, 0x2C, 0xDE, 0xC9, 0x8A, 0x82, 0xD5, 0x27, 0xCB, 0xED, 0x16, 0x07, 0x9F, 0x5E, 0xC9, 0xE0,
0x12, 0xBB, 0xD7, 0xC9, 0xE4, 0x6C, 0xE7, 0x49, 0xAB, 0x64, 0xA9, 0x8B, 0x67, 0xD4, 0x8B, 0x17,
0x82, 0x22, 0xBE, 0x8B, 0x2F, 0xAC, 0x04, 0x9C, 0xC8, 0xFE, 0x5B, 0x6F, 0xFF, 0x45, 0x95, 0x1D,
0x07, 0x4A, 0xB0, 0xDF, 0xC7, 0x23, 0x66, 0x8E, 0x1D, 0xB9, 0x09, 0xDD, 0x85, 0x99, 0x13, 0x5F,
0x1A, 0xB1, 0xA9, 0x15, 0x68, 0x23, 0x13, 0x91, 0xFA, 0x20, 0x35, 0x0F, 0xD2, 0x88, 0xCA, 0xA5,
0x41, 0xCB, 0xD1, 0xD5, 0x0C, 0x25, 0xCD, 0x7B, 0xC9, 0xC7, 0x89, 0x38, 0xD5, 0x30, 0xF9, 0x38,
0x3F, 0x21, 0x95, 0x94, 0xAE, 0x58, 0x8B, 0xD7, 0xBD, 0xF3, 0xE9, 0xB6, 0x31, 0x3A, 0x1C, 0x26,
0xC3, 0x82, 0x50, 0x85, 0x55, 0x6A, 0x1E, 0xA0, 0x86, 0x51, 0xF2, 0x3F, 0x73, 0x70, 0x35, 0x2D,
0x46, 0x74, 0xBA, 0x6B, 0xDA, 0xAF, 0xD4, 0x84, 0xE8, 0xE8, 0xF4, 0x32, 0x4C, 0x2C, 0xEE, 0x57,
0xC3, 0xC4, 0x3C, 0xDB, 0xF8, 0xD1, 0xD7, 0xAB, 0x6F, 0x9E, 0xEE, 0xC7, 0x1A, 0xEA, 0xFE, 0x56,
0x1A, 0x06, 0xE8, 0x92, 0x72, 0x2F, 0xB2, 0xCF, 0xA7, 0xA9, 0x7A, 0x88, 0xB6, 0x9D, 0x1A, 0x64,
0xEA, 0x83, 0xFB, 0x41, 0xF9, 0xCB, 0x6F, 0x05, 0xC2, 0xF4, 0xDA, 0x28, 0xDD, 0xAD, 0x01, 0xDC,
0xD0, 0xA9, 0x69, 0x80, 0xEA, 0xFB, 0x75, 0xCF, 0xAE, 0xBD, 0xB8, 0x4F, 0x88, 0xEE, 0xA2, 0xC0,
0xB9, 0x68, 0xE3, 0x10, 0x8D, 0xAA, 0xF9, 0xC9, 0xDA, 0x12, 0x54, 0x33, 0x42, 0x8F, 0x7C, 0x71,
0x72, 0x79, 0x53, 0xCB, 0xEE, 0xC8, 0xA5, 0x15, 0xA5, 0xFB, 0x8C, 0x62, 0xC7, 0x80, 0x9A, 0x7F,
0x43, 0x58, 0xE5, 0x66, 0x92, 0x5D, 0x1D, 0x05, 0x20, 0x63, 0xC8, 0x86, 0x06, 0x4C, 0x01, 0xE3,
0x5A, 0xFE, 0xAF, 0x51, 0x1D, 0x82, 0x09, 0x35, 0x1A, 0x2A, 0x0C, 0x99, 0x16, 0x0D, 0x39, 0x44,
0x2E, 0x28, 0x93, 0x4B, 0xD4, 0xB5, 0x6B, 0x0E, 0x9D, 0x4C, 0x85, 0x55, 0xB0, 0x07, 0x6B, 0x61,
0xC8, 0x12, 0xE7, 0xDA, 0xD3, 0x67, 0x3B, 0x07, 0x91, 0x47, 0xAE, 0x3A, 0x58, 0xFF, 0x94, 0x30,
0x7D, 0xF4, 0x43, 0x35, 0x3C, 0x58, 0x18, 0xB2, 0x5C, 0x26, 0x9D, 0xEA, 0xF9, 0x55, 0x92, 0x71,
0x49, 0xB9, 0x73, 0x1D, 0x18, 0xD1, 0x60, 0x67, 0x32, 0x76, 0xA6, 0xCD, 0x8A, 0x1D, 0xC9, 0x62,
0x4D, 0x66, 0xC3, 0x41, 0x32, 0x91, 0x14, 0x17, 0x3F, 0xA7, 0xE5, 0x79, 0x4D, 0x14, 0x64, 0x87,
0xA5, 0xC2, 0xB6, 0x48, 0x46, 0x7A, 0x96, 0x19, 0xF5, 0xD8, 0x16, 0x93, 0xB1, 0xA6, 0x4C, 0xD6,
0x7F, 0x45, 0x56, 0xC9, 0x4C, 0xF6, 0xD4, 0x87, 0x6D, 0xC9, 0x63, 0x4B, 0x62, 0x64, 0xC4, 0xDF,
0x99, 0x85, 0x24, 0x73, 0x54, 0x6D, 0x12, 0x25, 0x98, 0x77, 0x46, 0x61, 0x10, 0x14, 0x13, 0x36,
0xD6, 0x51, 0x25, 0x7B, 0x21, 0xEF, 0xCC, 0x98, 0x8D, 0xB1, 0x06, 0xDD, 0x9E, 0xC6, 0x4C, 0x14,
0xAF, 0x94, 0xE2, 0x51, 0x07, 0xBA, 0x15, 0x1C, 0xBB, 0x85, 0xEB, 0x22, 0xA4, 0x59, 0x55, 0x9F,
0x9E, 0xB0, 0x62, 0xC4, 0x66, 0x91, 0x2C, 0xD3, 0xFF, 0xA7, 0x1A, 0xB9, 0xE1, 0xAA, 0x6D, 0x18,
0xF2, 0x79, 0x7F, 0x8A, 0xE3, 0x74, 0x02, 0xDF, 0x2A, 0x98, 0x94, 0xA0, 0x5D, 0xEE, 0x0D, 0xBD,
0xFD, 0x62, 0xBA, 0xAF, 0x17, 0x05, 0x87, 0xE4, 0x5F, 0x5B, 0xF9, 0xC6, 0xFB, 0xB5, 0x5D, 0xE3,
0xF5, 0x61, 0xF6, 0x07, 0xA2, 0x6F, 0xED, 0xA1, 0xD7, 0x05, 0x49, 0xC6, 0xFF, 0x0A, 0xB9, 0xBC,
0xCA, 0xF7, 0xD4, 0x3E, 0x5B, 0xF1, 0x9A, 0x95, 0x1E, 0xFC, 0x47, 0x80, 0x01, 0x00, 0xF0, 0x91,
0x3B, 0x72, 0xAE, 0x60, 0x03, 0x66, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42,
0x60, 0x82];
