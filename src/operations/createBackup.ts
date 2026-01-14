import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const CreateBackupInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  name: Schema.optional(Schema.String),
  retention_unit: Schema.optional(Schema.Literal("hour", "day", "week", "month", "year")),
  retention_value: Schema.optional(Schema.Number),
  emergency: Schema.optional(Schema.Boolean),
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/backups`,
  [ApiPathParams]: ["organization", "database", "branch"] as const,
});
export type CreateBackupInput = typeof CreateBackupInput.Type;

// Output Schema
export const CreateBackupOutput = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  state: Schema.Literal("pending", "running", "success", "failed", "canceled", "ignored"),
  size: Schema.Number,
  estimated_storage_cost: Schema.Number,
  created_at: Schema.String,
  updated_at: Schema.String,
  started_at: Schema.String,
  expires_at: Schema.String,
  completed_at: Schema.String,
  deleted_at: Schema.String,
  pvc_size: Schema.Number,
  protected: Schema.Boolean,
  required: Schema.Boolean,
  restored_branches: Schema.Array(Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    deleted_at: Schema.String,
  })),
  actor: Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    avatar_url: Schema.String,
  }),
  backup_policy: Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    target: Schema.Literal("production", "development"),
    retention_value: Schema.Number,
    retention_unit: Schema.String,
    frequency_value: Schema.Number,
    frequency_unit: Schema.String,
    schedule_time: Schema.String,
    schedule_day: Schema.Number,
    schedule_week: Schema.Number,
    created_at: Schema.String,
    updated_at: Schema.String,
    last_ran_at: Schema.String,
    next_run_at: Schema.String,
    required: Schema.Boolean,
  }),
  schema_snapshot: Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    linted_at: Schema.String,
    url: Schema.String,
  }),
  database_branch: Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    deleted_at: Schema.String,
  }),
});
export type CreateBackupOutput = typeof CreateBackupOutput.Type;

// Error Schemas
export class CreateBackupUnauthorized extends Schema.TaggedError<CreateBackupUnauthorized>()(
  "CreateBackupUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class CreateBackupForbidden extends Schema.TaggedError<CreateBackupForbidden>()(
  "CreateBackupForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class CreateBackupNotfound extends Schema.TaggedError<CreateBackupNotfound>()(
  "CreateBackupNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Create a backup
 *
 * @param organization - The name of the organization the branch belongs to
 * @param database - The name of the database the branch belongs to
 * @param branch - The name of the branch
 * @param name - Name for the backup
 * @param retention_unit - Unit for the retention period of the backup
 * @param retention_value - Value between `1` and `1000` for the retention period of the backup (i.e retention_value `6` and retention_unit `hour` means 6 hours)
 * @param emergency - Whether the backup is an immediate backup that may affect database performance. Emergency backups are only supported for PostgreSQL databases.
 */
export const createBackup = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateBackupInput,
  outputSchema: CreateBackupOutput,
  errors: [CreateBackupUnauthorized, CreateBackupForbidden, CreateBackupNotfound],
}));
