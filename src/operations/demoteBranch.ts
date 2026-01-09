import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const DemoteBranchInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/demote`,
});
export type DemoteBranchInput = typeof DemoteBranchInput.Type;

// Output Schema
export const DemoteBranchOutput = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  deleted_at: Schema.String,
  restore_checklist_completed_at: Schema.String,
  schema_last_updated_at: Schema.String,
  kind: Schema.Literal("mysql", "postgresql"),
  mysql_address: Schema.String,
  mysql_edge_address: Schema.String,
  state: Schema.Literal("pending", "sleep_in_progress", "sleeping", "awakening", "ready"),
  direct_vtgate: Schema.Boolean,
  vtgate_size: Schema.String,
  vtgate_count: Schema.Number,
  cluster_name: Schema.String,
  cluster_iops: Schema.Number,
  ready: Schema.Boolean,
  schema_ready: Schema.Boolean,
  metal: Schema.Boolean,
  production: Schema.Boolean,
  safe_migrations: Schema.Boolean,
  sharded: Schema.Boolean,
  shard_count: Schema.Number,
  stale_schema: Schema.Boolean,
  actor: Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    avatar_url: Schema.String,
  }),
  restored_from_branch: Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    deleted_at: Schema.String,
  }),
  private_edge_connectivity: Schema.Boolean,
  has_replicas: Schema.Boolean,
  has_read_only_replicas: Schema.Boolean,
  html_url: Schema.String,
  url: Schema.String,
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
  parent_branch: Schema.String,
});
export type DemoteBranchOutput = typeof DemoteBranchOutput.Type;

// Error Schemas
export class DemoteBranchUnauthorized extends Schema.TaggedError<DemoteBranchUnauthorized>()(
  "DemoteBranchUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class DemoteBranchForbidden extends Schema.TaggedError<DemoteBranchForbidden>()(
  "DemoteBranchForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class DemoteBranchNotfound extends Schema.TaggedError<DemoteBranchNotfound>()(
  "DemoteBranchNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const demoteBranch = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DemoteBranchInput,
  outputSchema: DemoteBranchOutput,
  errors: [DemoteBranchUnauthorized, DemoteBranchForbidden, DemoteBranchNotfound],
}));
