# OpenAPI Spec Discrepancies: PATCH /organizations/{organization}/databases/{database}/deploy-requests/{number}/throttler

## 1. Incorrect Type: `number`

| Field    | Spec Type | Actual Type |
| -------- | --------- | ----------- |
| `number` | `string`  | `number`    |

The `number` path parameter is typed as a string in the error schemas, but the input schema correctly types it as a number (deploy request numbers are integers).

**Workaround**: The error schemas use `Schema.NumberFromString` to handle both cases.
