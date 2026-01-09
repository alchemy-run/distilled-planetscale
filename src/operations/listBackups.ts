import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const ListBackupsInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  all: Schema.optional(Schema.Boolean),
  state: Schema.optional(Schema.Literal("pending", "running", "success", "failed", "canceled", "ignored")),
  policy: Schema.optional(Schema.String),
  from: Schema.optional(Schema.String),
  to: Schema.optional(Schema.String),
  running_at: Schema.optional(Schema.String),
  production: Schema.optional(Schema.Boolean),
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/backups`,
});
export type ListBackupsInput = typeof ListBackupsInput.Type;

// Output Schema
export const ListBackupsOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.Number,
  next_page_url: Schema.String,
  prev_page: Schema.Number,
  prev_page_url: Schema.String,
  data: Schema.Array(Schema.Struct({
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
  })),
});
export type ListBackupsOutput = typeof ListBackupsOutput.Type;

// Error Schemas
export class ListBackupsUnauthorized extends Schema.TaggedError<ListBackupsUnauthorized>()(
  "ListBackupsUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListBackupsForbidden extends Schema.TaggedError<ListBackupsForbidden>()(
  "ListBackupsForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListBackupsNotfound extends Schema.TaggedError<ListBackupsNotfound>()(
  "ListBackupsNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const listBackups = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListBackupsInput,
  outputSchema: ListBackupsOutput,
  errors: [ListBackupsUnauthorized, ListBackupsForbidden, ListBackupsNotfound],
}));
