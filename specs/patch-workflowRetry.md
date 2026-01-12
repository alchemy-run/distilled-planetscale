# OpenAPI Spec Discrepancies: PATCH /organizations/{organization}/databases/{database}/workflows/{number}/retry

## 1. Incorrect Type: `number` in Error Schemas

| Field    | Spec Type | Actual Type |
| -------- | --------- | ----------- |
| `number` | `string`  | `number`    |

The `number` field is defined as a path parameter (and should be a number representing the workflow number), but the OpenAPI spec defines it as `string` in the error response schemas.

**Workaround**: The error schemas (`WorkflowRetryUnauthorized`, `WorkflowRetryForbidden`, `WorkflowRetryNotfound`) use `Schema.NumberFromString` to handle both cases - accepting numbers from the input and strings from the API response.
