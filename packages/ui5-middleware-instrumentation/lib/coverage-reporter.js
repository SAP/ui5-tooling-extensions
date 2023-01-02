import libReport from "istanbul-lib-report";
import reports from "istanbul-reports";
import istanbulLibCoverage from "istanbul-lib-coverage";
import path from "node:path";

export default async function(globalCoverageMap, config, resources, log) {
	const coverageMap =
		istanbulLibCoverage.createCoverageMap(globalCoverageMap);
	const {report: reportConfig} = config;

	// Get & stash code from the resources
	// Later this would be needed to create the reports
	const coverageSources = await Promise.all(
		Object.keys(coverageMap.data).map(async (key) => {
			let source = "";

			const matchedResource = await resources.all.byPath(key);

			if (matchedResource) {
				source = await matchedResource.getString();
			} else {
				log.warn(
					`${key} not found! Detailed report can't be generated for that resource!`
				);
			}
			return {key, source};
		})
	).then((sources) =>
		sources.reduce(
			(acc, curElement) => acc.set(curElement.key, curElement.source),
			new Map()
		)
	);

	const reportResults = reportConfig.reporter.reduce((acc, reportType) => {
		// create a context for report generation
		const context = libReport.createContext({
			dir: path.join(config.cwd, reportConfig["report-dir"], reportType),
			watermarks: reportConfig.watermarks,
			coverageMap,
			sourceFinder: (path) => coverageSources.get(path),
		});

		// create an instance of the relevant report class, passing the
		// report name e.g. json/html/html-spa/text
		const report = reports.create(reportType);

		// call execute to synchronously create and write the report to disk
		report.execute(context);

		if (report.lcov) {
			acc.push({report: reportType, destination: [reportType, report.lcov.file].join("/")});
			acc.push({report: "html", destination: [reportType, report.html.subdir].join("/")});
		} else {
			acc.push({report: reportType, destination: [reportType, report.file].join("/")});
		}

		return acc;
	}, []);

	return {
		coverageMap: Object.keys(coverageMap.data),
		availableReports: reportResults
	};
}
