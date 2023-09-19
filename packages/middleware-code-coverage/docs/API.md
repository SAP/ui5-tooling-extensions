# API

This REST API is the underlying foundation of the middleware.

**Note:** The `/.ui5/` path is reserved for UI5 Core modules and must not be used for third-party modules.

---
### GET `{path/to/resource}?instrument=true`

A resource could be instrumented for code coverage by appending `?instrument=true` as a query parameter. **Note:** If a resource has already been excluded via `excludePatterns` in the middleware's configuration, the query parameter is ignored.

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

Health check. Useful when checking for the middleware's existence.

**Example:**

```js
fetch("/.ui5/coverage/ping", {
  method: "GET",
});
```

---

### POST `/.ui5/coverage/report`

Sends `__coverage__` data to the middleware. A static report is generated with the data provided. Reports can be accessed via the `/.ui5/coverage/report/${reportType}` route. The available report types can be found [here](https://github.com/istanbuljs/istanbuljs/tree/73c25ce79f91010d1ff073aa6ff3fd01114f90db/packages/istanbul-reports/lib).  

**Note:** Report types can be defined and limited via the middleware's configuration.

**Note:** You can also provide report settings from the front end via the request body. Currently, only [`watermarks`](https://github.com/istanbuljs/nyc/blob/ab7c53b2f340b458789a746dff2abd3e2e4790c3/README.md#high-and-low-watermarks) are supported (available since UI5 1.119.0). Front end-defined settings take precedence over default or `ui5.yaml`-configured ones. For their usage in OpenUI5 HTML test pages, see the [Front-End Configuration](../README.md#frontend-configuration) section of the main document.

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

## Custom Integration

Below is an example of a sample scenario to integrate UI5 Middleware Code Coverage.

```js
// A module in the browser

const isMiddlewareAvailable = await fetch("/.ui5/coverage/ping", {
  method: "GET",
});

if (isMiddlewareAvailable) {
  
  const generatedReports = await fetch("/.ui5/coverage/report", {
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
