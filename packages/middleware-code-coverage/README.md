# UI5 Middleware Instrumentation

This UI5 Tooling Server Middleware offeres code instrumentation powered by [istanbul](https://istanbul.js.org/). With that it's such easy to enable client-side coverage determination.

[![Coverage Status](https://coveralls.io/repos/github/SAP/ui5-tooling-extensions/badge.svg)](https://coveralls.io/github/SAP/ui5-tooling-extensions)
[![OpenUI5 Community Slack (#tooling channel)](https://img.shields.io/badge/slack-join-44cc11.svg)](https://ui5-slack-invite.cfapps.eu10.hana.ondemand.com/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)
[![Fosstars security rating](https://github.com/SAP/ui5-tooling-extensions/blob/fosstars-report/fosstars_badge.svg)](https://github.com/SAP/ui5-tooling-extensions/blob/fosstars-report/fosstars_report.md)
[![REUSE status](https://api.reuse.software/badge/github.com/SAP/ui5-tooling-extensions)](https://api.reuse.software/info/github.com/SAP/ui5-tooling-extensions)

## Requirements

This middleware requires UI5 Tooling Version 3 and above.

## Install

```sh
npm install @ui5/middleware-code-coverage --save-dev
```

## Usage

1. Configure it in `$yourapp/ui5.yaml`:

    The configuration for the custom middleware:

    ```yaml
    server:
      customMiddleware:
      - name: "@ui5/middleware-code-coverage"
        afterMiddleware: compression
        configuration:
          report:
            reporter: ["html"]
            "report-dir": "./tmp/coverage-reports"
            watermarks: {
              statements: [50, 80],
              functions: [50, 80],
              branches: [50, 80],
              lines: [50, 80]
            }
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

2. Change the qunit coverage module `qunit-coverage.js` to `qunit-coverage-istandbul.js` in your test html files

    **Old:**

    ```html title="unitTests.qunit.html"
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Unit tests for OpenUI5 App</title>

        <script id="sap-ui-bootstrap" src="../../resources/sap-ui-core.js"
          data-sap-ui-theme="sap_horizon"
          data-sap-ui-resourceroots='{
            "ui5.sample": "../../"
          }' data-sap-ui-language="EN" data-sap-ui-async="true">
        </script>

        <link rel="stylesheet" type="text/css" href="../../resources/sap/ui/thirdparty/qunit-2.css">

        <script src="../../resources/sap/ui/thirdparty/qunit-2.js"></script>
        <script src="../../resources/sap/ui/qunit/qunit-junit.js"></script>
        <script src="../../resources/sap/ui/qunit/qunit-coverage.js"
          data-sap-ui-cover-only="ui5/sample/"
          data-sap-ui-cover-never="ui5/sample/test/"></script>
        <script src="../../resources/sap/ui/thirdparty/sinon.js"></script>
        <script src="../../resources/sap/ui/thirdparty/sinon-qunit.js"></script>

        <script src="unitTests.qunit.js"></script>
    </head>
    <body>
        <div id="qunit"></div>
        <div id="qunit-fixture"></div>
    </body>
    </html>
    ```

    **New:**

    ```html title="unitTests.qunit.html"
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Unit tests for OpenUI5 App</title>

        <script id="sap-ui-bootstrap" src="../../resources/sap-ui-core.js"
          data-sap-ui-theme="sap_horizon"
          data-sap-ui-resourceroots='{
            "ui5.sample": "../../"
          }' data-sap-ui-language="EN" data-sap-ui-async="true">
        </script>

        <link rel="stylesheet" type="text/css" href="../../resources/sap/ui/thirdparty/qunit-2.css">

        <script src="../../resources/sap/ui/thirdparty/qunit-2.js"></script>
        <script src="../../resources/sap/ui/qunit/qunit-junit.js"></script>
        <script src="../../resources/sap/ui/qunit/qunit-coverage-istanbul.js"
          data-sap-ui-cover-only="ui5/sample/"
          data-sap-ui-cover-never="ui5/sample/test/"></script>
        <script src="../../resources/sap/ui/thirdparty/sinon.js"></script>
        <script src="../../resources/sap/ui/thirdparty/sinon-qunit.js"></script>

        <script src="unitTests.qunit.js"></script>
    </head>
    <body>
        <div id="qunit"></div>
        <div id="qunit-fixture"></div>
    </body>
    </html>
    ```

3. Execute `ui5 serve` in the project root folder

4. Open "http://localhost:8080/test/unit/unitTests.qunit.html?coverage" in a browser of choice

5. Check the code coverage
  ![UI5 logo](./docs/images/sample-app-coverage-data.png)

### Configuration

`cwd` [String]: Root folder. Defaults to `"./"` of the project consuming the middleware.

`excludePatterns` [Array]: Patterns to exclude from instrumenting. Defaults to `[]`.

`report` [Object]: Settings for the reporter.

`report.reporter` [Array]: The report type(s) that would be generated. List of all the available reports could be found [here](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-reports/lib). Defaults to `["html"]`.

`report["report-dir"]` [String]: Where the reports would be generated. Relative to `cwd`. Defaults to `"./tmp/coverage-reports"`.

`report.watermarks` [Object]: Coverage thresholds. See [High and Low Watermarks](https://github.com/istanbuljs/nyc/blob/ab7c53b2f340b458789a746dff2abd3e2e4790c3/README.md#high-and-low-watermarks) for further details.

Defaults to:

```js
{
    statements: [50, 80],
    functions: [50, 80],
    branches: [50, 80],
    lines: [50, 80]
}
```

`instrument` [Object]: Settings for the instrumenter. Full set of the properties could be seen [here](https://github.com/istanbuljs/istanbuljs/blob/master/packages/istanbul-lib-instrument/src/instrumenter.js#L15).

Defaults to:

```js
{
    produceSourceMap: true,
    coverageGlobalScope: "window.top",
    coverageGlobalScopeFunc: false
}
```

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
