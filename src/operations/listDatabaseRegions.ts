import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const ListDatabaseRegionsInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string }) => `/organizations/${input.organization}/databases/${input.database}/regions`,
});
export type ListDatabaseRegionsInput = typeof ListDatabaseRegionsInput.Type;

// Output Schema
export const ListDatabaseRegionsOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.Number,
  next_page_url: Schema.String,
  prev_page: Schema.Number,
  prev_page_url: Schema.String,
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
export type ListDatabaseRegionsOutput = typeof ListDatabaseRegionsOutput.Type;

// Error Schemas
export class ListDatabaseRegionsUnauthorized extends Schema.TaggedError<ListDatabaseRegionsUnauthorized>()(
  "ListDatabaseRegionsUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListDatabaseRegionsForbidden extends Schema.TaggedError<ListDatabaseRegionsForbidden>()(
  "ListDatabaseRegionsForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListDatabaseRegionsNotfound extends Schema.TaggedError<ListDatabaseRegionsNotfound>()(
  "ListDatabaseRegionsNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const listDatabaseRegions = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListDatabaseRegionsInput,
  outputSchema: ListDatabaseRegionsOutput,
  errors: [ListDatabaseRegionsUnauthorized, ListDatabaseRegionsForbidden, ListDatabaseRegionsNotfound],
}));
