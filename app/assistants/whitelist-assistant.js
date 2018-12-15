function WhitelistAssistant() {
};

WhitelistAssistant.prototype.setup = function() {
	this.whiteListItems = [];

	/* setup widgets here */
	this.whiteListModel =
		{
			listTitle: "Email whitelist",
			items: this.whiteListItems
		};

	this.controller.setupWidget('whitelist',
		{
			itemTemplate:'whitelist/listitem',
			listTemplate:'whitelist/listcontainer',
			emptyTemplate:'whitelist/emptylist',
            swipeToDelete: true,
			fixedHeightItems: true,
			reorderable: false
		},
		this.whiteListModel
	);

	this.controller.setupWidget(Mojo.Menu.commandMenu,
		{
			menuClass: 'fade'
		},
		{
			visible: true,
			items: [
				{icon: "new", command: 'add'}
			]
		}
	);

	try {
		patternDB.transaction(function (tx) {
			tx.executeSql("SELECT pattern, application FROM WhiteList; GO;", [],
				function(tx, result) {
					if (result.rows) {
						Mojo.Log.error(result.rows.length);
						for (var i=0; i<result.rows.length; i++) {
							var row = result.rows.item(i);
							this.whiteListItems.push({pattern: row.pattern, application: row.application});
							//Mojo.Log.error(row.DTUpdate, row.Url);
						}
					}
					this.controller.modelChanged(this.whiteListModel, this);
				}.bind(this),
				function(tx, error) {
					tx.executeSql("CREATE TABLE WhiteList (pattern TEXT, application TEXT, PRIMARY KEY(pattern, application)); GO;", [],
						function(result) {},
						function(tx, error) {
							Mojo.Log.error(error.message);
							// table exists, remove and recreate
							tx.executeSql("DROP TABLE WhiteList; GO;", [],
								function(result) {
									tx.executeSql("CREATE TABLE WhiteList (pattern TEXT, application TEXT, PRIMARY KEY(pattern, application)); GO;", [],
										function(result) {},
										function(tx, error) {Mojo.Log.error(error.message);}
									);
								}.bind(this),
								function(tx, error) {Mojo.Log.error(error.message);}
							);
						}.bind(this)
					);
				}.bind(this)
			);
		}.bind(this));
	} catch (e) {
		Mojo.Log.error(e);
	}

	Mojo.Event.listen(this.controller.get('whitelist'), Mojo.Event.listDelete, this.deleteEntry.bind(this));
	Mojo.Event.listen(this.controller.get('whitelist'), Mojo.Event.listTap, this.tapEntry.bind(this));
	this.controller.listen(this.controller.document, 'orientationchange', this.handleOrientation.bindAsEventListener(this));
};

WhitelistAssistant.prototype.deleteEntry = function(event) {
	var pattern = event.item.pattern;
	var application = event.item.application;
	try {
		patternDB.transaction(function (tx) {
			tx.executeSql("DELETE FROM WhiteList WHERE pattern=? AND application=?; GO;", [pattern, application],
				function(tx, result) {
					var deleteIndex = this.whiteListItems.indexOf(event.item);
					this.whiteListItems.splice(deleteIndex, 1);
					this.controller.modelChanged(this.whiteListModel, this);
				}.bind(this),
				function(tx, error) {Mojo.Log.error(error.message);}
			);
		}.bind(this));
	} catch (e) {
		Mojo.Log.error(e);
	}
};

WhitelistAssistant.prototype.addEntry = function(patternNew, patternOld, application) {
	if (patternNew != "") {
		try {
			patternDB.transaction(function (tx) {
				tx.executeSql("INSERT INTO WhiteList (pattern, application) VALUES (?, ?); GO;", [patternNew, application],
					function(tx, result) {
						this.whiteListItems.push({pattern: patternNew, application: application});
						this.controller.modelChanged(this.whiteListModel, this);
					}.bind(this),
					function(tx, error) {Mojo.Log.error(error.message);});
			}.bind(this));
		} catch (e) {
			Mojo.Log.error(e);
		}
	}
};

WhitelistAssistant.prototype.changeEntry = function(patternNew, patternOld, application) {
	if (patternNew != "") {
		try {
			patternDB.transaction(function (tx) {
				tx.executeSql("UPDATE WhiteList SET pattern=? WHERE pattern=? AND application=?; GO;", [patternNew, patternOld, application],
					function(tx, result) {
						for (var i=0; i<this.whiteListItems.length; i++) {
							if ((this.whiteListItems[i].pattern == patternOld) && (this.whiteListItems[i].application == application)) {
								this.whiteListItems[i].pattern = patternNew;
							}
						}
						this.controller.modelChanged(this.whiteListModel, this);
					}.bind(this),
					function(tx, error) {Mojo.Log.error(error.message);});
			}.bind(this));
		} catch (e) {
			Mojo.Log.error(e);
		}
	}
};

WhitelistAssistant.prototype.handleOrientation = function(event) {
};

WhitelistAssistant.prototype.handleCommand = function(event) {
	if (event.type == Mojo.Event.command) {
		switch (event.command) {
			case "add":
				this.controller.stageController.pushScene("edititem", this.addEntry.bind(this), "", "email");
			break;
		}
	}
};

WhitelistAssistant.prototype.tapEntry = function(event) {
	Mojo.Log.error("Tap", event.originalEvent.target.id, event.item.pattern);
	this.controller.stageController.pushScene("edititem", this.changeEntry.bind(this), event.item.pattern, event.item.application);
};

WhitelistAssistant.prototype.ready = function() {
	this.controller.get('whitelist').mojo.setLength(this.whiteListItems.length);
};

WhitelistAssistant.prototype.activate = function(event) {
	Mojo.Log.error("activate");
};

WhitelistAssistant.prototype.deactivate = function(event) {
	Mojo.Log.error("deactivate");
};

WhitelistAssistant.prototype.cleanup = function(event) {
	Mojo.Log.error("Clean up");
};
