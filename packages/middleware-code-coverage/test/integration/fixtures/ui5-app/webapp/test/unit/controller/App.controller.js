sap.ui.define([
	"ui5/app/controller/App.controller"
], (AppController) => {
	let oAppController;
	QUnit.module("Test App Controller", {
		beforeEach() {
			oAppController = new AppController();
		}
	});

	QUnit.test("Should format the message", function(assert) {
		assert.equal(oAppController.formatMessage("test"), "TEST");
	});
});
