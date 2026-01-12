# OpenAPI Spec Discrepancies: GET /regions

## 1. Nullable Pagination Fields

| Field          | Spec Type | Actual Type      |
| -------------- | --------- | ---------------- |
| `next_page`    | `number`  | `number \| null` |
| `next_page_url`| `string`  | `string \| null` |
| `prev_page`    | `number`  | `number \| null` |
| `prev_page_url`| `string`  | `string \| null` |

**Observed behavior**: When there is only one page of results, the API returns `null` for these pagination fields instead of a default value.

**Workaround**: The output schema uses `Schema.NullOr()` for these fields to accept both the expected type and `null`.
