# OpenAPI Spec Discrepancies: GET /organizations/{organization}/databases/{database}/deploy-requests/{number}/deployment

This document tracks differences between the PlanetScale OpenAPI spec (`specs/openapi.json`) and the actual API behavior observed at runtime.

## 1. Incorrect Type: `number` path parameter in error responses

| Field    | Spec Type | Actual Type                  |
| -------- | --------- | ---------------------------- |
| `number` | `string`  | `number` (e.g., `1`, `999`)  |

The input schema expects `number` as a `Number`, but the error schemas were generated expecting `String`. When the client passes the input properties to error constructors, the `number` field is passed as a number, causing a schema validation failure.

**Workaround**: The error schemas use `Schema.NumberFromString` to handle both cases - the input passes a number, and if the API returns a string representation, it will be coerced.

## Recommendations

1. Report these discrepancies to PlanetScale so the spec can be corrected.
2. Consider re-validating these assumptions when the spec is updated.
