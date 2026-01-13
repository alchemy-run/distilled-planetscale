import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const UpdateKeyspaceInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  keyspace: Schema.String,
}).annotations({
  [ApiMethod]: "PATCH",
  [ApiPath]: (input: { organization: string; database: string; branch: string; keyspace: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/keyspaces/${input.keyspace}`,
});
export type UpdateKeyspaceInput = typeof UpdateKeyspaceInput.Type;

// Output Schema
export const UpdateKeyspaceOutput = Schema.Struct({
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
});
export type UpdateKeyspaceOutput = typeof UpdateKeyspaceOutput.Type;

// Error Schemas
export class UpdateKeyspaceUnauthorized extends Schema.TaggedError<UpdateKeyspaceUnauthorized>()(
  "UpdateKeyspaceUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class UpdateKeyspaceForbidden extends Schema.TaggedError<UpdateKeyspaceForbidden>()(
  "UpdateKeyspaceForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class UpdateKeyspaceNotfound extends Schema.TaggedError<UpdateKeyspaceNotfound>()(
  "UpdateKeyspaceNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Configure keyspace settings
 *
 * @param organization - The name of the organization the branch belongs to
 * @param database - The name of the database the branch belongs to
 * @param branch - The name of the branch
 * @param keyspace - The name of the keyspace
 */
export const updateKeyspace = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateKeyspaceInput,
  outputSchema: UpdateKeyspaceOutput,
  errors: [UpdateKeyspaceUnauthorized, UpdateKeyspaceForbidden, UpdateKeyspaceNotfound],
}));
