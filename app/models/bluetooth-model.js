var logger;
var notifier;
var BluetoothModel = function(logHandler, userNotifier) { 
    logger = logHandler;
    notifier = userNotifier
    this.openspp = false;
    this.initOpen = true;
    this.entries = [];
	this.sendArray = [];
	this.toSendEntry = null;
	this.toSendTime = 0;
    this.firstWrite = true;
	this.lastWrite = 0;
	this.lastConnect = 0;
	this.InRead = false;
	this.version = 0;
    this.urlgap     = 'palm://com.palm.bluetooth/gap';
    this.urlspp     = 'palm://com.palm.bluetooth/spp';
	this.urlservice = 'palm://com.palm.service.bluetooth.spp';
	this.artist = "";
	this.album = "";
	this.track = "";
    this.volume1 = 4;
	this.volume2 = 6;
	this.volume3 = 8;
};

BluetoothModel.prototype.getOpen = function() {
	return this.openspp;
};

BluetoothModel.prototype.sendPing = function(caller, number, watchType, instanceId, targetAddress) {
	if ((valueAll < 2) && (valuePhone < 2)) {
		// RING: just vibrate
		caller = caller ? caller.replace(/\"/g, "'") : "";
		number = number ? number.replace(/\"/g, "'") : "";
		notifier(caller + " " + number, logger);
		if (watchType == "MW150") {
			var data = "\r\nRING\r\n";
			this.write(data, data.length, watchType, instanceId, targetAddress);
		} else if (watchType == "Pebble") {
			var data = CreatePebblePing();
			this.write(data, data.length, watchType, instanceId, targetAddress);
		} else if (watchType == "LiveView") {
			// green
			var reply = [MSG_SETLED, 0x04, 0x00, 0x00, 0x00, 0x06, 0x07, 0xe0, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length, watchType, instanceId, targetAddress);
			// red
			reply = [MSG_SETLED, 0x04, 0x00, 0x00, 0x00, 0x06, 0xf8, 0x00, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length, watchType, instanceId, targetAddress);
			// blue
			reply = [MSG_SETLED, 0x04, 0x00, 0x00, 0x00, 0x06, 0x00, 0x1f, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length, watchType, instanceId, targetAddress);
			// vibrate
			reply = [MSG_SETVIBRATE, 0x04, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length, watchType, instanceId, targetAddress);
		}
	}
};

BluetoothModel.prototype.sendInfo = function(info, wordwrap, icon, reason, appid, ring, watchType, instanceId, targetAddress) {
	Mojo.Log.error("***** sending appid: " + appid + " *****");
	var value = valueOther;
	var from = "Unknown";
	var music = false;

	//Determine if a Message is actually an Email
	var findLB = info.indexOf("\n");
	var findAt = info.indexOf("@");
	if (findLB > -1 && findAt > findLB)
		appid = appidEmail;

    logger("sendInfo app id now: " + appid);

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
    
    logger("sendInfo value " + value + " from: " + from);

	var accepted = false;
	if ((appid != appidEmail) || (pattern.length == 0) || info.test) {
		accepted = true;
	} else {
		for (var i=0; i<pattern.length; i++) {
			var myRegExp = new RegExp(pattern[i], "i");
			if (info.search(myRegExp) > -1) {
				accepted = true;
				break;
			}
		}
    }
    
    logger("sendInfo accepted " + accepted);

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
			logger("send info entry: " + JSON.stringify(entry));
			if (((new Date()).getTime() - this.toSendTime) > (10 * 1000)) {
				logger("sending text to " + instanceId, targetAddress);
				this.sendText(watchType, instanceId, targetAddress);
			}
			else
				logger("not sending because of time check");
		}
	}
};

BluetoothModel.prototype.sendText = function(watchType, instanceId, targetAddress) {
	logger("sendText " + this.entries.length);
	if (this.entries.length > 0) {
		this.toSendEntry = this.entries.shift();
		this.toSendTime = (new Date()).getTime();
		if (watchType == "MW150") {
			if ((valueAll < 1) && (this.toSendEntry.value < 1)) {
				if (this.toSendEntry.ring) {
					var data = "\r\nRING\r\n";
					this.write(data, data.length, watchType, instanceId, targetAddress);
				}
			}
			var data = "\r\n*SEMMII: 2,\"" + this.toSendEntry.hash + "\"\r\n";
			this.write(data, data.length, watchType, instanceId, targetAddress);
		} else if (watchType == "Pebble") {
			var data;
			if (this.toSendEntry.music) {
				var arr = this.toSendEntry.info.split("\n", 3);
				data = CreatePebbleMusicinfo((arr.length > 0) ? arr[0] : "", (arr.length > 2) ? arr[2] : "", (arr.length > 1) ? arr[1] : "");
			} else if (this.version == 3) {
				var from = this.toSendEntry.from;
				var info = this.toSendEntry.info;
				data = this.toSendEntry.info.split("\n", 2);
				if (data.length > 1) {
					from = data[1];
					info = data[0];
				}
				data = CreatePebbleNotification30(from, info, this.toSendEntry.appid);
			} else if (this.version == 2) {
				data = CreatePebbleNotification(this.toSendEntry.from, this.toSendEntry.info);
			} else {
				// unknown pebble version, send both types
				var from = this.toSendEntry.from;
				var info = this.toSendEntry.info;
				data = this.toSendEntry.info.split("\n", 2);
				if (data.length > 1) {
					from = data[1];
					info = data[0];
				}
				data = CreatePebbleNotification30(from, info, this.toSendEntry.appid);
				this.write(data, data.length, watchType, instanceId, targetAddress);
				data = CreatePebbleNotification(this.toSendEntry.from, this.toSendEntry.info);
			}
			this.write(data, data.length, watchType, instanceId, targetAddress);
			this.toSendEntry = null;
			this.toSendTime = 0;
            //trigger a timeout if we have more text to send
			if (this.entries.length > 0) {
				setTimeout(bluetoothModel.sendText(watchType, instanceId, targetAddress), 5 * 1000);
			}
		} else if (watchType == "LiveView") {
		}
	}
}

BluetoothModel.prototype.sendRing = function(caller, number, watchType, instanceId, targetAddress) {
	if ((valueAll < 2) && (valuePhone < 2)) {
		// RING: just vibrate
		caller = caller ? caller.replace(/\"/g, "'") : "";
		number = number ? number.replace(/\"/g, "'") : "";
		notifier(caller + " " + number, logger);
		if (watchType == "MW150") {
			var data = "\r\n+CIEV: 4,1\r\n";
			this.write(data, data.length, watchType, instanceId, targetAddress);
			var data = "\r\n+CLIP: \"" + caller + "\",129,\"" + number + "\",,\"\"\r\n";
			this.write(data, data.length, watchType, instanceId, targetAddress);
			if ((valueAll < 1) && (valuePhone < 1)) {
				var data = "\r\nRING\r\n";
				this.write(data, data.length, watchType, instanceId, targetAddress);
			}
		} else if (watchType == "Pebble") {
			var data = CreatePebblePhoneinfo(caller, number);
			this.write(data, data.length, watchType, instanceId, targetAddress);
			setTimeout(bluetoothModel.pebbleRing(watchType, instanceId, targetAddress), 2000);
		} else if (watchType == "LiveView") {
			// green
			var reply = [MSG_SETLED, 0x04, 0x00, 0x00, 0x00, 0x06, 0x07, 0xe0, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length, watchType, instanceId, targetAddress);
			// red
			reply = [MSG_SETLED, 0x04, 0x00, 0x00, 0x00, 0x06, 0xf8, 0x00, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length, watchType, instanceId, targetAddress);
			// blue
			reply = [MSG_SETLED, 0x04, 0x00, 0x00, 0x00, 0x06, 0x00, 0x1f, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length, watchType, instanceId, targetAddress);
			// vibrate
			reply = [MSG_SETVIBRATE, 0x04, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x02, 0x00];
			this.write(reply, reply.length, watchType, instanceId, targetAddress);
		}
	}
};

BluetoothModel.prototype.hangup = function(watchType, instanceId, targetAddress) {
	Mojo.Log.error("Bluetooth model hangup");
	if (watchType == "MW150") {
		var data = "\r\n+CIEV: 4,0\r\n";
		this.write(data, data.length, watchType, instanceId, targetAddress);
	} else if (watchType == "Pebble") {
		var data = CreatePebbleHangup();
		this.write(data, data.length, watchType, instanceId, targetAddress);
		data = CreatePebbleRingEnd();
		this.write(data, data.length, watchType, instanceId, targetAddress);
	} else if (watchType == "LiveView") {
	}
};

//Pebble Specific
BluetoothModel.prototype.pebbleRing = function(watchType, instanceId, targetAddress) {
	Mojo.Log.error("doing pebble ring for " + watchType + " instance: " + instanceId + " target: " + targetAddress);
	var data = CreatePebbleRinger();
	bluetoothModel.write(data, data.length, watchType, instanceId, targetAddress);
	setTimeout(bluetoothModel.pebbleRingEnd(watchType, instanceId, targetAddress), 10000);
	this.lastMusicPhoneWrite = (new Date()).getTime();
};

BluetoothModel.prototype.pebbleRingEnd = function(watchType, instanceId, targetAddress) {
	Mojo.Log.error("doing pebble ring for " + watchType + " instance: " + instanceId + " target: " + targetAddress);
	var data = CreatePebbleRingEnd();
	bluetoothModel.write(data, data.length, watchType, instanceId, targetAddress);
};

//Primitives
BluetoothModel.prototype.connect = function(watchType, targetAddress) {
	this.lastConnect = (new Date()).getTime();
	this.connectBTDevice = new Mojo.Service.Request(this.urlspp, {
		method: 'connect',
		parameters: { "address": targetAddress },
		onSuccess: function (e) {
			logger("connect success, results="+JSON.stringify(e));
		}.bind(this),
		onFailure: function (e){
			logger("connect failure, results="+JSON.stringify(e));
		}.bind(this)
	});
};

BluetoothModel.prototype.open = function(urlService, watchType, instanceId, targetAddress) {
	if (!this.openspp) {
		logger("open service " + urlService + " for instance " + instanceId);
		new Mojo.Service.Request(urlService, {
			method: 'open',
			parameters: {"instanceId": instanceId},
			onSuccess: function (e) {
				logger("Open success");
				this.firstWrite = true;
				this.openspp = true;
				if (this.initOpen) {
					this.initOpen = false;
				}
				if (watchType == "MW150") {
					// deal with MW150
					bluetoothModel.read(watchType, instanceId, targetAddress);
				} else if (watchType == "Pebble") {
					//this.read();
					var msg = CreatePebbleVersion();
					bluetoothModel.write(msg, msg.length, watchType, instanceId, targetAddress);
					bluetoothModel.writeData(watchType, instanceId, targetAddress);
				} else if (watchType == "LiveView") {
					// deal with LiveView: send MSG_GETCAPS
					var msg = CreateLVMsg(MSG_GETCAPS, ConvertString("0.0.6"));
					bluetoothModel.write(msg, msg.length, watchType, instanceId, targetAddress);
				}
			}.bind(this),
			onFailure: function (e) {
				logger("Open failure " + Object.toJSON(e) + ": " + JSON.stringify(e.exception));
			}.bind(this)
		});
	}
};

BluetoothModel.prototype.write = function(data, length, watchType, instanceId, targetAddress) {
	var now = (new Date()).getTime();
	logger("write " + this.sendArray.length + " for instance: " + instanceId + " target: " + targetAddress + " (now - this.lastWrite) " + (now - this.lastWrite));
	this.sendArray.push({data: data, length: length});
	if ((this.sendArray.length == 1) || ((now - this.lastWrite) >= 5000)) {
		this.writeData(watchType, instanceId, targetAddress);
	}
	logger("write initOpen:" + this.initOpen + " openspp:" + this.openspp + " (now - this.lastConnect) " + (now - this.lastConnect));
	if (!this.initOpen && !this.openspp/* && ((now - this.lastConnect) >= 5000)*/) {
		logger("connect2");
		this.connect(watchType, targetAddress);
	}
};

BluetoothModel.prototype.writeData = function(watchType, instanceId, targetAddress) {
	if (this.openspp) {
		logger("SPP is Open, writing data: " + this.sendArray.length + " id " + instanceId);
		this.lastWrite = (new Date()).getTime();
		logger("set lastwrite " + this.lastWrite);
		if (timeoutValue > 0) {
			Mojo.Log.error("writeData will timeout in " + timeoutValue + " seconds");
            clearTimeout(gblTimeOutHdl);
			gblTimeOutHdl = setTimeout(bluetoothModel.closeConnection(watchType, instanceId, targetAddress), timeoutValue * 1000);
		}
		if (this.sendArray.length > 0) {
			var value = this.sendArray[0];
			logger("writeData using " + Object.toJSON(value));
			this.writeRequest = new Mojo.Service.Request(this.urlservice, {
				method: 'write',
				parameters: {
							  "instanceId" : instanceId,
							  "data"       : value.data,
                              "dataLength" : value.length,
                              "targetAddress" : targetAddress },
				onSuccess: function (e, options) {
                    var parameters = JSON.parse(options["parameters"]);
                    var instanceId = parameters.instanceId;
                    var targetAddress = parameters.targetAddress;
                    Mojo.Log.error("instanceid is: " + instanceId);
                    logger("write success with " + JSON.stringify(e) + " and instanceId " + instanceId);
                    this.sendArray.shift();
                    logger("first write is " + this.firstWrite);
					if (this.firstWrite) {
						this.firstWrite = false;
                    }
					if (this.sendArray.length > 0) {
                        logger("writing more data for " + instanceId + " address " + targetAddress);
						this.writeData(watchType, instanceId, targetAddress);
					} else {
                        logger("reading data for instance: " + instanceId);
						this.read(watchType, instanceId, targetAddress);
					}
				}.bind(this),
				onFailure: function (e, options) {
                    logger("failure options were: " + JSON.stringify(options))
                    var parameters = JSON.parse(options["parameters"]);
                    var instanceId = parameters.instanceId;
                    var targetAddress = parameters.targetAddress;
					logger("write failure with " + JSON.stringify(e) + " and instanceId " + instanceId);
					logger("exception: " + JSON.stringify(e.exception));
					if (e.errorCode && (e.errorCode == "NO_DATA_CHANNEL")) {
						this.close(watchType, instanceId, targetAddress);
						logger("closed instanceId: " + instanceId + " for target address: " + targetAddress);
						this.connect(watchType, targetAddress);
					} else {
                        logger("did not close instanceId: " + instanceId);
						this.read(watchType, instanceId, targetAddress);
					}
				}.bind(this)
			});
		} else {
			this.read(watchType, instanceId, targetAddress);
		}
	}
};

BluetoothModel.prototype.read = function(watchType, instanceId, targetAddress) {
	if (!this.InRead) {
		this.InRead = true;
		this.readRequest = new Mojo.Service.Request(this.urlservice, {
			method: 'read',
			parameters: {
                "instanceId": instanceId,
                "targetAddress": targetAddress,
				"dataLength": 256
			},
			onSuccess: function (e, options) {
                var parameters = JSON.parse(options["parameters"]);
                var instanceId = parameters.instanceId;
                var targetAddress = parameters.targetAddress;
                logger("Read success for instance " + instanceId + ": " + Object.toJSON(e), logger);
                bluetoothModel.readPortSuccess(e, watchType, instanceId, targetAddress)
            },
			onFailure: function (e) {
				this.InRead = false;
				if (watchType != "Pebble") {
					notifier("Read failure. " + Object.toJSON(e), logger);
				}
				/*
				if (watchType == "Pebble") {
					if (this.openspp) {
						this.close();
						setTimeout(this.open.bind(this), 10000);
					} else {
						logger("open4");
						this.open();
					}
				}
				*/
				// stop polling read
				//setTimeout(this.read.bind(this), 10000);
				/*
				//TODO: If this is used the timeout handler needs to pass watchType, instance, and target
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

BluetoothModel.prototype.readPortSuccess = function(objData, watchType, instanceId, targetAddress) {
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
					notifier("Connected", logger);
					bluetoothModel.sendInfo("Connected to " + Mojo.Environment.DeviceInfo.modelName, false, "", "", "de.metaviewsoft.mwatch", false, watchType, instanceId, targetAddress)
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
						notifier("Set volume 1 to " + this.volume1, logger);
					} else if (data.charAt(9) == "2") {
						this.volume2 = parseInt(data.substr(11));
						notifier("Set volume 2 to " + this.volume2, logger);
					} else if (data.charAt(9) == "3") {
						this.volume3 = parseInt(data.substr(11));
						notifier("Set volume 3 to " + this.volume3, logger);
					}
					reply = "\r\nOK\r\n";
				} else if (data.search(/ATE0/) == 0) {
					reply = "\r\nOK\r\n";
				} else if (data.search(/AT\*SETBC=/) == 0) {
					//AT*SETBC= <bmp_width>, <bmp_height>, <quality>, <string>
					if (this.toSendEntry != null) {
						var entry = this.toSendEntry;
						logger(entry.icon);
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
							logger(arrText.length);
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
									reply += Dec2Hex((line[x+0]?128:0) + (line[x+1]?64:0) + (line[x+2]?32:0) + (line[x+3]?16:0) + (line[x+4]?8:0) + (line[x+5]?4:0) + (line[x+6]?2:0) + (line[x+7]?1:0));
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
										reply += Dec2Hex(
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
							setTimeout(bluetoothModel.sendText(watchType, instanceId, targetAddress), 5 * 1000);
						}
					}
				} else if (data.search(/AT\+CCLK\?/) == 0) {
					var now = new Date();
					reply = "\r\n+CCLK: \"" + padString(now.getFullYear(), 4) + "/" + padString(now.getMonth()+1, 2) + "/" + padString(now.getDate(), 2) +
						"," + padString(now.getHours(), 2) + ":" + padString(now.getMinutes(), 2) + ":" + padString(now.getSeconds(), 2) + "+00\"\r\n\r\nOK\r\n";
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
						onSuccess: function() {logger("====> Hangup ok");},
						onFailure: function(err) {logger("====> Hangup error: " + Object.toJSON(err));}
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
					logger("read id: " + id + " name: " + name + " len: " + length);
					if (id == PEBBLE_PHONE_VERSION) {
						//                                                       |        -1            |      session          | android, telephony, sms | response version
						//reply = CreatePebbleMsg(PEBBLE_PHONE_VERSION, [0x01, 0xff, 0xff, 0xff, 0xff, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x32, 0x02, 0x02, 0x00, 0x00]);
						reply = CreatePebblePhoneVersion30();
					} else if (id == PEBBLE_VERSIONS) {
						this.version = 2;
						logger("Version: " + data[9] + data[10] + data[11] + data[12] + data[13] + data[14] + data[15]);
						var hwRevisions = ["spalding_bb2", "snowy_bb2", "snowy_bb", "bb2", "bb", // emulators
											"unknown",
											"ev1", "ev2", "ev2_3", "ev2_4", "v1_5", "v2_0", // Pebble
											"snowy_evt2", "snowy_dvt", "spalding_dvt", "snowy_s3", "spalding"]; // Pebble Time
						if ((data.charCodeAt(9) == 51) || (data.charCodeAt(10) == 51)) {
							logger("Pebble OS Version 3 found.");
							this.version = 3;
						}
						var version = data.charCodeAt(50) + 5;
						if ((version > 0) && (version < hwRevisions.length)) {
							logger("HW Revision " + hwRevisions[version] + " (" + version + ")");
						} else {
							logger("HW Revision unknwon (" + version + ")");
						}
						//logger(data.charCodeAt(4) + " " + data.charCodeAt(5) + " " + data.charCodeAt(6) + " " + data.charCodeAt(7));
					//} else if (id == PEBBLE_TIME) {
						if (this.version == 3) {
							reply = CreatePebbleTime30();
                            //logger(this.CreatePebbleNotification30("Titel", "Subject"));
						} else {
							reply = CreatePebbleTime();
						}
					} else if (id == PEBBLE_MUSIC_CONTROL) {
						var action = data.charCodeAt(4);
						logger("MusicControl:" + action);
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
							reply = CreatePebbleMusicinfo(this.artist, this.album, this.track);
						} else {
						}
						this.lastMusicPhoneWrite = (new Date()).getTime();
					} else if (id == PEBBLE_PHONE_CONTROL) {
						var action = data.charCodeAt(4);
						logger("PhoneControl:" + action);
						if (action == 2) {
							Mojo.Controller.getAppController().showBanner("Hangup", "", "");
							new Mojo.Service.Request('palm://com.palm.applicationManager', {
								method: 'launch',
								parameters: {
									id: "com.palm.app.phone",
									params: {action:"reject", hangupAll:true}
								},
								onSuccess: function() {logger("====> Hangup ok");}.bind(this),
								onFailure: function(err) {logger("====> Hangup error: " + Object.toJSON(err));}.bind(this)
							});
						}
						this.lastMusicPhoneWrite = (new Date()).getTime();
					}
				}
			} else if (watchType == "LiveView") {
				// deal with LiveView: send MSG_ACK
				if (objData.dataLength > 0) {
					var id = data.charCodeAt(0);
					logger("read id: " + id);
					reply = [MSG_ACK, 0x04, 0x00, 0x00, 0x00, 0x01, id];
					if (id == MSG_GETCAPS_RESP) {
						this.write(reply, reply.length, watchType, instanceId, targetAddress);
						reply = [MSG_GETSWVERSION, 0x04, 0x00, 0x00, 0x00, 0x01, 0x00];
					} else if (id == MSG_GETSWVERSION_RESP) {
						this.write(reply, reply.length, watchType, instanceId, targetAddress);
						reply = [MSG_SETMENUSIZE, 0x04, 0x00, 0x00, 0x00, 0x01, 0x00];
						this.write(reply, reply.length, watchType, instanceId, targetAddress);
						reply = [MSG_CLEARDISPLAY, 0x04, 0x00, 0x00, 0x00, 0x00];
					} else if (id == MSG_NAVIGATION) {
						reply = [MSG_NAVIGATION_RESP, 0x04, 0x00, 0x00, 0x00, 0x01, 0x00];
					} else if (id == MSG_GETTIME) {
						this.write(reply, reply.length, watchType, instanceId, targetAddress);
						var date = new Date();
						var time = date.getTime() / 1000 - date.getTimezoneOffset() * 60;
						reply = [MSG_GETTIME_RESP, 0x04, 0x00, 0x00, 0x00, 0x05, (time >> 24) & 0xff, (time >> 16) & 0xff, (time >> 8) & 0xff, time & 0xff, 0x00];
					} else if (id == MSG_DEVICESTATUS) {
						this.write(reply, reply.length, watchType, instanceId, targetAddress);
						reply = [217, 0x04, 0x00, 0x00, 0x00, 0x00];
						this.write(reply, reply.length, watchType, instanceId, targetAddress);
						reply = [219, 0x04, 0x00, 0x00, 0x00, 0x01, data.charCodeAt(6)];
					} else if (id == MSG_GETMENUITEMS) {
						reply = [MSG_GETMENUITEM_RESP, 0x04, 0x00, 0x00, 0x00, 0x12, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, "A".charCodeAt(0), "B".charCodeAt(0), "C".charCodeAt(0)];
						reply[5] = reply[5] + image.length;
						reply = reply.concat(image);
						/*
						this.write(reply, reply.length, watchType, instanceId, targetAddress);
						reply[13] = 4;
						this.write(reply, reply.length, watchType, instanceId, targetAddress);
						reply[13] = 5;
						this.write(reply, reply.length, watchType, instanceId, targetAddress);
						reply[13] = 6;
						*/
					} else {
						logger("**** Unknown id ****", id);
					}
				}
			}
		}
	}
	if (reply.length > 0) {
		this.write(reply, reply.length, watchType, instanceId, targetAddress);
	} else {
		this.read(watchType, instanceId, targetAddress);
	}
};

BluetoothModel.prototype.close = function(watchType, instanceId, targetAddress) {
	if (this.openspp) {
		logger("close " + this.urlservice + " " + instanceId);
		new Mojo.Service.Request(this.urlservice, {
			method: 'close',
			parameters: {"instanceId": instanceId},
			onSuccess: function (e) {
				logger("Close success");
			}.bind(this),
			onFailure: function (e) {
				logger("Close failure " + Object.toJSON(e));
			}.bind(this)
		});
		logger("disconnect " + this.urlspp + " " + targetAddress);
		this.connectBTDevice = new Mojo.Service.Request(this.urlspp, {
			method: 'disconnect',
			parameters: {
				"address": targetAddress
			},
			onSuccess : function (e){
				logger("disconnect success, results="+JSON.stringify(e));
			}.bind(this),
			onFailure : function (e){
				logger("disconnect failure, results="+JSON.stringify(e));
			}.bind(this)
		});
		this.openspp = false;
		logger("this.openspp " + this.openspp);
	}
};

BluetoothModel.prototype.closeConnection = function(watchType, instanceId, targetAddress) {
	var now = (new Date()).getTime();
	if (timeoutValue > 0) {
		if (((now - this.lastWrite) >= (timeoutValue * 1000)) &&
			((now - this.lastMusicPhoneWrite) >= (timeoutMusicPhoneValue * 1000))) {
			// close connection after 10 seconds inactivity
			logger("closing BT connection now. " + now + " " + this.lastWrite	+ " " + this.lastMusicPhoneWrite);
			this.close(watchType, instanceId, targetAddress);
		} else {
			// retry later
			logger("closing BT connection later. " + timeoutValue * 1000 + " " + this.lastWrite	+ " " + this.lastMusicPhoneWrite);
            clearTimeout(gblTimeOutHdl);
			gblTimeOutHdl = setTimeout(bluetoothModel.closeConnection(watchType, instanceId, targetAddress), timeoutValue * 1000);
		}
	}
};