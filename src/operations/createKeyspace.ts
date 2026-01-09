import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const CreateKeyspaceInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  name: Schema.String,
  cluster_size: Schema.String,
  extra_replicas: Schema.optional(Schema.Number),
  shards: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/keyspaces`,
});
export type CreateKeyspaceInput = typeof CreateKeyspaceInput.Type;

// Output Schema
export const CreateKeyspaceOutput = Schema.Struct({
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
export type CreateKeyspaceOutput = typeof CreateKeyspaceOutput.Type;

// Error Schemas
export class CreateKeyspaceUnauthorized extends Schema.TaggedError<CreateKeyspaceUnauthorized>()(
  "CreateKeyspaceUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class CreateKeyspaceForbidden extends Schema.TaggedError<CreateKeyspaceForbidden>()(
  "CreateKeyspaceForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class CreateKeyspaceNotfound extends Schema.TaggedError<CreateKeyspaceNotfound>()(
  "CreateKeyspaceNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const createKeyspace = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateKeyspaceInput,
  outputSchema: CreateKeyspaceOutput,
  errors: [CreateKeyspaceUnauthorized, CreateKeyspaceForbidden, CreateKeyspaceNotfound],
}));
