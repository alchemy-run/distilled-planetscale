# OpenAPI Spec Discrepancies: PATCH /organizations/{organization}/databases/{database}/workflows/{number}/reverse-cutover

## 1. Incorrect Type: `number` in Error Schemas

| Field    | Spec Type | Actual Type |
| -------- | --------- | ----------- |
| `number` | `string`  | `number`    |

The input schema correctly defines `number` as `Schema.Number`, but the OpenAPI spec defines the error response fields as strings.

**Workaround**: The error schemas (`WorkflowReverseCutoverUnauthorized`, `WorkflowReverseCutoverForbidden`, `WorkflowReverseCutoverNotfound`) use `Schema.NumberFromString` to handle both cases.
