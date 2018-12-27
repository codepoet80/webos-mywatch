var appIds;
var PebbleModel = function(appMap) {
	appIds = appMap;
}

PebbleModel.prototype.CreatePebblePing = function() {
	var id = this.PebbleCommands["PEBBLE_PING"];
	var result = [];
	result.push(0, 0x05);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(0x00, 0xDE, 0xAD, 0xC0, 0xDE);
	return result;
};

PebbleModel.prototype.CreatePebbleVersion = function() {
	var id = this.PebbleCommands["PEBBLE_VERSIONS"];
	var result = [];
	result.push(0, 0x01);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(0x00);
	return result;
};

PebbleModel.prototype.CreatePebbleTime = function() {
	var id = this.PebbleCommands["PEBBLE_TIME"];
	var date = new Date();
	var time = date.getTime() / 1000 - date.getTimezoneOffset() * 60;
	var result = [];
	result.push(0, 0x05);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(0x02);
	result.push((time >> 24) & 0xff, (time >> 16) & 0xff, (time >> 8) & 0xff, time & 0xff);
	return result;
};

PebbleModel.prototype.CreatePebbleTime30 = function() {
	var id = this.PebbleCommands["PEBBLE_TIME"];
	var date = new Date();
	var time = date.getTime() / 1000;
	var offset = -(date.getTimezoneOffset());
	var tz_name = "offset" + offset;
	var length = 8 + tz_name.length;
	var result = [];
	result.push((length >> 8) & 0xff, length & 0xff);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(0x03);
	result.push((time >> 24) & 0xff, (time >> 16) & 0xff, (time >> 8) & 0xff, time & 0xff);
	result.push((offset >> 8) & 0xff, offset & 0xff);
	result.push(tz_name.length);
	for (var i=0; i<tz_name.length; i++) {
		result.push(tz_name.charCodeAt(i));
	}
	return result;
};

PebbleModel.prototype.CreatePebblePhoneVersion30 = function() {
	var id = this.PebbleCommands["PEBBLE_PHONE_VERSION"];
	var result = [];
	result.push(0x01);
	result.push(0xff, 0xff, 0xff, 0xff); // -1
	result.push(0x00, 0x00, 0x00, 0x00);
	result.push(0x00, 0x00, 0x00, 0x02); // os?
	result.push(0x02, 0x03, 0x08, 0x01);
	result.push(0xaf, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
	return this.CreatePebbleMsg(id, result);
};

PebbleModel.prototype.CreatePebbleHangup = function() {
	var length = 1 + 4;
	var id = this.PebbleCommands["PEBBLE_PHONE_CONTROL"];
	var result = [];
	result.push((length >> 8) & 0xff, length & 0xff);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(2); // hangup
	result.push(0xb1, 0x63, 0xf0, 0xf2); // cookie
	return result;
};

PebbleModel.prototype.CreatePebbleRinger = function() {
	var length = 1 + 4;
	var id = this.PebbleCommands["PEBBLE_PHONE_CONTROL"];
	var result = [];
	result.push((length >> 8) & 0xff, length & 0xff);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(7); // ring
	result.push(0xb1, 0x63, 0xf0, 0xf2); // cookie
	return result;
};

PebbleModel.prototype.CreatePebbleRingEnd = function() {
	var length = 1 + 4;
	var id = this.PebbleCommands["PEBBLE_PHONE_CONTROL"];
	var result = [];
	result.push((length >> 8) & 0xff, length & 0xff);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(9); // end
	result.push(0xb1, 0x63, 0xf0, 0xf2); // cookie
	return result;
};

PebbleModel.prototype.CreatePebblePhoneinfo = function(caller, number) {
	// utf16->utf8 and not more than 255 chars
	caller = this.TruncateString(unescape(encodeURIComponent(caller)), 255);
	number = this.TruncateString(unescape(encodeURIComponent(number)), 255);
	var length = 1 + 4 + number.length + 1 + caller.length + 1;
	var id = this.PebbleCommands["PEBBLE_PHONE_CONTROL"];
	var result = [];
	result.push((length >> 8) & 0xff, length & 0xff);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(4); // incoming call
	result.push(0xb1, 0x63, 0xf0, 0xf2); // cookie
	result.push(number.length);
	for (var i=0; i<number.length; i++) {
		result.push(number.charCodeAt(i));
	}
	result.push(caller.length);
	for (var i=0; i<caller.length; i++) {
		result.push(caller.charCodeAt(i));
	}

	var debug = "";
	for (var i=0; i<result.length; i++) {
		debug += result[i].toString(16) + " ";
	}
	//this.logInfo(debug);

	this.lastMusicPhoneWrite = (new Date()).getTime();
	return result;
};

PebbleModel.prototype.CreatePebbleMusicinfo = function(artist, album, track) {
	// utf16->utf8 and not more than 255 chars
	this.artist = artist;
	this.album = album;
	this.track = track;
	artist = this.TruncateString(unescape(encodeURIComponent(artist)), 255);
	album = this.TruncateString(unescape(encodeURIComponent(album)), 255);
	track = this.TruncateString(unescape(encodeURIComponent(track)), 255);
	var length = 1 + artist.length + 1 + album.length + 1 + track.length + 1;
	var id = this.PebbleCommands["PEBBLE_MUSIC_CONTROL"];
	var result = [];
	result.push((length >> 8) & 0xff, length & 0xff);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(16); // now playing
	result.push(artist.length);
	for (var i=0; i<artist.length; i++) {
		result.push(artist.charCodeAt(i));
	}
	result.push(album.length);
	for (var i=0; i<album.length; i++) {
		result.push(album.charCodeAt(i));
	}
	result.push(track.length);
	for (var i=0; i<track.length; i++) {
		result.push(track.charCodeAt(i));
	}
	this.lastMusicPhoneWrite = (new Date()).getTime();
	return result;
};

PebbleModel.prototype.CreatePebbleNotification = function(from, info) {
	// utf16->utf8 and not more than 255 chars
	from = this.TruncateString(unescape(encodeURIComponent(from)), 255);
	info = this.TruncateString(unescape(encodeURIComponent(info)), 255);
	var length = 1 + from.length + 1 + info.length + 1 + 13 + 1;
	var id = this.PebbleCommands["PEBBLE_NOTIFICATION"];
	var result = [];
	result.push((length >> 8) & 0xff, length & 0xff);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(1); // notification
	result.push(from.length);
	for (var i=0; i<from.length; i++) {
		result.push(from.charCodeAt(i));
	}
	result.push(info.length);
	for (var i=0; i<info.length; i++) {
		result.push(info.charCodeAt(i));
	}
	result.push(13);
	result.push(0x31, 0x34, 0x32, 0x30, 0x35, 0x37, 0x34, 0x31, 0x30, 0x30, 0x30, 0x30, 0x30);
	return result;
};

PebbleModel.prototype.CreatePebbleNotification30 = function(from, info, appid) {
	// utf16->utf8 and not more than 255 chars
	from = this.TruncateString(unescape(encodeURIComponent(from)), 255);
	info = this.TruncateString(unescape(encodeURIComponent(info)), 255);
	// pin:
	// 8 byte: UUID
	// 8 byte: UUID
	// 4 byte: timestamp
	// 2 byte: duration (0x00)
	// 1 byte: 0x01
	// 2 byte: flag (0x0001)
	// 1 byte: notification (0x04)
	// 2 byte: total length of all attributes and actions in bytes
	// 1 byte: attributes count
	// 1 byte: actions count
	// [title, subtitle, body]
	//   1 byte: idx
	//   2 byte: length
	//   x byte: string
	// 1 byte: icon (0x04)
	// 2 byte: length of int (0x04)
	// 4 byte: id (0x80000000 | icon_id)
	// 1 byte: backcolor (0x1C)
	// 2 byte: length of byte (0x01)
	// 1 byte: color_id
	// 1 byte: dismiss_action_id
	// 1 byte: 0x02
	// 1 byte: 0x01
	// 1 byte: 0x01
	// 2 byte: length
	// x byte: string
	var uuid = this.genID();
	var icon_id = this.PebbleIcons["ICON_NOTIFICATION_GENERIC"];
	var color_id = 0xcc;
	var timestamp = (new Date()).getTime() / 1000;
	var NOTIFICATION_PIN_LENGTH = 46;
	var ACTION_LENGTH_MIN = 10;
	var actions_count = 1;
	var dismiss_string = "Dismiss all";
	var dismiss_action_id = 0x03;
	var actions_length = ACTION_LENGTH_MIN * actions_count + dismiss_string.length;
	var attributes_count = 2; // icon
	var attributes_length = 11 + actions_length;
	if (from.length > 0) {
		attributes_count++;
		attributes_length += (3 + from.length);
	}
	if (info.length > 0) {
		attributes_count++;
		attributes_length += (3 + info.length);
	}
	Mojo.Log.error("*** HERE ***");
	icon_id = appIds[appid].icon;

	var pin_length = NOTIFICATION_PIN_LENGTH + attributes_length;
	var pin = [];
	pin.push((uuid[0] >> 24) & 0xff, (uuid[0] >> 16) & 0xff, (uuid[0] >> 8) & 0xff, uuid[0] & 0xff,
		(uuid[1] >> 24) & 0xff, (uuid[1] >> 16) & 0xff, (uuid[1] >> 8) & 0xff, uuid[1] & 0xff,
		(uuid[2] >> 24) & 0xff, (uuid[2] >> 16) & 0xff, (uuid[2] >> 8) & 0xff, uuid[2] & 0xff,
		(uuid[3] >> 24) & 0xff, (uuid[3] >> 16) & 0xff, (uuid[3] >> 8) & 0xff, uuid[3] & 0xff); // UUID
	pin.push((uuid[0] >> 24) & 0xff, (uuid[0] >> 16) & 0xff, (uuid[0] >> 8) & 0xff, uuid[0] & 0xff,
		(uuid[1] >> 24) & 0xff, (uuid[1] >> 16) & 0xff, (uuid[1] >> 8) & 0xff, uuid[1] & 0xff,
		(uuid[2] >> 24) & 0xff, (uuid[2] >> 16) & 0xff, (uuid[2] >> 8) & 0xff, uuid[2] & 0xff,
		(uuid[3] >> 24) & 0xff, (uuid[3] >> 16) & 0xff, (uuid[3] >> 8) & 0xff, uuid[3] & 0xff); // UUID
	pin.push(timestamp & 0xff, (timestamp >> 8) & 0xff, (timestamp >> 16) & 0xff, (timestamp >> 24) & 0xff);
	pin.push(0x00, 0x00); // duration
	pin.push(0x01); // notification
	pin.push(0x01, 0x00); // flags
	pin.push(0x04); // layout
	pin.push(attributes_length & 0xff, (attributes_length >> 8) & 0xff);
	pin.push(attributes_count);
	pin.push(actions_count);
	if (from.length > 0) {
		pin.push(0x01); // idx
		pin.push(from.length & 0xff, (from.length >> 8) & 0xff);
		for (var i=0; i<from.length; i++) {
			pin.push(from.charCodeAt(i));
		}
	}
	if (info.length > 0) {
		pin.push(0x03); // idx
		pin.push(info.length & 0xff, (info.length >> 8) & 0xff);
		for (var i=0; i<info.length; i++) {
			pin.push(info.charCodeAt(i));
		}
	}
	pin.push(0x04); // icon
	pin.push(0x04, 0x00); // length of int
	icon_id = 0x80000000 | this.PebbleIcons[icon_id];
	pin.push(icon_id & 0xff, (icon_id >> 8) & 0xff, (icon_id >> 16) & 0xff, (icon_id >> 24) & 0xff);
	pin.push(0x1c); // background color
	pin.push(0x01, 0x00); // length of byte
	pin.push(color_id);
	// dismiss action
	pin.push(dismiss_action_id);
	pin.push(0x02); // generic action, dismiss did not do anything
	pin.push(0x01); // number attributes
	pin.push(0x01); // attribute id (title)
	pin.push(dismiss_string.length & 0xff, (dismiss_string.length >> 8) & 0xff);
	for (var i=0; i<dismiss_string.length; i++) {
		pin.push(dismiss_string.charCodeAt(i));
	}

	// 2 byte: length // big endian
	// 2 byte: PEBBLE_BLOBDB // big endian
	// 1 byte: command?  BLOBDB_INSERT // static final byte BLOBDB_INSERT = 1;
	// 2 byte: random
	// 1 byte: db?       BLOBDB_NOTIFICATION // static final byte BLOBDB_NOTIFICATION = 4;
	// 1 byte: length uuid (0x10)
	// 16 byte: uuid
	// 2 byte: length of pin
	// pin
	var LENGTH_BLOBDB = 21;
	var length = LENGTH_BLOBDB + 2 + pin.length + 4;
	var BLOBDB_INSERT = 1;
	var BLOBDB_NOTIFICATION = 4;
	var rand = Math.random() * 0xffff;
	var uuid = this.genID();
	var result = [];
	result.push((length >> 8) & 0xff, length & 0xff);
	result.push((this.PebbleCommands["PEBBLE_BLOBDB"] >> 8) & 0xff, this.PebbleCommands["PEBBLE_BLOBDB"] & 0xff);
	result.push(BLOBDB_INSERT);
	result.push((rand >> 8) & 0xff, rand & 0xff);
	result.push(BLOBDB_NOTIFICATION);
	result.push(0x10); // length UUID
	result.push((uuid[0] >> 24) & 0xff, (uuid[0] >> 16) & 0xff, (uuid[0] >> 8) & 0xff, uuid[0] & 0xff,
		(uuid[1] >> 24) & 0xff, (uuid[1] >> 16) & 0xff, (uuid[1] >> 8) & 0xff, uuid[1] & 0xff,
		(uuid[2] >> 24) & 0xff, (uuid[2] >> 16) & 0xff, (uuid[2] >> 8) & 0xff, uuid[2] & 0xff,
		(uuid[3] >> 24) & 0xff, (uuid[3] >> 16) & 0xff, (uuid[3] >> 8) & 0xff, uuid[3] & 0xff); // UUID
	length = pin.length + 4;
	result.push(length & 0xff, (length >> 8) & 0xff);
	for (var i=0; i<pin.length; i++) {
		result.push(pin[i]);
	}
	result.push(0x00, 0x00, 0x00, 0x00);
/*
	var debug = "";
	for (var i=0; i<result.length; i++) {
		debug += result[i].toString(16) + " ";
	}
	this.logInfo(debug);
*/
	return result;
};

PebbleModel.prototype.CreatePebbleMsg = function(id, payload) {
	var result = [];
	result.push((payload.length >> 8) & 0xff, payload.length & 0xff);
	result.push((id >> 8) & 0xff, id & 0xff);
	for (var i=0; i<payload.length; i++) {
		result.push(payload[i]);
	}
	return result;
};

//Pebble common definitions
// Pebble data notes:
	// BigEndian
	// Binary
	// 2 byte payload length
	// 2 byte id
	// payload
// https://github.com/Freeyourgadget/Gadgetbridge/blob/master/app/src/main/java/nodomain/freeyourgadget/gadgetbridge/service/devices/pebble/PebbleProtocol.java
PebbleModel.prototype.PebbleCommands = {
	PEBBLE_FIRMWARE: 1,
	PEBBLE_TIME: 11,
	PEBBLE_VERSIONS: 16,
	PEBBLE_PHONE_VERSION: 17,
	PEBBLE_SYSTEM_MESSAGE: 18,
	PEBBLE_MUSIC_CONTROL: 32,
	PEBBLE_PHONE_CONTROL: 33,
	PEBBLE_APP_MSG: 48,
	PEBBLE_LAUNCHER: 49,
	PEBBLE_APP_CUSTOMIZE: 50,
	PEBBLE_LOGS: 2000,
	PEBBLE_PING: 2001,
	PEBBLE_DRAW: 2002,
	PEBBLE_RESET: 2003,
	PEBBLE_APP_MFG: 2004,
	PEBBLE_APP_LOGS: 2006,
	PEBBLE_NOTIFICATION: 3000,
	PEBBLE_RESOURCE: 4000,
	PEBBLE_SYS_REG: 5000,
	PEBBLE_FCT_REG: 5001,
	PEBBLE_APP_INSTALL_MGR: 6000,
	PEBBLE_APP_INSTALL_MANAGER: 6000,
	PEBBLE_DATA_LOG: 6778,
	PEBBLE_RUNKEEPER: 7000,
	PEBBLE_SCREENSHOT: 8000,
	PEBBLE_COREDUMP: 9000,
	PEBBLE_NOTIFICATION_30: 11440,
	PEBBLE_BLOBDB: 45531,
	PEBBLE_PUT_BYTES: 48879,
};

PebbleModel.prototype.PebbleColors = {
	"Black" : "0b11000000",
	"OxfordBlue" : "0b11000001",
	"DukeBlue" : "0b11000010",
	"Blue" : "0b11000011",
	"DarkGreen" : "0b11000100",
	"MidnightGreen" : "0b11000101",
	"CobaltBlue" : "0b11000110",
	"BlueMoon" : "0b11000111",
	"IslamicGreen" : "0b11001000",
	"JaegerGreen" : "0b11001001",
	"TiffanyBlue" : "0b11001010",
	"VividCerulean" : "0b11001011",
	"Green" : "0b11001100",
	"Malachite" : "0b11001101",
	"MediumSpringGreen" : "0b11001110",
	"Cyan" : "0b11001111",
	"BulgarianRose" : "0b11010000",
	"ImperialPurple" : "0b11010001",
	"Indigo" : "0b11010010",
	"ElectricUltramarine" : "0b11010011",
	"ArmyGreen" : "0b11010100",
	"DarkGray" : "0b11010101",
	"Liberty" : "0b11010110",
	"VeryLightBlue" : "0b11010111",
	"KellyGreen" : "0b11011000",
	"MayGreen" : "0b11011001",
	"CadetBlue" : "0b11011010",
	"PictonBlue" : "0b11011011",
	"BrightGreen" : "0b11011100",
	"ScreaminGreen" : "0b11011101",
	"MediumAquamarine" : "0b11011110",
	"ElectricBlue" : "0b11011111",
	"DarkCandyAppleRed" : "0b11100000",
	"JazzberryJam" : "0b11100001",
	"Purple" : "0b11100010",
	"VividViolet" : "0b11100011",
	"WindsorTan" : "0b11100100",
	"RoseVale" : "0b11100101",
	"Purpureus" : "0b11100110",
	"LavenderIndigo" : "0b11100111",
	"Limerick" : "0b11101000",
	"Brass" : "0b11101001",
	"LightGray" : "0b11101010",
	"BabyBlueEyes" : "0b11101011",
	"SpringBud" : "0b11101100",
	"Inchworm" : "0b11101101",
	"MintGreen" : "0b11101110",
	"Celeste" : "0b11101111",
	"Red" : "0b11110000",
	"Folly" : "0b11110001",
	"FashionMagenta" : "0b11110010",
	"Magenta" : "0b11110011",
	"Orange" : "0b11110100",
	"SunsetOrange" : "0b11110101",
	"BrilliantRose" : "0b11110110",
	"ShockingPink" : "0b11110111",
	"ChromeYellow" : "0b11111000",
	"Rajah" : "0b11111001",
	"Melon" : "0b11111010",
	"RichBrilliantLavender" : "0b11111011",
	"Yellow" : "0b11111100",
	"Icterine" : "0b11111101",
	"PastelYellow" : "0b11111110",
	"White" : "0b11111111",
	"Clear" : "0b00000000"
}

PebbleModel.prototype.PebbleIcons = {
	"ICON_NOTIFICATION_GENERIC" : 1,
	"ICON_TIMELINE_MISSED_CALL" : 2,
	"ICON_NOTIFICATION_REMINDER" : 3,
	"ICON_NOTIFICATION_FLAG" : 4,
	"ICON_NOTIFICATION_WHATSAPP" : 5,
	"ICON_NOTIFICATION_TWITTER" : 6,
	"ICON_NOTIFICATION_TELEGRAM" : 7,
	"ICON_NOTIFICATION_GOOGLE_HANGOUTS" : 8,
	"ICON_NOTIFICATION_GMAIL" : 9,
	"ICON_NOTIFICATION_FACEBOOK_MESSENGER" : 10,
	"ICON_NOTIFICATION_FACEBOOK" : 11,
	"ICON_AUDIO_CASSETTE" : 12,
	"ICON_ALARM_CLOCK" : 13,
	"ICON_TIMELINE_WEATHER" : 14,
	"ICON_TIMELINE_SUN" : 16,
	"ICON_TIMELINE_SPORTS" : 17,
	"ICON_GENERIC_EMAIL" : 19,
	"ICON_AMERICAN_FOOTBALL" : 20,
	"ICON_TIMELINE_CALENDAR" : 21,
	"ICON_TIMELINE_BASEBALL" : 22,
	"ICON_BIRTHDAY_EVENT" : 23,
	"ICON_CAR_RENTAL" : 24,
	"ICON_CLOUDY_DAY" : 25,
	"ICON_CRICKET_GAME" : 26,
	"ICON_DINNER_RESERVATION" : 27,
	"ICON_GENERIC_WARNING" : 28,
	"ICON_GLUCOSE_MONITOR" : 29,
	"ICON_HOCKEY_GAME" : 30,
	"ICON_HOTEL_RESERVATION" : 31,
	"ICON_LIGHT_RAIN" : 32,
	"ICON_LIGHT_SNOW" : 33,
	"ICON_MOVIE_EVENT" : 34,
	"ICON_MUSIC_EVENT" : 35,
	"ICON_NEWS_EVENT" : 36,
	"ICON_PARTLY_CLOUDY" : 37,
	"ICON_PAY_BILL" : 38,
	"ICON_RADIO_SHOW" : 39,
	"ICON_SCHEDULED_EVENT" : 40,
	"ICON_SOCCER_GAME" : 41,
	"ICON_STOCKS_EVENT" : 42,
	"ICON_RESULT_DELETED" : 43,
	"ICON_CHECK_INTERNET_CONNECTION" : 44,
	"ICON_GENERIC_SMS" : 45,
	"ICON_RESULT_MUTE" : 46,
	"ICON_RESULT_SENT" : 47,
	"ICON_WATCH_DISCONNECTED" : 48,
	"ICON_DURING_PHONE_CALL" : 49,
	"ICON_TIDE_IS_HIGH" : 50,
	"ICON_RESULT_DISMISSED" : 51,
	"ICON_HEAVY_RAIN" : 52,
	"ICON_HEAVY_SNOW" : 53,
	"ICON_SCHEDULED_FLIGHT" : 54,
	"ICON_GENERIC_CONFIRMATION" : 55,
	"ICON_DAY_SEPARATOR" : 56,
	"ICON_NO_EVENTS" : 57,
	"ICON_NOTIFICATION_BLACKBERRY_MESSENGER" : 58,
	"ICON_NOTIFICATION_INSTAGRAM" : 59,
	"ICON_NOTIFICATION_MAILBOX" : 60,
	"ICON_NOTIFICATION_GOOGLE_INBOX" : 61,
	"ICON_RESULT_FAILED" : 62,
	"ICON_GENERIC_QUESTION" : 63,
	"ICON_NOTIFICATION_OUTLOOK" : 64,
	"ICON_RAINING_AND_SNOWING" : 65,
	"ICON_REACHED_FITNESS_GOAL" : 66,
	"ICON_NOTIFICATION_LINE" : 67,
	"ICON_NOTIFICATION_SKYPE" : 68,
	"ICON_NOTIFICATION_SNAPCHAT" : 69,
	"ICON_NOTIFICATION_VIBER" : 70,
	"ICON_NOTIFICATION_WECHAT" : 71,
	"ICON_NOTIFICATION_YAHOO_MAIL" : 72,
	"ICON_TV_SHOW" : 73,
	"ICON_BASKETBALL" : 74,
	"ICON_DISMISSED_PHONE_CALL" : 75,
	"ICON_NOTIFICATION_GOOGLE_MESSENGER" : 76,
	"ICON_NOTIFICATION_HIPCHAT" : 77,
	"ICON_INCOMING_PHONE_CALL" : 78,
	"ICON_NOTIFICATION_KAKAOTALK" : 79,
	"ICON_NOTIFICATION_KIK" : 80,
	"ICON_NOTIFICATION_LIGHTHOUSE" : 81,
	"ICON_LOCATION" : 82,
	"ICON_SETTINGS" : 83,
	"ICON_SUNRISE" : 84,
	"ICON_SUNSET" : 85,
	"ICON_FACETIME_DISMISSED" : 86,
	"ICON_FACETIME_INCOMING" : 87,
	"ICON_FACETIME_OUTGOING" : 88,
	"ICON_FACETIME_MISSED" : 89,
	"ICON_FACETIME_DURING" : 90,
	"ICON_BLUESCREEN_OF_DEATH" : 91,
	"ICON_START_MUSIC_PHONE" : 92
}

//Helper methods
PebbleModel.prototype.TruncateString = function(string, length) {
	if (string.length > length) {
		string = string.substr(0, length-3) + "...";
	}
	return string;
};

PebbleModel.prototype.genID = function() {
	var time = (new Date()).getTime();
	var a = (time << 16) | Math.floor(Math.random() * 0x10000);
	var b = (Math.floor(Math.random() * 0x10000) << 16) | Math.floor(Math.random() * 0x10000);
	var c = (Math.floor(Math.random() * 0x10000) << 16) | Math.floor(Math.random() * 0x10000);
	var d = (Math.floor(Math.random() * 0x10000) << 16) | Math.floor(Math.random() * 0x10000);
	return [a,b,c,d];
}