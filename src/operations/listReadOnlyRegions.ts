import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const ListReadOnlyRegionsInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string }) => `/organizations/${input.organization}/databases/${input.database}/read-only-regions`,
});
export type ListReadOnlyRegionsInput = typeof ListReadOnlyRegionsInput.Type;

// Output Schema
export const ListReadOnlyRegionsOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.NullOr(Schema.Number),
  next_page_url: Schema.NullOr(Schema.String),
  prev_page: Schema.NullOr(Schema.Number),
  prev_page_url: Schema.NullOr(Schema.String),
  data: Schema.Array(Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    ready_at: Schema.String,
    ready: Schema.Boolean,
    actor: Schema.Struct({
      id: Schema.String,
      display_name: Schema.String,
      avatar_url: Schema.String,
    }),
    region: Schema.Struct({
      id: Schema.String,
      provider: Schema.String,
      enabled: Schema.Boolean,
      public_ip_addresses: Schema.Array(Schema.String),
      display_name: Schema.String,
      location: Schema.String,
      slug: Schema.String,
      current_default: Schema.Boolean,
    }),
  })),
});
export type ListReadOnlyRegionsOutput = typeof ListReadOnlyRegionsOutput.Type;

// Error Schemas
export class ListReadOnlyRegionsUnauthorized extends Schema.TaggedError<ListReadOnlyRegionsUnauthorized>()(
  "ListReadOnlyRegionsUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListReadOnlyRegionsForbidden extends Schema.TaggedError<ListReadOnlyRegionsForbidden>()(
  "ListReadOnlyRegionsForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListReadOnlyRegionsNotfound extends Schema.TaggedError<ListReadOnlyRegionsNotfound>()(
  "ListReadOnlyRegionsNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * List read-only regions
 *
 * List read-only regions for the database's default branch
 *
 * @param organization - The name of the organization the database belongs to
 * @param database - The name of the database
 * @param page - If provided, specifies the page offset of returned results
 * @param per_page - If provided, specifies the number of returned results
 */
export const listReadOnlyRegions = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListReadOnlyRegionsInput,
  outputSchema: ListReadOnlyRegionsOutput,
  errors: [ListReadOnlyRegionsUnauthorized, ListReadOnlyRegionsForbidden, ListReadOnlyRegionsNotfound],
}));
