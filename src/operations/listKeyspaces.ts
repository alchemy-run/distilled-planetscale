import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const ListKeyspacesInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/keyspaces`,
});
export type ListKeyspacesInput = typeof ListKeyspacesInput.Type;

// Output Schema
export const ListKeyspacesOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.NullOr(Schema.Number),
  next_page_url: Schema.NullOr(Schema.String),
  prev_page: Schema.NullOr(Schema.Number),
  prev_page_url: Schema.NullOr(Schema.String),
  data: Schema.Array(Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    shards: Schema.Number,
    sharded: Schema.Boolean,
    replicas: Schema.Number,
    extra_replicas: Schema.Number,
    created_at: Schema.String,
    updated_at: Schema.String,
    cluster_name: Schema.String,
    cluster_display_name: Schema.String,
    resizing: Schema.Boolean,
    resize_pending: Schema.Boolean,
    ready: Schema.Boolean,
    metal: Schema.Boolean,
    default: Schema.Boolean,
    imported: Schema.Boolean,
    vector_pool_allocation: Schema.Number,
    replication_durability_constraints: Schema.Struct({
      strategy: Schema.Literal("available", "lag", "always"),
    }),
    vreplication_flags: Schema.Struct({
      optimize_inserts: Schema.Boolean,
      allow_no_blob_binlog_row_image: Schema.Boolean,
      vplayer_batching: Schema.Boolean,
    }),
  })),
});
export type ListKeyspacesOutput = typeof ListKeyspacesOutput.Type;

// Error Schemas
export class ListKeyspacesUnauthorized extends Schema.TaggedError<ListKeyspacesUnauthorized>()(
  "ListKeyspacesUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListKeyspacesForbidden extends Schema.TaggedError<ListKeyspacesForbidden>()(
  "ListKeyspacesForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListKeyspacesNotfound extends Schema.TaggedError<ListKeyspacesNotfound>()(
  "ListKeyspacesNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const listKeyspaces = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListKeyspacesInput,
  outputSchema: ListKeyspacesOutput,
  errors: [ListKeyspacesUnauthorized, ListKeyspacesForbidden, ListKeyspacesNotfound],
}));
