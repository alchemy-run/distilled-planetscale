# OpenAPI Spec Discrepancies: GET /organizations/{organization}/databases/{database}/workflows/{number}

## 1. Incorrect Type: `number` in Error Schemas

| Field    | Spec Type | Actual Type |
| -------- | --------- | ----------- |
| `number` | `string`  | `number`    |

The input schema correctly uses `number: Schema.Number` for the workflow number, but the OpenAPI spec defines error response properties as strings.

**Workaround**: The error schemas (`GetWorkflowUnauthorized`, `GetWorkflowForbidden`, `GetWorkflowNotfound`) use `Schema.NumberFromString` to handle both cases.
