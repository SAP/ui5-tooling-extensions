# UI5 Middleware Code Coverage

This UI5 Tooling Server Middleware offers code instrumentation powered by [Istanbul](https://istanbul.js.org/). This makes it easy to enable client-side coverage determination.

[![Coverage Status](https://coveralls.io/repos/github/SAP/ui5-tooling-extensions/badge.svg)](https://coveralls.io/github/SAP/ui5-tooling-extensions)
[![OpenUI5 Community Slack (#tooling channel)](https://img.shields.io/badge/slack-join-44cc11.svg)](https://join.slack.com/t/openui5/shared_invite/zt-1q128gn3p-JeZTi9XCpPxW8kBohSgqnw)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)
[![Fosstars security rating](https://github.com/SAP/ui5-tooling-extensions/blob/fosstars-report/fosstars_badge.svg)](https://github.com/SAP/ui5-tooling-extensions/blob/fosstars-report/fosstars_report.md)
[![REUSE status](https://api.reuse.software/badge/github.com/SAP/ui5-tooling-extensions)](https://api.reuse.software/info/github.com/SAP/ui5-tooling-extensions)

## Sample

You find this middleware in action in an adjusted version of the [OpenUI5 Sample App (branch `middleware-code-coverage`)](https://github.com/SAP/openui5-sample-app/tree/middleware-code-coverage).

## Requirements

This middleware requires UI5 Tooling v3 and is meant for UI5 1.113 and above.
> **Warning**
>
> The `qunit-coverage-istanbul.js` module is planned to be part of OpenUI5 1.113.0, which is not released yet. If you would like to try out the code coverage module beforehand, use the nightly CDN version of UI5 when bootstrapping your tests.

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

2. Change the qunit coverage module `qunit-coverage.js` to `qunit-coverage-istanbul.js` in your test html files

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

4. Open "http://localhost:8080/test/unit/unitTests.qunit.html?coverage" in a browser of your choice

5. Check the code coverage
  ![UI5 logo](./docs/images/sample-app-coverage-data.png)

### Configuration

`cwd` [String]: Root folder. Defaults to `"./"` of the project consuming the middleware.

`excludePatterns` [Array]: Patterns to exclude from instrumenting. Defaults to `[]`.

`report` [Object]: Settings for the reporter.

`report.reporter` [Array]: The report type(s) that would be generated. A list of all the available reports could be found [here](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-reports/lib). Defaults to `["html"]`.

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

`instrument` [Object]: Settings for the instrumenter. A full set of properties could be seen [here](https://github.com/istanbuljs/istanbuljs/blob/master/packages/istanbul-lib-instrument/src/instrumenter.js#L15).

Defaults to:

```js
{
    produceSourceMap: true,
    coverageGlobalScope: "window.top",
    coverageGlobalScopeFunc: false
}
```

## How it works

The middleware adds an HTTP endpoint to the development server.

The custom middleware intercepts every `.js`-file before it is sent to the client. The file is then instrumented on the fly, including the dynamic creation of a `sourcemap`.

The instrumented code and the `sourcemap` are subsequently delivered to the client instead of the original `.js`-file.

## API

This REST API is the underlying foundation of the middleware.

**Note:** The `/.ui5/` path is reserved for UI5 Core modules and must not be used for third-party modules.

---
### GET `{path/to/resource}?instrument=true`

A resource could be instrumented for code coverage by appending `?instrument=true` as a query parameter. **Note:** If a resource has already been excluded via `excludePatterns` in middleware's configuration, the query parameter is ignored.

**Example:**

```js
// OpenUI5

GET /resources/sap/m/ComboBox.js?instrument=true
GET /resources/sap/m/ComboBoxBase.js?instrument=true
GET /resources/sap/m/ComboBoxBaseRenderer.js?instrument=true
GET /resources/sap/m/ComboBoxRenderer.js?instrument=true
GET /resources/sap/m/ComboBoxTextField.js?instrument=true
GET /resources/sap/m/ComboBoxTextFieldRenderer.js?instrument=true
```

---

### GET `/.ui5/coverage/ping`

Healthcheck. Useful when checking for the middleware's existence.

**Example:**

```js
fetch("/.ui5/coverage/ping", {
  method: "GET",
});
```

---

### POST `/.ui5/coverage/report`

Sends `__coverage__` data to the middleware. A static report is generated with the provided data. Reports could be accessed via the `/.ui5/coverage/report/${reportType}` route. The available report types could be found [here](https://github.com/istanbuljs/istanbuljs/tree/73c25ce79f91010d1ff073aa6ff3fd01114f90db/packages/istanbul-reports/lib).  

**Note:** Report types could be defined and limited via the middleware's configuration.

**Example:**

```js
fetch("/.ui5/coverage/report", {
  method: "POST",
  body: JSON.stringify(window.__coverage__),
  headers: {
    "Content-Type": "application/json",
  },
});
```

---

### GET `/.ui5/coverage/report/${reportType}`

Returns the generated report(s) from the last generation via the `/.ui5/coverage/report` route.

**Example:**

```js
GET /.ui5/coverage/report/html
GET /.ui5/coverage/report/lcov
```

## Integration

The middleware is integrated into OpenUI5 out of the box, but it is not limited just to it. With the configuration and the public API, developers could set up the middleware to suit their projects' needs.

### OpenUI5 QUnit Integration

The `qunit-coverage-istanbul.js` (part of `sap.ui.core` library) file requests the instrumented source files by the middleware. While the tests are running, `qunit-coverage-istanbul.js` takes care of collecting and storing the coverage records into the `window.__coverage__` global variable. After the tests are executed, `qunit-coverage-istanbul.js` sends this data to the middleware, which then generates the code coverage report. Afterwards, the code coverage is displayed on the test page.

### Custom Integration

Below is an example of a sample scenario to integrate UI5 Middleware Code Coverage.

```js
// A module in the browser

const isMiddlewareAvailable = await fetch("/.ui5/coverage/ping", {
  method: "GET",
});

if (isMiddlewareAvailable) {
  
  const generatedReports = await fetch("/.ui5/coverage/report", {
    method: "POST",
    body: JSON.stringify(window.__coverage__),
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Extract the html report from the list of reports
  const htmlReport = generatedReports.availableReports.find(
    (report) => report.report === "html"
  );
  
  if (htmlReport) {
    
    const body = document.body;
    const iFrameElem = document.createElement("iframe");
    
    iFrameElem.src = "/.ui5/coverage/report/" + htmlReport.destination;
    iFrameElem.style.border = "none";
    iFrameElem.style.width = "100%";
    iFrameElem.style.height = "100vh";
    iFrameElem.sandbox = "allow-scripts";

    body.appendChild(iFrameElem);
    
  }
}
```

## Code of Conduct

Please check our [Code of Conduct](https://github.com/SAP/ui5-tooling-extensions/blob/main/CODE_OF_CONDUCT.md).

## Contributing

Please check our [Contribution Guidelines](https://github.com/SAP/ui5-tooling-extensions/blob/main/CONTRIBUTING.md).

## Support

Please follow our [Contribution Guidelines](https://github.com/SAP/ui5-tooling-extensions/blob/main/CONTRIBUTING.md#report-an-issue) on how to report an issue. Or chat with us in the [`#tooling`](https://openui5.slack.com/archives/C0A7QFN6B) channel of the [OpenUI5 Community Slack](https://join.slack.com/t/openui5/shared_invite/zt-1q128gn3p-JeZTi9XCpPxW8kBohSgqnw). For public Q&A, use the [`ui5-tooling` tag on Stack Overflow](https://stackoverflow.com/questions/tagged/ui5-tooling).

## Licensing

Copyright 2023 SAP SE or an SAP affiliate company and UI5 Tooling Extensions contributors. Please see our [LICENSE.txt](../../LICENSE.txt) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available via the [REUSE tool](https://api.reuse.software/info/github.com/SAP/ui5-tooling-extensions).
