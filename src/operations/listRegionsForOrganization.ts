import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const ListRegionsForOrganizationInput = Schema.Struct({
  organization: Schema.String,
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string }) => `/organizations/${input.organization}/regions`,
});
export type ListRegionsForOrganizationInput = typeof ListRegionsForOrganizationInput.Type;

// Output Schema
export const ListRegionsForOrganizationOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.NullOr(Schema.Number),
  next_page_url: Schema.NullOr(Schema.String),
  prev_page: Schema.NullOr(Schema.Number),
  prev_page_url: Schema.NullOr(Schema.String),
  data: Schema.Array(Schema.Struct({
    id: Schema.String,
    provider: Schema.String,
    enabled: Schema.Boolean,
    public_ip_addresses: Schema.Array(Schema.String),
    display_name: Schema.String,
    location: Schema.String,
    slug: Schema.String,
    current_default: Schema.Boolean,
  })),
});
export type ListRegionsForOrganizationOutput = typeof ListRegionsForOrganizationOutput.Type;

// Error Schemas
export class ListRegionsForOrganizationUnauthorized extends Schema.TaggedError<ListRegionsForOrganizationUnauthorized>()(
  "ListRegionsForOrganizationUnauthorized",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListRegionsForOrganizationForbidden extends Schema.TaggedError<ListRegionsForOrganizationForbidden>()(
  "ListRegionsForOrganizationForbidden",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListRegionsForOrganizationNotfound extends Schema.TaggedError<ListRegionsForOrganizationNotfound>()(
  "ListRegionsForOrganizationNotfound",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const listRegionsForOrganization = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListRegionsForOrganizationInput,
  outputSchema: ListRegionsForOrganizationOutput,
  errors: [ListRegionsForOrganizationUnauthorized, ListRegionsForOrganizationForbidden, ListRegionsForOrganizationNotfound],
}));
