# UI5 Middleware Instrumentation

This UI5 Tooling Server Middleware offeres code instrumentation powered by [istanbul](https://istanbul.js.org/). With that it's such easy to enable client-side coverage determination.

## Requirements

This middleware requires UI5 Tooling Version 3 and above.

## Install

```sh
npm install ui5-middleware-instrumentation --save-dev
```

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-instrumentation": "*"
    // ...
}
```

2. Configure it in `$yourapp/ui5.yaml`:

The configuration for the custom middleware:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-instrumentation
    afterMiddleware: compression
    configuration:
      # Reporter Default Configuration
      report:
        reporter: ["html"]
        "report-dir": "./tmp/coverage-reports"
        watermarks: {
          statements: [50, 80],
          functions: [50, 80],
          branches: [50, 80],
          lines: [50, 80],
        }
      # Instrumenter Default Configuration
      instrument:
        produceSourceMap: true
        coverageGlobalScope: "window.top"
        coverageGlobalScopeFunc: false
      cwd: "./"
      excludePatterns:
      - "lib/"
      - "another/dir/in/webapp"
      - "yet/another/dir"
```

3. Execute `ui5 serve` in the project root folder

4. Open "http://localhost:8080/test/unit/unitTests.qunit.html?coverage" in a browser of choice

5. See the coverage data

### Configuration

`cwd` [String]: Root folder

`excludePatterns` [Array]: Patterns to exclude from instrumenting.

`report` [Object]: Settings for the reporter.

`report.reporter` [Array]: The report type(s) that would be generated. List of all the available reports could be found [here](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-reports/lib)

`report["report-dir"]` [String]: Where the reports would be generated. Relative to `cwd`

`report.watermarks` [Object]: Coverage thresholds.

`instrument` [Object]: Settings for the instrumenter. Full set of the properties could be seen [here](https://github.com/istanbuljs/istanbuljs/blob/master/packages/istanbul-lib-instrument/src/instrumenter.js#L15)

## How it works

The middleware adds an HTTP endpoint to the development server which is requested by the `qunit-coverage.js` module included in the `sap.ui.core` library.

The custom middleware intercepts every `.js`-file before it is sent to the client. The file is then instrumented on-the-fly, including dynamic creation of a `sourcemap`.

The instrumented code and the `sourcemap` are subsequently delivered to the client instead of the original `.js`-file.

## Code of Conduct

Please check our [Code of Conduct](https://github.com/SAP/ui5-tooling-extensions/blob/main/CODE_OF_CONDUCT.md).

## Contributing

Please check our [Contribution Guidelines](https://github.com/SAP/ui5-tooling-extensions/blob/main/CONTRIBUTING.md).

## Support

Please follow our [Contribution Guidelines](https://github.com/SAP/ui5-tooling-extensions/blob/main/CONTRIBUTING.md#report-an-issue) on how to report an issue. Or chat with us in the [`#tooling`](https://openui5.slack.com/archives/C0A7QFN6B) channel of the [OpenUI5 Community Slack](https://ui5-slack-invite.cfapps.eu10.hana.ondemand.com/). For public Q&A, use the [`ui5-tooling` tag on Stack Overflow](https://stackoverflow.com/questions/tagged/ui5-tooling).

## Licensing

Copyright 2023 SAP SE or an SAP affiliate company and UI5 Tooling Extensions contributors. Please see our [LICENSE.txt](../../LICENSE.txt) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available via the [REUSE tool](https://api.reuse.software/info/github.com/SAP/ui5-tooling-extensions).
