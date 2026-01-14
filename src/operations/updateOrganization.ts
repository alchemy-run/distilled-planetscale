import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const UpdateOrganizationInput = Schema.Struct({
  organization: Schema.String,
  billing_email: Schema.optional(Schema.String),
  idp_managed_roles: Schema.optional(Schema.Boolean),
  invoice_budget_amount: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "PATCH",
  [ApiPath]: (input: { organization: string }) => `/organizations/${input.organization}`,
  [ApiPathParams]: ["organization"] as const,
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
  has_past_due_invoices: Schema.optional(Schema.Boolean),
  database_count: Schema.Number,
  sso_portal_url: Schema.optional(Schema.String),
  features: Schema.Unknown,
  idp_managed_roles: Schema.Boolean,
  invoice_budget_amount: Schema.String,
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
).pipe(Category.withAuthError) {}

export class UpdateOrganizationForbidden extends Schema.TaggedError<UpdateOrganizationForbidden>()(
  "UpdateOrganizationForbidden",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class UpdateOrganizationNotfound extends Schema.TaggedError<UpdateOrganizationNotfound>()(
  "UpdateOrganizationNotfound",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class UpdateOrganizationInternalservererror extends Schema.TaggedError<UpdateOrganizationInternalservererror>()(
  "UpdateOrganizationInternalservererror",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Update an organization
 *
 * @param organization - The name of the organization
 * @param billing_email - The billing email for the organization
 * @param idp_managed_roles - Whether or not the IdP provider is be responsible for managing roles in PlanetScale
 * @param invoice_budget_amount - The expected monthly budget for the organization
 */
export const updateOrganization = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateOrganizationInput,
  outputSchema: UpdateOrganizationOutput,
  errors: [UpdateOrganizationUnauthorized, UpdateOrganizationForbidden, UpdateOrganizationNotfound, UpdateOrganizationInternalservererror],
}));
