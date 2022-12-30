const xml2js = require("xml2js");
const {Buffer} = require("node:buffer");

/**
 * Returns the configuration for instrumenting the files
 *
 * @param {object} configuration instrumentation configuration
 * @returns configuration
 */
async function createInstrumenterConfig(configuration = {}, resources) {
	const excludedPatterns = await excludePatterns(resources);

	const {instrument, report, ...generalConfig} = configuration;

	return {
		// General configuration
		cwd: "./",
		excludePatterns: excludedPatterns,
		// General config overwrites
		...generalConfig,

		// Intrumenter configuration
		...{instrument: cereateInstrumenterConfig(instrument)},

		// Reporter configuration
		...{report: createReporterConfig(report)},
	};
}

/**
 * Returns the configuration for the reporting
 *
 * @param {object} configuration Reporting configuration
 * @returns
 */
function createReporterConfig(configuration = {}) {
	const defaultValues = {
		"reporter": ["html"],
		"report-dir": "./tmp/coverage-reports",
		"watermarks": {
			statements: [50, 80],
			functions: [50, 80],
			branches: [50, 80],
			lines: [50, 80],
		},
	};

	return {...defaultValues, ...configuration};
}

/**
 * Returns the configuration for the instrumenter
 *
 * @param {object} configuration
 * @returns
 */
function cereateInstrumenterConfig(configuration = {}) {
	const defaultValues = {
		produceSourceMap: true,
		coverageGlobalScope: "window.top",
		coverageGlobalScopeFunc: false,
	};

	return {...defaultValues, ...configuration};
}

/**
 * Checks whether a request to resource should be instrumented
 *
 * @param {object} request
 * @param {object} config
 * @returns
 */
function shouldInstrumentResource(request, config) {
	return (
		request.path &&
		request.path.endsWith(".js") && // Only .js file requests
		!isFalsyValue(request.query.instrument) && // instrument only flagged files, ignore "falsy" values
		!(config.excludePatterns || []).some((pattern) => {
			if (pattern instanceof RegExp) {
				// The ones comming from .library files are regular expressions
				return pattern.test(request.path);
			} else {
				return request.path.includes(pattern);
			}
		})
	);
}

function isFalsyValue(value) {
	return [undefined, "false", "0", "null"].includes(value);
}

/**
 * Returns the source map of the latest instrumented resource
 *
 * @param {Instrumenter} instrumenter
 * @returns {string} sourceMap
 */
function getLatestSourceMap(instrumenter) {
	const sourceMap = instrumenter.lastSourceMap();

	if (!sourceMap) {
		return "";
	}

	return (
		"\r\n//# sourceMappingURL=data:application/json;charset=utf-8;base64," +
		Buffer.from(JSON.stringify(sourceMap), "utf8").toString("base64")
	);
}

/**
 * Analyzes .library files in order to check for jscoverage exclusions
 *
 * Note: .library: version="2.0" -> slash notation, and missing is "dot notation".
 * Note: We might consider to move this utility into the @ui5/project
 *
 * @param {@ui5/fs/Resource[]} resources
 * @returns exclude patterns
 */
async function excludePatterns(resources) {
	const aExcludes = [];
	// Read excludes from .library files
	const aDotLibrary = await resources.byGlob(["/resources/**/.library"]);
	for (const oDotLibrary of aDotLibrary) {
		const content = await oDotLibrary.getString();
		const result = await xml2js.parseStringPromise(content);
		if (
			!(
				result &&
				result.library &&
				result.library.appData &&
				result.library.appData[0] &&
				result.library.appData[0].jscoverage &&
				result.library.appData[0].jscoverage[0]
			)
		) {
			continue;
		}

		const oCoverage = result.library.appData[0].jscoverage[0];
		if (oCoverage.exclude) {
			for (let j = 0; j < oCoverage.exclude.length; j++) {
				const oExclude = oCoverage.exclude[j];

				let sPattern = oExclude.$.name;

				// normalize the pattern
				sPattern = sPattern.replace(/\./g, "/");

				if (sPattern[0] === "/") {
					sPattern = "**" + sPattern;
				}
				if (sPattern.endsWith("/") && !sPattern.endsWith("**/")) {
					sPattern = sPattern + "**";
				}
				if (sPattern.endsWith("**")) {
					sPattern = sPattern + "/*";
				}
				// quote characters that might have been used but have a special meaning in regular expressions
				// TODO: clarify is this regex is valid
				// eslint-disable-next-line no-useless-escape
				sPattern = sPattern.replace(/[\[\]\(\)\.]/g, "\\$&");
				// our wildcard '*' means 'any name segment, but not multiple components'
				sPattern = sPattern.replace(/\*/g, "[^/]*");
				// our wildcard '**/' means 'any number of name segments'
				sPattern = sPattern.replace(
					/\[\^\/\]\*\[\^\/\]\*\//g,
					"([^/]+[/])*"
				);
				sPattern = "(" + sPattern + ")";
				// add the resources path to the pattern
				sPattern = "/resources/(" + sPattern + ")(-dbg)?.js$";

				aExcludes.push(new RegExp(sPattern));
			}
		}
	}

	return aExcludes;
}

module.exports = {
	createInstrumenterConfig,
	shouldInstrumentResource,
	getLatestSourceMap,
};
