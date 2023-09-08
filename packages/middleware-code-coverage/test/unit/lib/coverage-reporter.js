import test from "ava";
import esmock from "esmock";
import sinonGlobal from "sinon";
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

test.beforeEach(async (t) => {
	t.context.sinon = sinonGlobal.createSandbox();
	t.context.coverageReporter = await esmock("../../../lib/coverage-reporter.js");
});

test.afterEach.always((t) => {
	t.context.sinon.restore();
});

test("Report Coverage", async (t) => {
	const {coverageReporter} = t.context;
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
	const {coverageReporter} = t.context;
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
	const {coverageReporter} = t.context;
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
	const {sinon, coverageReporter} = t.context;
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
	const {sinon} = t.context;
	const libReport = await esmock("istanbul-lib-report");
	const coverageReporter = await esmock("../../../lib/coverage-reporter.js", {
		"istanbul-lib-report": libReport
	});
	const reportSpy = sinon.spy(libReport, "createContext");

	const modifiedWatermarks = {
		statements: [5, 10],
		functions: [15, 20],
		branches: [25, 30],
		lines: [35, 40],
	};

	const config = await createInstrumentationConfig();
	const {watermarks: defaultWatermarks} = config.report;

	await coverageReporter({...coverageData, watermarks: modifiedWatermarks},
		config,
		mockedResource
	);

	let reportedWatermarks = reportSpy.lastCall.args[0].watermarks;
	t.deepEqual(reportedWatermarks, modifiedWatermarks, "Watermarks got updated");

	await coverageReporter(coverageData, config, mockedResource);

	reportedWatermarks = reportSpy.lastCall.args[0].watermarks;
	t.notDeepEqual(reportedWatermarks, modifiedWatermarks, "Watermarks state is not persisted");
	t.deepEqual(reportedWatermarks, defaultWatermarks, "Default watermarks got used");
});

test("Report Coverage: Fronted config for watermarks- overwrite just some properties", async (t) => {
	const {sinon} = t.context;
	const libReport = await esmock("istanbul-lib-report");
	const coverageReporter = await esmock("../../../lib/coverage-reporter.js", {
		"istanbul-lib-report": libReport
	});
	const reportSpy = sinon.spy(libReport, "createContext");

	const config = await createInstrumentationConfig();
	const {watermarks: defaultWatermarks} = config.report;

	await coverageReporter(
		{...coverageData, watermarks: {statements: [5, 10]}},
		config,
		mockedResource
	);

	const reportedWatermarks = reportSpy.lastCall.args[0].watermarks;
	t.deepEqual(reportedWatermarks, {...defaultWatermarks, ...{statements: [5, 10]}},
		"Only 'statements' got updated. The rest is with default values."
	);
});
