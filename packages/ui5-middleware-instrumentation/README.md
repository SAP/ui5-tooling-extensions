# UI5 Middleware Instrumentation

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
        reporter: ["html"],
        "report-dir": "./tmp/coverage-reports",
        watermarks: {
          statements: [50, 80],
          functions: [50, 80],
          branches: [50, 80],
          lines: [50, 80],
        },
      # Instrumenter Default Configuration
      instrument:
        produceSourceMap: true,
        coverageGlobalScope: "window.top",
        coverageGlobalScopeFunc: false,
      cwd: "./",
      excludePatterns:
      - "lib/"
      - "another/dir/in/webapp"
      - "yet/another/dir"
```

`cwd` [String]: Root folder

`excludePatterns` [Array]: Patterns to exclude from instrumenting.

`report` [Object]: Settings for the reporter.

`report.reporter` [Array]: The report type(s) that would be generated. List of all the available reports could be found [here](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-reports/lib)

`report["report-dir"]` [String]: Where the reports would be generated. Relative to `cwd`

`report.watermarks` [Object]: Coverage thresholds.

`instrument` [Object]: Settings for the instrumenter. Full set of the properties could be seen [here](https://github.com/istanbuljs/istanbuljs/blob/master/packages/istanbul-lib-instrument/src/instrumenter.js#L15)

## How it works

The custom middleware intercepts every `.js`-file before it is sent to the client. The file is then instrumented on-the-fly, including dynamic creation of a `sourcemap`.

The instrumented code and the `sourcemap` are subsequently delivered to the client instead of the original `.js`-file.

## Contributing

Please check our [Contribution Guidelines](https://github.com/SAP/ui5-tooling/blob/main/CONTRIBUTING.md).

## Support

Please follow our [Contribution Guidelines](https://github.com/SAP/ui5-tooling-extensions/blob/main/CONTRIBUTING.md#report-an-issue) on how to report an issue. Or chat with us in the [`#tooling`](https://openui5.slack.com/archives/C0A7QFN6B) channel of the [OpenUI5 Community Slack](https://ui5-slack-invite.cfapps.eu10.hana.ondemand.com/). For public Q&A, use the [`ui5-tooling` tag on Stack Overflow](https://stackoverflow.com/questions/tagged/ui5-tooling).
