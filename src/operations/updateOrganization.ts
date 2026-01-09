import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const UpdateOrganizationInput = Schema.Struct({
  organization: Schema.String,
  billing_email: Schema.optional(Schema.String),
  idp_managed_roles: Schema.optional(Schema.Boolean),
  invoice_budget_amount: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "PATCH",
  [ApiPath]: (input: { organization: string }) => `/organizations/${input.organization}`,
});
export type UpdateOrganizationInput = typeof UpdateOrganizationInput.Type;

// Output Schema
export const UpdateOrganizationOutput = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  billing_email: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  plan: Schema.String,
  valid_billing_info: Schema.Boolean,
  sso: Schema.Boolean,
  sso_directory: Schema.Boolean,
  single_tenancy: Schema.Boolean,
  managed_tenancy: Schema.Boolean,
  has_past_due_invoices: Schema.Boolean,
  database_count: Schema.Number,
  sso_portal_url: Schema.String,
  features: Schema.Unknown,
  idp_managed_roles: Schema.Boolean,
  invoice_budget_amount: Schema.Number,
  keyspace_shard_limit: Schema.Number,
  has_card: Schema.Boolean,
  payment_info_required: Schema.Boolean,
});
export type UpdateOrganizationOutput = typeof UpdateOrganizationOutput.Type;

// Error Schemas
export class UpdateOrganizationUnauthorized extends Schema.TaggedError<UpdateOrganizationUnauthorized>()(
  "UpdateOrganizationUnauthorized",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class UpdateOrganizationForbidden extends Schema.TaggedError<UpdateOrganizationForbidden>()(
  "UpdateOrganizationForbidden",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class UpdateOrganizationNotfound extends Schema.TaggedError<UpdateOrganizationNotfound>()(
  "UpdateOrganizationNotfound",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const updateOrganization = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateOrganizationInput,
  outputSchema: UpdateOrganizationOutput,
  errors: [UpdateOrganizationUnauthorized, UpdateOrganizationForbidden, UpdateOrganizationNotfound],
}));
