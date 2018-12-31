# My Watch
![mywatch-icon](https://raw.githubusercontent.com/codepoet80/webos-mywatch/master/icon48.png "My Watch Icon")
A fork of MetaView's mWatch for Palm/HP webOS.

This app allows webOS devices to send notifications to Pebble, LiveView from Sony or Sony-Ericsson MBW 150/200 watches. At the moment, phone calls, SMS messages and emails are supported, as well as notifications from other apps that supported mWatch.

Note that mWatch and My Watch cannot co-exist -- think of this as a drop-in replacement.

Original source code is used with permission from the author. This app depends on FileMgr from Canuck Coding.

Read more about this effort here:
https://forums.webosnation.com/webos-homebrew-apps/331159-connecting-pebble-webos-using-mwatch.html

<img src="https://raw.githubusercontent.com/codepoet80/webos-mywatch/master/screenshot.png" height="400" alt="My Watch Screenshot">

## change-log
- 1.0.1 - Initial experimental release, re-factoring capabilities into seperate models, and implementing error handling and re-try logic.
- 1.0.2 - App preferences are populated dynamically from a single source. Eventually this could come from a file. Improvements to .patch file.
- 1.0.3 - App preferences are now filtered by whether or not the supported app is installed. Building with same ID as mWatch for compatibility.
- 1.0.4 - Don't grab focus if already running and a notification comes in.
- 1.0.5 - Add Troubleshooting features for developers.