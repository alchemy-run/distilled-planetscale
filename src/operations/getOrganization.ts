import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const GetOrganizationInput = Schema.Struct({
  organization: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string }) => `/organizations/${input.organization}`,
  [ApiPathParams]: ["organization"] as const,
});
export type GetOrganizationInput = typeof GetOrganizationInput.Type;

// Output Schema
export const GetOrganizationOutput = Schema.Struct({
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
export type GetOrganizationOutput = typeof GetOrganizationOutput.Type;

// Error Schemas
export class GetOrganizationUnauthorized extends Schema.TaggedError<GetOrganizationUnauthorized>()(
  "GetOrganizationUnauthorized",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class GetOrganizationForbidden extends Schema.TaggedError<GetOrganizationForbidden>()(
  "GetOrganizationForbidden",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class GetOrganizationNotfound extends Schema.TaggedError<GetOrganizationNotfound>()(
  "GetOrganizationNotfound",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class GetOrganizationInternalservererror extends Schema.TaggedError<GetOrganizationInternalservererror>()(
  "GetOrganizationInternalservererror",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Get an organization
 *
 * @param organization - The name of the organization
 */
export const getOrganization = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetOrganizationInput,
  outputSchema: GetOrganizationOutput,
  errors: [GetOrganizationUnauthorized, GetOrganizationForbidden, GetOrganizationNotfound, GetOrganizationInternalservererror],
}));
