# OpenAPI Spec Discrepancies: PATCH /organizations/{organization}/databases/{database}/workflows/{number}/verify-data

## 1. Incorrect Type: `number`

| Field    | Spec Type | Actual Type |
| -------- | --------- | ----------- |
| `number` | `string`  | `number`    |

**Workaround**: The error schemas use `Schema.NumberFromString` to handle both cases.
