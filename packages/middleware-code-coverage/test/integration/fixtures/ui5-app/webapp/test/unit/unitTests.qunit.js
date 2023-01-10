QUnit.config.autostart = false;
sap.ui.getCore().attachInit(() => {
	sap.ui.require([
		"ui5/app/test/unit/AllTests"
	], function() {
		QUnit.start();
	});
});
