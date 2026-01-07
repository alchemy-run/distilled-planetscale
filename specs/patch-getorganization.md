# OpenAPI Spec Discrepancies: GET /organizations/{organization}

This document tracks differences between the PlanetScale OpenAPI spec (`specs/openapi.json`) and the actual API behavior observed at runtime.

## 1. Missing Required Fields

The spec declares the following fields as **required**, but the API does not always return them:

- `billing_email`
- `plan`
- `valid_billing_info`
- `sso`
- `sso_directory`
- `single_tenancy`
- `managed_tenancy`
- `has_past_due_invoices`
- `database_count`
- `sso_portal_url`

**Workaround**: These fields are defined as optional in the client schema using `Schema.optionalWith(..., { as: "Option" })`.

## 2. Incorrect Type: `invoice_budget_amount`

| Field | Spec Type | Actual Type |
|-------|-----------|-------------|
| `invoice_budget_amount` | `number` | `string` (e.g., `"50.0"`) |

**Workaround**: The client schema uses `Schema.Union(Schema.Number, Schema.NumberFromString)` to handle both cases.

## Recommendations

1. Report these discrepancies to PlanetScale so the spec can be corrected.
2. Consider re-validating these assumptions when the spec is updated.
