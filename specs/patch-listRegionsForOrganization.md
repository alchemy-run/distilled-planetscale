# OpenAPI Spec Discrepancies: GET /organizations/{organization}/regions

## 1. Nullable Pagination Fields

| Field          | Spec Type | Actual Type        |
| -------------- | --------- | ------------------ |
| `next_page`    | `number`  | `number` or `null` |
| `next_page_url`| `string`  | `string` or `null` |
| `prev_page`    | `number`  | `number` or `null` |
| `prev_page_url`| `string`  | `string` or `null` |

**Workaround**: The output schema uses `Schema.NullOr()` to handle both number/string and null values for pagination fields.
