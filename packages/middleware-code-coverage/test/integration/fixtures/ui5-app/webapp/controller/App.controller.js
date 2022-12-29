sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], (Controller, MessageToast) => Controller.extend("ui5.app.controller.App", {

	onInit: () => { },

	onButtonPress() {
		MessageToast.show(this.getMessage());
	},

	getMessage() {
		return this.getView().getModel("i18n").getProperty("message");
	},

	formatMessage(message) {
		return message.toUpperCase();
	}
}));
