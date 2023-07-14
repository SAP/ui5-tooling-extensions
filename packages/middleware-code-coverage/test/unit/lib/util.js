import test from "ava";
import {
	createInstrumentationConfig,
	getLatestSourceMap,
	readJsonFile,
	shouldInstrumentResource
} from "../../../lib/util.js";

// Node.js itself tries to parse sourceMappingURLs in all JavaScript files. This is unwanted and might even lead to
// obscure errors when dynamically generating Data-URI soruceMappingURL values.
// Therefore use this constant to never write the actual string.
const SOURCE_MAPPING_URL = "//" + "# sourceMappingURL";

function getMockedRequest(path="", query={}) {
	return {
		path,
		query
	};
}

test("createInstrumentationConfig: default config", async (t) => {
	const expectedConfig = {
		cwd: "./",
		excludePatterns: [],
		instrument: {
			coverageGlobalScope: "window.top",
			coverageGlobalScopeFunc: false,
			produceSourceMap: true,
		},
		report: {
			"report-dir": "./tmp/coverage-reports",
			"reporter": [
				"html",
			],
			"watermarks": {
				branches: [
					50,
					80,
				],
				functions: [
					50,
					80,
				],
				lines: [
					50,
					80,
				],
				statements: [
					50,
					80,
				],
			},
		}
	};
	const config = await createInstrumentationConfig();
	t.deepEqual(config, expectedConfig);
});

test("createInstrumentationConfig: custom config", async (t) => {
	const expectedConfig = {
		cwd: "./myworkingdirectory",
		excludePatterns: [],
		instrument: {
			coverageGlobalScope: "this",
			coverageGlobalScopeFunc: true,
			produceSourceMap: false,
		},
		report: {
			"report-dir": "./tmp/coverage-custom-reports",
			"reporter": [
				"json",
			],
			"watermarks": {
				branches: [
					60,
					90,
				],
				functions: [
					50,
					80,
				],
				lines: [
					50,
					80,
				],
				statements: [
					60,
					80,
				],
			},
		}
	};
	const config = await createInstrumentationConfig({
		cwd: "./myworkingdirectory",
		instrument: {
			coverageGlobalScope: "this",
			coverageGlobalScopeFunc: true,
			produceSourceMap: false,
		},
		report: {
			"report-dir": "./tmp/coverage-custom-reports",
			"reporter": [
				"json",
			],
			"watermarks": {
				branches: [
					60,
					90,
				],
				functions: [
					50,
					80,
				],
				lines: [
					50,
					80,
				],
				statements: [
					60,
					80,
				],
			},
		}
	});
	t.deepEqual(config, expectedConfig);
});

test("createInstrumentationConfig: .library excludes", async (t) => {
	const expectedConfig = {
		excludePatterns: [
			/\/resources\/((([^/]+[/])*my-file))(-dbg)?.js$/,
			/\/resources\/((ui5\/customlib\/utils\/([^/]+[/])*[^/]*))(-dbg)?.js$/,
			/\/resources\/((ui5\/customlib\/Control1))(-dbg)?.js$/,
		],
	};

	const sDotLibrary = `<?xml version="1.0" encoding="UTF-8" ?>
<library xmlns="http://www.sap.com/sap.ui.library.xsd" >
	<name>ui5.customlib</name>
	<appData>
		<jscoverage xmlns="http://www.sap.com/ui5/buildext/jscoverage" >
			<exclude name="/my-file" />
			<exclude name="ui5.customlib.utils." />
			<exclude name="ui5.customlib.Control1" />
			<exclude name="sap.m." external="true"/>
		</jscoverage>
	</appData>
</library>`;

	const resources = {
		byGlob() {
			return [{
				getString() {
					return sDotLibrary;
				}
			}];
		}
	};
	const config = await createInstrumentationConfig({}, resources);
	t.deepEqual(config.excludePatterns, expectedConfig.excludePatterns);
});

test("createInstrumentationConfig: .library but without jscoverage", async (t) => {
	const expectedConfig = {
		excludePatterns: [],
	};

	const sDotLibrary = `<?xml version="1.0" encoding="UTF-8" ?>
<library xmlns="http://www.sap.com/sap.ui.library.xsd" >
	<name>ui5.customlib</name>
	<appData>
	</appData>
</library>`;

	const resources = {
		byGlob() {
			return [{
				getString() {
					return sDotLibrary;
				}
			}];
		}
	};
	const config = await createInstrumentationConfig({}, resources);
	t.deepEqual(config.excludePatterns, expectedConfig.excludePatterns);
});

test("createInstrumentationConfig: .library but without excludes", async (t) => {
	const expectedConfig = {
		excludePatterns: [],
	};

	const sDotLibrary = `<?xml version="1.0" encoding="UTF-8" ?>
<library xmlns="http://www.sap.com/sap.ui.library.xsd" >
	<name>ui5.customlib</name>
	<appData>
		<jscoverage xmlns="http://www.sap.com/ui5/buildext/jscoverage" >
		</jscoverage>
	</appData>
</library>`;

	const resources = {
		byGlob() {
			return [{
				getString() {
					return sDotLibrary;
				}
			}];
		}
	};
	const config = await createInstrumentationConfig({}, resources);
	t.deepEqual(config.excludePatterns, expectedConfig.excludePatterns);
});

test("createInstrumentationConfig: custom excludes", async (t) => {
	const excludes = [
		/\/resources\/((ui5\/customlib\/src\/([^/]+[/])*[^/]*))(-dbg)?.js$/,
		/\/resources\/((ui5\/customlib\/test))?.js$/,
	];

	const expectedConfig = {
		excludePatterns: excludes
	};

	const config = await createInstrumentationConfig({
		excludePatterns: excludes
	});
	t.deepEqual(config.excludePatterns, expectedConfig.excludePatterns);
});

test("createInstrumentationConfig: custom excludes override .library excludes", async (t) => {
	const excludes = [
		/\/resources\/((ui5\/customlib\/src\/([^/]+[/])*[^/]*))(-dbg)?.js$/,
		/\/resources\/((ui5\/customlib\/test))?.js$/,
	];

	const expectedConfig = {
		excludePatterns: excludes
	};

	const sDotLibrary = `<?xml version="1.0" encoding="UTF-8" ?>
<library xmlns="http://www.sap.com/sap.ui.library.xsd" >
	<name>ui5.customlib</name>
	<appData>
		<jscoverage xmlns="http://www.sap.com/ui5/buildext/jscoverage" >
			<exclude name="ui5.customlib.Control1" />
		</jscoverage>
	</appData>
</library>`;

	const resources = {
		byGlob() {
			return [{
				getString() {
					return sDotLibrary;
				}
			}];
		}
	};

	const config = await createInstrumentationConfig({
		excludePatterns: excludes
	}, resources);
	t.deepEqual(config.excludePatterns, expectedConfig.excludePatterns);
});

test("readJsonFile", async (t) => {
	const {name} = await readJsonFile("./package.json");
	t.is(name, "@ui5/middleware-code-coverage");
});

test("getLatestSourceMap", (t) => {
	const instrumenter = {
		lastSourceMap() {
			return `sap.ui.define(["library/d/some"],(n) => {o(n){var o=n;console.log(o)}o()});`;
		}
	};
	const sourcemap = getLatestSourceMap(instrumenter);

	t.is(sourcemap,
		// eslint-disable-next-line max-len
		`\r\n${SOURCE_MAPPING_URL}=data:application/json;charset=utf-8;base64,InNhcC51aS5kZWZpbmUoW1wibGlicmFyeS9kL3NvbWVcIl0sKG4pID0+IHtvKG4pe3ZhciBvPW47Y29uc29sZS5sb2cobyl9bygpfSk7Ig==`
	);
});

test("getLatestSourceMap: no source map", (t) => {
	const instrumenter = {
		lastSourceMap() {
			return null;
		}
	};
	const sourcemap = getLatestSourceMap(instrumenter);

	t.is(sourcemap, "", "If no source map can be determined an empty string is returned");
});

test("shouldInstrumentResource: No JS file", (t) => {
	const toBeInstrumented = shouldInstrumentResource(getMockedRequest("Test.html"));
	t.false(toBeInstrumented);
});

test("shouldInstrumentResource: Non flagged resources", (t) => {
	const toBeInstrumented = shouldInstrumentResource(getMockedRequest("Test.js"));
	t.false(toBeInstrumented);
});

test("shouldInstrumentResource: Flag resource as non instrumented", (t) => {
	t.false(shouldInstrumentResource(getMockedRequest("Test.js", {instrument: "false"})));
	t.false(shouldInstrumentResource(getMockedRequest("Test.js", {instrument: "0"})));
	t.false(shouldInstrumentResource(getMockedRequest("Test.js", {instrument: "undefined"})));
	t.false(shouldInstrumentResource(getMockedRequest("Test.js", {instrument: "null"})));

	t.false(shouldInstrumentResource(getMockedRequest("Test.js", {instrument: false})));
	t.false(shouldInstrumentResource(getMockedRequest("Test.js", {instrument: 0})));
	t.false(shouldInstrumentResource(getMockedRequest("Test.js", {instrument: undefined})));
	t.false(shouldInstrumentResource(getMockedRequest("Test.js", {instrument: null})));
});

test("shouldInstrumentResource: Resource flagged as instrumented, no excludes", (t) => {
	const toBeInstrumented = shouldInstrumentResource(getMockedRequest("Test.js", {instrument: "true"}));
	t.true(toBeInstrumented);
});

test("shouldInstrumentResource: Resource flagged as instrumented, but defined matching regex exclude", (t) => {
	const request = getMockedRequest("/resources/ui5/customlib/test/MyTest.js", {instrument: "true"});
	const config = {
		excludePatterns: [
			/\/resources\/((ui5\/customlib\/test\/([^/]+[/])*[^/]*))(-dbg)?.js$/
		]
	};
	const toBeInstrumented = shouldInstrumentResource(request, config);
	t.false(toBeInstrumented);
});

test("shouldInstrumentResource: Resource flagged as instrumented, but defined matching pattern exclude", (t) => {
	const request = getMockedRequest("/resources/ui5/customlib/test/MyTest.js", {instrument: "true"});
	const config = {
		excludePatterns: [
			"/resources/ui5/customlib/test/MyTest.js"
		]
	};
	const toBeInstrumented = shouldInstrumentResource(request, config);
	t.false(toBeInstrumented);
});

test("shouldInstrumentResource: Resource flagged as instrumented, with no matching regex exclude", (t) => {
	const request = getMockedRequest("/resources/ui5/customlib/src/Control1.js", {instrument: "true"});
	const config = {
		excludePatterns: [
			/\/resources\/((ui5\/customlib\/test\/([^/]+[/])*[^/]*))(-dbg)?.js$/
		]
	};
	const toBeInstrumented = shouldInstrumentResource(request, config);
	t.true(toBeInstrumented);
});

test("shouldInstrumentResource: Resource flagged as instrumented, with no matching pattern exclude", (t) => {
	const request = getMockedRequest("/resources/ui5/customlib/src/Control.js", {instrument: "true"});
	const config = {
		excludePatterns: [
			"/resources/ui5/customlib/test/MyTest.js"
		]
	};
	const toBeInstrumented = shouldInstrumentResource(request, config);
	t.true(toBeInstrumented);
});


