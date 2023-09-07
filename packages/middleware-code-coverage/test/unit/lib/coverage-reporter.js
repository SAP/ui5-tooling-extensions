import test from "ava";
import sinon from "sinon";
import libReport from "istanbul-lib-report";
import coverageReporter from "../../../lib/coverage-reporter.js";
import {createInstrumentationConfig} from "../../../lib/util.js";

const coverageData = {
	coverage: {
		"/resources/Control1.js": {
			"path": "/resources/Control1.js",
			"statementMap": {
				"0": {
					"start": {
						"line": 7,
						"column": 0
					},
					"end": {
						"line": 31,
						"column": 3
					}
				},
				"1": {
					"start": {
						"line": 11,
						"column": 17
					},
					"end": {
						"line": 11,
						"column": 26
					}
				},
				"2": {
					"start": {
						"line": 17,
						"column": 18
					},
					"end": {
						"line": 28,
						"column": 2
					}
				},
				"3": {
					"start": {
						"line": 19,
						"column": 3
					},
					"end": {
						"line": 21,
						"column": 4
					}
				}
			},
			"fnMap": {},
			"branchMap": {},
			"s": {},
			"f": {},
			"b": {}
		}
	}
};

const mockedResource = {
	all: {
		byPath() {
			return {
				getString() {
					return `sap.ui.define([
"sap/ui/core/mvc/Controller",
"sap/m/MessageToast"
], (Controller, MessageToast) => Controller.extend("ui5.sample.controller.App", {

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
}));`;
				}
			};
		}
	}
};

test("Report Coverage", async (t) => {
	const expectedConfig = {
		availableReports: [{
			destination: "html/",
			report: "html"
		}],
		coverageMap: [
			"/resources/Control1.js"
		],
	};

	const config = await createInstrumentationConfig();
	const report = await coverageReporter(coverageData, config, mockedResource);
	t.deepEqual(report, expectedConfig);
});

test("Report Coverage (old structure)", async (t) => {
	const expectedConfig = {
		availableReports: [{
			destination: "html/",
			report: "html"
		}],
		coverageMap: [
			"/resources/Control1.js"
		],
	};

	const config = await createInstrumentationConfig();
	const report = await coverageReporter(coverageData.coverage, config, mockedResource);
	t.deepEqual(report, expectedConfig);
});

test("Report Coverage: lcov reporter", async (t) => {
	const expectedConfig = {
		availableReports: [{
			destination: "lcov/lcov.info",
			report: "lcov"
		}, {
			destination: "lcov/lcov-report",
			report: "html"
		}],
		coverageMap: [
			"/resources/Control1.js"
		],
	};

	const config = await createInstrumentationConfig({
		report: {
			"reporter": ["lcov"]
		}
	});
	const report = await coverageReporter(coverageData, config, mockedResource);
	t.deepEqual(report, expectedConfig);
});


test("Report Coverage: Log warning if resource can not be found", async (t) => {
	const expectedConfig = {
		availableReports: [{
			destination: "html/",
			report: "html"
		}],
		coverageMap: [
			"/resources/Control1.js"
		],
	};

	const mockedResource = {
		all: {
			byPath() {
				return undefined;
			}
		}
	};
	const warnLogStub = sinon.stub();
	const log = {
		warn: warnLogStub
	};
	const config = await createInstrumentationConfig();
	const report = await coverageReporter(coverageData, config, mockedResource, log);

	t.is(warnLogStub.callCount, 1);
	t.is(warnLogStub.getCall(0).args[0],
		"/resources/Control1.js not found! Detailed report can't be generated for that resource!");
	t.deepEqual(report, expectedConfig);
});

test("Report Coverage: Fronted config for watermarks", async (t) => {
	const reportSpy = sinon.spy(libReport, "createContext");

	const watermarks = {
		statements: [5, 10],
		functions: [15, 20],
		branches: [25, 30],
		lines: [35, 40],
	};

	const config = await createInstrumentationConfig();

	reportSpy.resetHistory();
	await coverageReporter({...coverageData, watermarks},
		config,
		mockedResource
	);

	let reportedWatermarks = reportSpy.lastCall.args[0].watermarks;
	t.deepEqual(watermarks, reportedWatermarks, "Watermarks got updated");

	await coverageReporter(coverageData, config, mockedResource);

	lastReport = reportSpy.args.slice(-1);
	reportedWatermarks = lastReport[0][0].watermarks;
	t.notDeepEqual(watermarks, reportedWatermarks, "Default watermarks got used");
});
