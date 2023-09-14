# API

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

**Note:** Also it is possible to set report settings from the frontend by providing them via the request body. Currently, only [`watermarks`](https://github.com/istanbuljs/nyc/blob/ab7c53b2f340b458789a746dff2abd3e2e4790c3/README.md#high-and-low-watermarks) are supported (Available since OpenUI5 1.119.0). Frontend defined settings take precedence over default or `ui5.yaml` configured ones. On how to use it in OpenUI5 HTML test pages, please refer to the [Usage](../README.md#usage) section of the main document.

**Example:**

```js
fetch("/.ui5/coverage/report", {
  method: "POST",
  body: JSON.stringify({
    coverage: window.__coverage__,
    watermarks: { // Optional: report setting
      statements: [75, 90],
      functions: [75, 90],
      branches: [75, 90],
      lines: [75, 90]
    }
  }),
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


## Licensing

Copyright 2023 SAP SE or an SAP affiliate company and UI5 Tooling Extensions contributors. Please see our [LICENSE.txt](../../LICENSE.txt) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available via the [REUSE tool](https://api.reuse.software/info/github.com/SAP/ui5-tooling-extensions).
