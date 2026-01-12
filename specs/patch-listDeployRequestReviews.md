# OpenAPI Spec Discrepancies: GET /organizations/{organization}/databases/{database}/deploy-requests/{number}/reviews

## 1. Incorrect Type: `number` in Error Schemas

| Field    | Spec Type | Actual Type |
| -------- | --------- | ----------- |
| `number` | `string`  | `number`    |

**Workaround**: The error schemas use `Schema.NumberFromString` to handle both cases.
