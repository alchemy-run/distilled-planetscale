import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const CreateDatabaseInput = Schema.Struct({
  organization: Schema.String,
  name: Schema.String,
  region: Schema.optional(Schema.String),
  cluster_size: Schema.String,
  replicas: Schema.optional(Schema.Number),
  kind: Schema.optional(Schema.Literal("mysql", "postgresql")),
  major_version: Schema.optional(Schema.String),
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string }) => `/organizations/${input.organization}/databases`,
});
export type CreateDatabaseInput = typeof CreateDatabaseInput.Type;

// Output Schema
export const CreateDatabaseOutput = Schema.Struct({
  id: Schema.String,
  url: Schema.String,
  branches_url: Schema.String,
  branches_count: Schema.Number,
  open_schema_recommendations_count: Schema.Number,
  development_branches_count: Schema.Number,
  production_branches_count: Schema.Number,
  issues_count: Schema.Number,
  multiple_admins_required_for_deletion: Schema.Boolean,
  ready: Schema.Boolean,
  at_backup_restore_branches_limit: Schema.Boolean,
  at_development_branch_usage_limit: Schema.Boolean,
  data_import: Schema.Struct({
    state: Schema.String,
    import_check_errors: Schema.String,
    started_at: Schema.String,
    finished_at: Schema.String,
    data_source: Schema.Struct({
      hostname: Schema.String,
      port: Schema.Number,
      database: Schema.String,
    }),
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
  html_url: Schema.String,
  name: Schema.String,
  state: Schema.Literal("pending", "importing", "sleep_in_progress", "sleeping", "awakening", "import_ready", "ready"),
  sharded: Schema.Boolean,
  default_branch_shard_count: Schema.Number,
  default_branch_read_only_regions_count: Schema.Number,
  default_branch_table_count: Schema.Number,
  default_branch: Schema.String,
  require_approval_for_deploy: Schema.Boolean,
  resizing: Schema.Boolean,
  resize_queued: Schema.Boolean,
  allow_data_branching: Schema.Boolean,
  foreign_keys_enabled: Schema.Boolean,
  automatic_migrations: Schema.Boolean,
  restrict_branch_region: Schema.Boolean,
  insights_raw_queries: Schema.Boolean,
  plan: Schema.String,
  insights_enabled: Schema.Boolean,
  production_branch_web_console: Schema.Boolean,
  migration_table_name: Schema.String,
  migration_framework: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  schema_last_updated_at: Schema.String,
  kind: Schema.Literal("mysql", "postgresql"),
});
export type CreateDatabaseOutput = typeof CreateDatabaseOutput.Type;

// Error Schemas
export class CreateDatabaseUnauthorized extends Schema.TaggedError<CreateDatabaseUnauthorized>()(
  "CreateDatabaseUnauthorized",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class CreateDatabaseForbidden extends Schema.TaggedError<CreateDatabaseForbidden>()(
  "CreateDatabaseForbidden",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class CreateDatabaseNotfound extends Schema.TaggedError<CreateDatabaseNotfound>()(
  "CreateDatabaseNotfound",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const createDatabase = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateDatabaseInput,
  outputSchema: CreateDatabaseOutput,
  errors: [CreateDatabaseUnauthorized, CreateDatabaseForbidden, CreateDatabaseNotfound],
}));
