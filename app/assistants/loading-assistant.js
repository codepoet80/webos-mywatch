function LoadingAssistant() {
}

LoadingAssistant.prototype.setup = function() {
    document.body.style.backgroundColor = "#787A7C";
}

LoadingAssistant.prototype.activate = function ()
{
    setTimeout("Mojo.Controller.getAppController().closeStage('loading')", 200);
}