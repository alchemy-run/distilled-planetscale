# OpenAPI Spec Discrepancies: GET /organizations/{organization}/databases/{database}/deploy-requests/{number}/throttler

## 1. Incorrect Type: `number` in error schemas

| Field    | Spec Type | Actual Type |
| -------- | --------- | ----------- |
| `number` | `string`  | `number`    |

The input schema correctly uses `number` for the deploy request number parameter, but the error schemas in the OpenAPI spec incorrectly define it as `string`.

**Workaround**: The error schemas use `Schema.NumberFromString` to handle both cases.
