# OpenAPI Spec Discrepancies: PATCH /organizations/{organization}/databases/{database}/workflows/{number}/switch-primaries

## 1. Incorrect Type: `number` in error schemas

| Field    | Spec Type | Actual Type |
| -------- | --------- | ----------- |
| `number` | `string`  | `number`    |

The input schema has `number: Schema.Number`, but the OpenAPI spec defines the error response `number` field as a string. When the client constructs error objects, it passes the input `number` (a number) directly to the error constructor, which expects a string.

**Workaround**: The error schemas (`WorkflowSwitchPrimariesUnauthorized`, `WorkflowSwitchPrimariesForbidden`, `WorkflowSwitchPrimariesNotfound`) use `Schema.NumberFromString` for the `number` field to handle both numbers and strings.
