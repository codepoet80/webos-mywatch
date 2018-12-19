// Pebble:
// BigEndian
// Binary
// 2 byte payload length
// 2 byte id
// payload
PEBBLE_FIRMWARE			= 1;
PEBBLE_TIME				= 11;
PEBBLE_VERSIONS			= 16;
PEBBLE_PHONE_VERSION	= 17;
PEBBLE_SYSTEM_MESSAGE	= 18;
PEBBLE_MUSIC_CONTROL	= 32;
PEBBLE_PHONE_CONTROL	= 33;
PEBBLE_APP_MSG			= 48;
PEBBLE_LAUNCHER			= 49;
PEBBLE_APP_CUSTOMIZE	= 50;
PEBBLE_LOGS				= 2000;
PEBBLE_PING				= 2001;
PEBBLE_DRAW				= 2002;
PEBBLE_RESET			= 2003;
PEBBLE_APP_MFG			= 2004;
PEBBLE_APP_LOGS			= 2006;
PEBBLE_NOTIFICATION		= 3000;
PEBBLE_RESOURCE			= 4000;
PEBBLE_SYS_REG			= 5000;
PEBBLE_FCT_REG			= 5001
PEBBLE_APP_INSTALL_MGR	= 6000;
PEBBLE_DATA_LOG			= 6778
PEBBLE_RUNKEEPER		= 7000;
PEBBLE_SCREENSHOT		= 8000;
PEBBLE_COREDUMP			= 9000;
PEBBLE_NOTIFICATION_30	= 11440;
PEBBLE_BLOBDB			= 45531;
PEBBLE_PUT_BYTES		= 48879;

var pebble_cmds = [
	{cmd: PEBBLE_FIRMWARE, name: "PEBBLE_FIRMWARE"},
	{cmd: PEBBLE_TIME, name: "PEBBLE_TIME"},
	{cmd: PEBBLE_VERSIONS, name: "PEBBLE_VERSIONS"},
	{cmd: PEBBLE_PHONE_VERSION, name: "PEBBLE_PHONE_VERSION"},
	{cmd: PEBBLE_SYSTEM_MESSAGE, name: "PEBBLE_SYSTEM_MESSAGE"},
	{cmd: PEBBLE_MUSIC_CONTROL, name: "PEBBLE_MUSIC_CONTROL"},
	{cmd: PEBBLE_PHONE_CONTROL, name: "PEBBLE_PHONE_CONTROL"},
	{cmd: PEBBLE_APP_MSG, name: "PEBBLE_APP_MSG"},
	{cmd: PEBBLE_LAUNCHER, name: "PEBBLE_LAUNCHER"},
	{cmd: PEBBLE_APP_CUSTOMIZE, name: "PEBBLE_APP_CUSTOMIZE"},
	{cmd: PEBBLE_LOGS, name: "PEBBLE_LOGS"},
	{cmd: PEBBLE_PING, name: "PEBBLE_PING"},
	{cmd: PEBBLE_DRAW, name: "PEBBLE_DRAW"},
	{cmd: PEBBLE_RESET, name: "PEBBLE_RESET"},
	{cmd: PEBBLE_APP_MFG, name: "PEBBLE_APP_MFG"},
	{cmd: PEBBLE_APP_LOGS, name: "PEBBLE_APP_LOGS"},
	{cmd: PEBBLE_NOTIFICATION, name: "PEBBLE_NOTIFICATION"},
	{cmd: PEBBLE_RESOURCE, name: "PEBBLE_RESOURCE"},
	{cmd: PEBBLE_SYS_REG, name: "PEBBLE_SYS_REG"},
	{cmd: PEBBLE_FCT_REG, name: "PEBBLE_FCT_REG"},
	{cmd: PEBBLE_APP_INSTALL_MGR, name: "PEBBLE_APP_INSTALL_MANAGER"},
	{cmd: PEBBLE_DATA_LOG, name: "PEBBLE_DATA_LOG"},
	{cmd: PEBBLE_RUNKEEPER, name: "PEBBLE_RUNKEEPER"},
	{cmd: PEBBLE_SCREENSHOT, name: "PEBBLE_SCREENSHOT"},
	{cmd: PEBBLE_COREDUMP, name: "PEBBLE_COREDUMP"},
	{cmd: PEBBLE_NOTIFICATION_30, name: "PEBBLE_NOTIFICATION_30"},
	{cmd: PEBBLE_BLOBDB, name: "PEBBLE_BLOBDB"},
	{cmd: PEBBLE_PUT_BYTES, name: "PEBBLE_PUT_BYTES"}
];


var ICON_NOTIFICATION_GENERIC = 1;
var ICON_TIMELINE_MISSED_CALL = 2;
var ICON_NOTIFICATION_REMINDER = 3;
var ICON_NOTIFICATION_FLAG = 4;
var ICON_NOTIFICATION_WHATSAPP = 5;
var ICON_NOTIFICATION_TWITTER = 6;
var ICON_NOTIFICATION_TELEGRAM = 7;
var ICON_NOTIFICATION_GOOGLE_HANGOUTS = 8;
var ICON_NOTIFICATION_GMAIL = 9;
var ICON_NOTIFICATION_FACEBOOK_MESSENGER = 10;
var ICON_NOTIFICATION_FACEBOOK = 11;
var ICON_AUDIO_CASSETTE = 12;
var ICON_ALARM_CLOCK = 13;
var ICON_TIMELINE_WEATHER = 14;
var ICON_TIMELINE_SUN = 16;
var ICON_TIMELINE_SPORTS = 17;
var ICON_GENERIC_EMAIL = 19;
var ICON_AMERICAN_FOOTBALL = 20;
var ICON_TIMELINE_CALENDAR = 21;
var ICON_TIMELINE_BASEBALL = 22;
var ICON_BIRTHDAY_EVENT = 23;
var ICON_CAR_RENTAL = 24;
var ICON_CLOUDY_DAY = 25;
var ICON_CRICKET_GAME = 26;
var ICON_DINNER_RESERVATION = 27;
var ICON_GENERIC_WARNING = 28;
var ICON_GLUCOSE_MONITOR = 29;
var ICON_HOCKEY_GAME = 30;
var ICON_HOTEL_RESERVATION = 31;
var ICON_LIGHT_RAIN = 32;
var ICON_LIGHT_SNOW = 33;
var ICON_MOVIE_EVENT = 34;
var ICON_MUSIC_EVENT = 35;
var ICON_NEWS_EVENT = 36;
var ICON_PARTLY_CLOUDY = 37;
var ICON_PAY_BILL = 38;
var ICON_RADIO_SHOW = 39;
var ICON_SCHEDULED_EVENT = 40;
var ICON_SOCCER_GAME = 41;
var ICON_STOCKS_EVENT = 42;
var ICON_RESULT_DELETED = 43;
var ICON_CHECK_INTERNET_CONNECTION = 44;
var ICON_GENERIC_SMS = 45;
var ICON_RESULT_MUTE = 46;
var ICON_RESULT_SENT = 47;
var ICON_WATCH_DISCONNECTED = 48;
var ICON_DURING_PHONE_CALL = 49;
var ICON_TIDE_IS_HIGH = 50;
var ICON_RESULT_DISMISSED = 51;
var ICON_HEAVY_RAIN = 52;
var ICON_HEAVY_SNOW = 53;
var ICON_SCHEDULED_FLIGHT = 54;
var ICON_GENERIC_CONFIRMATION = 55;
var ICON_DAY_SEPARATOR = 56;
var ICON_NO_EVENTS = 57;
var ICON_NOTIFICATION_BLACKBERRY_MESSENGER = 58;
var ICON_NOTIFICATION_INSTAGRAM = 59;
var ICON_NOTIFICATION_MAILBOX = 60;
var ICON_NOTIFICATION_GOOGLE_INBOX = 61;
var ICON_RESULT_FAILED = 62;
var ICON_GENERIC_QUESTION = 63;
var ICON_NOTIFICATION_OUTLOOK = 64;
var ICON_RAINING_AND_SNOWING = 65;
var ICON_REACHED_FITNESS_GOAL = 66;
var ICON_NOTIFICATION_LINE = 67;
var ICON_NOTIFICATION_SKYPE = 68;
var ICON_NOTIFICATION_SNAPCHAT = 69;
var ICON_NOTIFICATION_VIBER = 70;
var ICON_NOTIFICATION_WECHAT = 71;
var ICON_NOTIFICATION_YAHOO_MAIL = 72;
var ICON_TV_SHOW = 73;
var ICON_BASKETBALL = 74;
var ICON_DISMISSED_PHONE_CALL = 75;
var ICON_NOTIFICATION_GOOGLE_MESSENGER = 76;
var ICON_NOTIFICATION_HIPCHAT = 77;
var ICON_INCOMING_PHONE_CALL = 78;
var ICON_NOTIFICATION_KAKAOTALK = 79;
var ICON_NOTIFICATION_KIK = 80;
var ICON_NOTIFICATION_LIGHTHOUSE = 81;
var ICON_LOCATION = 82;
var ICON_SETTINGS = 83;
var ICON_SUNRISE = 84;
var ICON_SUNSET = 85;
var ICON_FACETIME_DISMISSED = 86;
var ICON_FACETIME_INCOMING = 87;
var ICON_FACETIME_OUTGOING = 88;
var ICON_FACETIME_MISSED = 89;
var ICON_FACETIME_DURING = 90;
var ICON_BLUESCREEN_OF_DEATH = 91;
var ICON_START_MUSIC_PHONE = 92;


CreatePebblePing = function() {
	var id = PEBBLE_PING;
	var result = [];
	result.push(0, 0x05);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(0x00, 0xDE, 0xAD, 0xC0, 0xDE);
	return result;
};

CreatePebbleVersion = function() {
	var id = PEBBLE_VERSIONS;
	var result = [];
	result.push(0, 0x01);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(0x00);
	return result;
};

CreatePebbleTime = function() {
	var id = PEBBLE_TIME;
	var date = new Date();
	var time = date.getTime() / 1000 - date.getTimezoneOffset() * 60;
	var result = [];
	result.push(0, 0x05);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(0x02);
	result.push((time >> 24) & 0xff, (time >> 16) & 0xff, (time >> 8) & 0xff, time & 0xff);
	return result;
};

CreatePebbleTime30 = function() {
	var id = PEBBLE_TIME;
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

CreatePebblePhoneVersion30 = function() {
	var id = PEBBLE_PHONE_VERSION;
	var result = [];
	result.push(0x01);
	result.push(0xff, 0xff, 0xff, 0xff); // -1
	result.push(0x00, 0x00, 0x00, 0x00);
	result.push(0x00, 0x00, 0x00, 0x02); // os?
	result.push(0x02, 0x03, 0x08, 0x01);
	result.push(0xaf, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
	return CreatePebbleMsg(id, result);
};

CreatePebbleHangup = function() {
	var length = 1 + 4;
	var id = PEBBLE_PHONE_CONTROL;
	var result = [];
	result.push((length >> 8) & 0xff, length & 0xff);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(2); // hangup
	result.push(0xb1, 0x63, 0xf0, 0xf2); // cookie
	return result;
};

CreatePebbleRinger = function() {
	var length = 1 + 4;
	var id = PEBBLE_PHONE_CONTROL;
	var result = [];
	result.push((length >> 8) & 0xff, length & 0xff);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(7); // ring
	result.push(0xb1, 0x63, 0xf0, 0xf2); // cookie
	return result;
};

CreatePebbleRingEnd = function() {
	var length = 1 + 4;
	var id = PEBBLE_PHONE_CONTROL;
	var result = [];
	result.push((length >> 8) & 0xff, length & 0xff);
	result.push((id >> 8) & 0xff, id & 0xff);
	result.push(9); // end
	result.push(0xb1, 0x63, 0xf0, 0xf2); // cookie
	return result;
};

CreatePebblePhoneinfo = function(caller, number) {
	// utf16->utf8 and not more than 255 chars
	caller = this.TruncateString(unescape(encodeURIComponent(caller)), 255);
	number = this.TruncateString(unescape(encodeURIComponent(number)), 255);
	var length = 1 + 4 + number.length + 1 + caller.length + 1;
	var id = PEBBLE_PHONE_CONTROL;
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

CreatePebbleMusicinfo = function(artist, album, track) {
	// utf16->utf8 and not more than 255 chars
	this.artist = artist;
	this.album = album;
	this.track = track;
	artist = this.TruncateString(unescape(encodeURIComponent(artist)), 255);
	album = this.TruncateString(unescape(encodeURIComponent(album)), 255);
	track = this.TruncateString(unescape(encodeURIComponent(track)), 255);
	var length = 1 + artist.length + 1 + album.length + 1 + track.length + 1;
	var id = PEBBLE_MUSIC_CONTROL;
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

CreatePebbleNotification = function(from, info) {
	// utf16->utf8 and not more than 255 chars
	from = this.TruncateString(unescape(encodeURIComponent(from)), 255);
	info = this.TruncateString(unescape(encodeURIComponent(info)), 255);
	var length = 1 + from.length + 1 + info.length + 1 + 13 + 1;
	var id = PEBBLE_NOTIFICATION;
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

// https://github.com/Freeyourgadget/Gadgetbridge/blob/master/app/src/main/java/nodomain/freeyourgadget/gadgetbridge/service/devices/pebble/PebbleProtocol.java
CreatePebbleNotification30 = function(from, info, appid) {
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
	var uuid = genID();
	var icon_id = ICON_NOTIFICATION_GENERIC;
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
	if (appid == appidPhone) {
		icon_id = ICON_NOTIFICATION_GENERIC;
	} else if (appid == appidEmail) {
		icon_id = ICON_GENERIC_EMAIL;
	} else if (appid == appidMessage) {
		icon_id = ICON_GENERIC_SMS;
	} else if (appid == appidMacaw) {
		icon_id = ICON_NOTIFICATION_TWITTER;
	} else if (appid == appidCalendar) {
		icon_id = ICON_TIMELINE_CALENDAR;
	} else if (appid == appidBattery) {
		icon_id = ICON_BLUESCREEN_OF_DEATH;
	}
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
	icon_id = 0x80000000 | icon_id;
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
	var uuid = genID();
	var result = [];
	result.push((length >> 8) & 0xff, length & 0xff);
	result.push((PEBBLE_BLOBDB >> 8) & 0xff, PEBBLE_BLOBDB & 0xff);
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

CreatePebbleMsg = function(id, payload) {
	var result = [];
	result.push((payload.length >> 8) & 0xff, payload.length & 0xff);
	result.push((id >> 8) & 0xff, id & 0xff);
	for (var i=0; i<payload.length; i++) {
		result.push(payload[i]);
	}
	return result;
};

TruncateString = function(string, length) {
	if (string.length > length) {
		string = string.substr(0, length-3) + "...";
	}
	return string;
};

/*
public final class PebbleColor {
    public static final byte Black = (byte) 0b11000000;
    public static final byte OxfordBlue = (byte) 0b11000001;
    public static final byte DukeBlue = (byte) 0b11000010;
    public static final byte Blue = (byte) 0b11000011;
    public static final byte DarkGreen = (byte) 0b11000100;
    public static final byte MidnightGreen = (byte) 0b11000101;
    public static final byte CobaltBlue = (byte) 0b11000110;
    public static final byte BlueMoon = (byte) 0b11000111;
    public static final byte IslamicGreen = (byte) 0b11001000;
    public static final byte JaegerGreen = (byte) 0b11001001;
    public static final byte TiffanyBlue = (byte) 0b11001010;
    public static final byte VividCerulean = (byte) 0b11001011;
    public static final byte Green = (byte) 0b11001100;
    public static final byte Malachite = (byte) 0b11001101;
    public static final byte MediumSpringGreen = (byte) 0b11001110;
    public static final byte Cyan = (byte) 0b11001111;
    public static final byte BulgarianRose = (byte) 0b11010000;
    public static final byte ImperialPurple = (byte) 0b11010001;
    public static final byte Indigo = (byte) 0b11010010;
    public static final byte ElectricUltramarine = (byte) 0b11010011;
    public static final byte ArmyGreen = (byte) 0b11010100;
    public static final byte DarkGray = (byte) 0b11010101;
    public static final byte Liberty = (byte) 0b11010110;
    public static final byte VeryLightBlue = (byte) 0b11010111;
    public static final byte KellyGreen = (byte) 0b11011000;
    public static final byte MayGreen = (byte) 0b11011001;
    public static final byte CadetBlue = (byte) 0b11011010;
    public static final byte PictonBlue = (byte) 0b11011011;
    public static final byte BrightGreen = (byte) 0b11011100;
    public static final byte ScreaminGreen = (byte) 0b11011101;
    public static final byte MediumAquamarine = (byte) 0b11011110;
    public static final byte ElectricBlue = (byte) 0b11011111;
    public static final byte DarkCandyAppleRed = (byte) 0b11100000;
    public static final byte JazzberryJam = (byte) 0b11100001;
    public static final byte Purple = (byte) 0b11100010;
    public static final byte VividViolet = (byte) 0b11100011;
    public static final byte WindsorTan = (byte) 0b11100100;
    public static final byte RoseVale = (byte) 0b11100101;
    public static final byte Purpureus = (byte) 0b11100110;
    public static final byte LavenderIndigo = (byte) 0b11100111;
    public static final byte Limerick = (byte) 0b11101000;
    public static final byte Brass = (byte) 0b11101001;
    public static final byte LightGray = (byte) 0b11101010;
    public static final byte BabyBlueEyes = (byte) 0b11101011;
    public static final byte SpringBud = (byte) 0b11101100;
    public static final byte Inchworm = (byte) 0b11101101;
    public static final byte MintGreen = (byte) 0b11101110;
    public static final byte Celeste = (byte) 0b11101111;
    public static final byte Red = (byte) 0b11110000;
    public static final byte Folly = (byte) 0b11110001;
    public static final byte FashionMagenta = (byte) 0b11110010;
    public static final byte Magenta = (byte) 0b11110011;
    public static final byte Orange = (byte) 0b11110100;
    public static final byte SunsetOrange = (byte) 0b11110101;
    public static final byte BrilliantRose = (byte) 0b11110110;
    public static final byte ShockingPink = (byte) 0b11110111;
    public static final byte ChromeYellow = (byte) 0b11111000;
    public static final byte Rajah = (byte) 0b11111001;
    public static final byte Melon = (byte) 0b11111010;
    public static final byte RichBrilliantLavender = (byte) 0b11111011;
    public static final byte Yellow = (byte) 0b11111100;
    public static final byte Icterine = (byte) 0b11111101;
    public static final byte PastelYellow = (byte) 0b11111110;
    public static final byte White = (byte) 0b11111111;
    public static final byte Clear = (byte) 0b00000000;
}
*/

genID = function() {
	var time = (new Date()).getTime();
	var a = (time << 16) | Math.floor(Math.random() * 0x10000);
	var b = (Math.floor(Math.random() * 0x10000) << 16) | Math.floor(Math.random() * 0x10000);
	var c = (Math.floor(Math.random() * 0x10000) << 16) | Math.floor(Math.random() * 0x10000);
	var d = (Math.floor(Math.random() * 0x10000) << 16) | Math.floor(Math.random() * 0x10000);
	return [a,b,c,d];
}