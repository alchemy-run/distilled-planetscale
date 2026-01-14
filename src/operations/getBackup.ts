import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const GetBackupInput = Schema.Struct({
  id: Schema.String,
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { id: string; organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/backups/${input.id}`,
  [ApiPathParams]: ["id", "organization", "database", "branch"] as const,
});
export type GetBackupInput = typeof GetBackupInput.Type;

// Output Schema
export const GetBackupOutput = Schema.Struct({
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
export type GetBackupOutput = typeof GetBackupOutput.Type;

// Error Schemas
export class GetBackupUnauthorized extends Schema.TaggedError<GetBackupUnauthorized>()(
  "GetBackupUnauthorized",
  {
    id: Schema.String,
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class GetBackupForbidden extends Schema.TaggedError<GetBackupForbidden>()(
  "GetBackupForbidden",
  {
    id: Schema.String,
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetBackupNotfound extends Schema.TaggedError<GetBackupNotfound>()(
  "GetBackupNotfound",
  {
    id: Schema.String,
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Get a backup
 *
 * @param id - The ID for the backup
 * @param organization - The name of the organization the branch belongs to
 * @param database - The name of the database the branch belongs to
 * @param branch - The name of the branch
 */
export const getBackup = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetBackupInput,
  outputSchema: GetBackupOutput,
  errors: [GetBackupUnauthorized, GetBackupForbidden, GetBackupNotfound],
}));
