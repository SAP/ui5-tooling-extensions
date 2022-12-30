import {
	createInstrumenterConfig,
	shouldInstrumentResource,
	getLatestSourceMap} from "./util.js";
import {createInstrumenter} from "istanbul-lib-instrument";
import reportCoverage from "./coverage-reporter.js";
import bodyParser from "body-parser";
import Router from "router";
import path from "node:path";
import express from "express";
import {promisify} from "node:util";

/**
 * Custom middleware to instrument JS files with Istanbul.
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/StandardLogger} parameters.log
 *      Logger instance for use in the custom middleware.
 *      This parameter is only provided to custom middleware
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 * 										[MiddlewareUtil]{https://sap.github.io/ui5-tooling/v3/api/@ui5_server_middleware_MiddlewareUtil.html} instance
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 * 										root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 * 										the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 * 										the projects dependencies
 * @returns {function} Middleware function to use
 */
export default async function({log, middlewareUtil, options, resources}) {
	const config = await createInstrumenterConfig(
		options.configuration,
		resources.all
	);
	const {
		report: reportConfig,
		instrument: instrumentConfig,
		...generalConfig
	} = config;

	// Instrumenter instance
	const instrumenter = createInstrumenter(instrumentConfig);
	const instrument = promisify(instrumenter.instrument.bind(instrumenter));

	const router = new Router();

	/**
	 * Handles Reporting requests
	 *
	 * Example:
	 *   fetch("/.ui5/coverage/report", {
	 *       method: "POST",
	 *       body: JSON.stringify(window.__coverage__),
	 *       headers: {
	 *           'Content-Type': 'application/json'
	 *       },
	 *   });
	 *
	 */
	router.post(
		"/.ui5/coverage/report",
		bodyParser.json({type: "application/json", limit: "50mb"}),
		async (req, res, next) => {
			const reportData = await reportCoverage(
				req.body,
				config,
				resources,
				log
			);

			if (reportData) {
				res.json(reportData);
			} else {
				res.err("No report data provided");
			}
		}
	);

	/**
	 * Endpoint to check for middleware existence
	 */
	router.get("/.ui5/coverage/ping", (req, res) => {
		const {version} = require("../package.json");
		res.json({version});
	});

	/**
	 * Serves generated reportas as static assets
	 */
	reportConfig.reporter.forEach((reportType) =>
		router.use(
			`/.ui5/coverage/report/${reportType}`,
			express.static(
				path.join(config.cwd, reportConfig["report-dir"], reportType)
			)
		)
	);

	router.use(async (req, res, next) => {
		// Skip files which should not be instrumented
		if (!shouldInstrumentResource(req, generalConfig)) {
			next();
			return;
		}

		log.verbose(`handling ${req.path}...`);

		const pathname = middlewareUtil.getPathname(req);
		const matchedResource = await resources.all.byPath(pathname);

		if (!matchedResource) {
			log.warn(`${pathname} not found`);
			next();
			return;
		}

		const source = await matchedResource.getString();
		let instrumentedSource = await instrument(source, pathname);

		log.verbose(`...${pathname} instrumented!`);

		// Append sourceMap
		if (instrumentConfig.produceSourceMap) {
			instrumentedSource += getLatestSourceMap(instrumenter);

			log.verbose(`...${pathname} sourceMap embedded!`);
		}

		// send out instrumented source + source map
		res.type(".js");
		res.end(instrumentedSource);
	});

	return router;
}
