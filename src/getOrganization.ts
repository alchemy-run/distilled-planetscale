import { Schema } from "effect";
import { ApiErrorCode, makeOperation } from "./client";

// Input Schema
export const GetOrganizationInput = Schema.Struct({
  name: Schema.String,
});
export type GetOrganizationInput = typeof GetOrganizationInput.Type;

// Output Schema
export const Organization = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  billing_email: Schema.optional(Schema.String),
  created_at: Schema.String,
  updated_at: Schema.String,
  plan: Schema.optional(Schema.String),
  valid_billing_info: Schema.optional(Schema.Boolean),
  sso: Schema.optional(Schema.Boolean),
  sso_directory: Schema.optional(Schema.Boolean),
  single_tenancy: Schema.optional(Schema.Boolean),
  managed_tenancy: Schema.optional(Schema.Boolean),
  has_past_due_invoices: Schema.optional(Schema.Boolean),
  database_count: Schema.optional(Schema.Number),
  sso_portal_url: Schema.optional(Schema.String),
  features: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  idp_managed_roles: Schema.optional(Schema.Boolean),
  invoice_budget_amount: Schema.optional(Schema.Union(Schema.Number, Schema.NumberFromString)),
  keyspace_shard_limit: Schema.optional(Schema.Number),
  has_card: Schema.optional(Schema.Boolean),
  payment_info_required: Schema.optional(Schema.Boolean),
});
export type Organization = typeof Organization.Type;

// Error Schemas
export class OrganizationNotFound extends Schema.TaggedError<OrganizationNotFound>()(
  "OrganizationNotFound",
  {
    name: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const getOrganization = makeOperation({
  method: "GET",
  path: (input) => `/organizations/${input.name}`,
  inputSchema: GetOrganizationInput,
  outputSchema: Organization,
  errors: [OrganizationNotFound],
});
