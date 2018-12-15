function EdititemAssistant(callback, name, application) {
	this.callback = callback;
	this.model = {origin: name, name: name, application: application};
}

EdititemAssistant.prototype.setup = function() {

	this.controller.setupWidget("pattern",
		{
			hintText:'enter pattern',
			multiline: false,
			focus: true,
			modelProperty: 'name',
			label : 'Pattern'
		},
		this.model
	);
};

EdititemAssistant.prototype.cleanup = function(event) {
	Mojo.Log.error(this.model.name, this.model.origin, this.model.application);
	this.callback(this.model.name, this.model.origin, this.model.application);
};

