# OpenAPI Spec Discrepancies: PATCH /organizations/{organization}/databases/{database}/workflows/{number}/cutover

## 1. Incorrect Type: `number`

| Field    | Spec Type | Actual Type |
| -------- | --------- | ----------- |
| `number` | `string`  | `number`    |

The input schema correctly uses `Schema.Number` for the workflow number, but the error schemas originally used `Schema.String` which caused a type mismatch when constructing error instances.

**Workaround**: The error schemas use `Schema.NumberFromString` to handle both cases.
