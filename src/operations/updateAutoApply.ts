import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const UpdateAutoApplyInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  number: Schema.Number,
  enable: Schema.optional(Schema.Boolean),
}).annotations({
  [ApiMethod]: "PUT",
  [ApiPath]: (input: { organization: string; database: string; number: string }) => `/organizations/${input.organization}/databases/${input.database}/deploy-requests/${input.number}/auto-apply`,
  [ApiPathParams]: ["organization", "database", "number"] as const,
});
export type UpdateAutoApplyInput = typeof UpdateAutoApplyInput.Type;

// Output Schema
export const UpdateAutoApplyOutput = Schema.Struct({
  id: Schema.String,
  number: Schema.Number,
  actor: Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    avatar_url: Schema.String,
  }),
  closed_by: Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    avatar_url: Schema.String,
  }),
  branch: Schema.String,
  branch_id: Schema.String,
  branch_deleted: Schema.Boolean,
  branch_deleted_by: Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    avatar_url: Schema.String,
  }),
  branch_deleted_at: Schema.String,
  into_branch: Schema.String,
  into_branch_sharded: Schema.Boolean,
  into_branch_shard_count: Schema.Number,
  approved: Schema.Boolean,
  state: Schema.Literal("open", "closed"),
  deployment_state: Schema.Literal("pending", "ready", "no_changes", "queued", "submitting", "in_progress", "pending_cutover", "in_progress_vschema", "in_progress_cancel", "in_progress_cutover", "complete", "complete_cancel", "complete_error", "complete_pending_revert", "in_progress_revert", "in_progress_revert_vschema", "complete_revert", "complete_revert_error", "cancelled", "error"),
  deployment: Schema.Struct({
    id: Schema.String,
    auto_cutover: Schema.Boolean,
    auto_delete_branch: Schema.Boolean,
    created_at: Schema.String,
    cutover_at: Schema.String,
    cutover_expiring: Schema.Boolean,
    deploy_check_errors: Schema.String,
    finished_at: Schema.String,
    queued_at: Schema.String,
    ready_to_cutover_at: Schema.String,
    started_at: Schema.String,
    state: Schema.Literal("pending", "ready", "no_changes", "queued", "submitting", "in_progress", "pending_cutover", "in_progress_vschema", "in_progress_cancel", "in_progress_cutover", "complete", "complete_cancel", "complete_error", "complete_pending_revert", "in_progress_revert", "in_progress_revert_vschema", "complete_revert", "complete_revert_error", "cancelled", "error"),
    submitted_at: Schema.String,
    updated_at: Schema.String,
    into_branch: Schema.String,
    deploy_request_number: Schema.Number,
    deployable: Schema.Boolean,
    preceding_deployments: Schema.Array(Schema.Unknown),
    deploy_operations: Schema.Array(Schema.Struct({
      id: Schema.String,
      state: Schema.Literal("pending", "queued", "in_progress", "complete", "cancelled", "error"),
      keyspace_name: Schema.String,
      table_name: Schema.String,
      operation_name: Schema.String,
      eta_seconds: Schema.Number,
      progress_percentage: Schema.Number,
      deploy_error_docs_url: Schema.String,
      ddl_statement: Schema.String,
      syntax_highlighted_ddl: Schema.String,
      created_at: Schema.String,
      updated_at: Schema.String,
      throttled_at: Schema.String,
      can_drop_data: Schema.Boolean,
      table_locked: Schema.Boolean,
      table_recently_used: Schema.Boolean,
      table_recently_used_at: Schema.String,
      removed_foreign_key_names: Schema.Array(Schema.String),
      deploy_errors: Schema.String,
    })),
    deploy_operation_summaries: Schema.Array(Schema.Struct({
      id: Schema.String,
      created_at: Schema.String,
      deploy_errors: Schema.String,
      ddl_statement: Schema.String,
      eta_seconds: Schema.Number,
      keyspace_name: Schema.String,
      operation_name: Schema.String,
      progress_percentage: Schema.Number,
      state: Schema.Literal("pending", "in_progress", "complete", "cancelled", "error"),
      syntax_highlighted_ddl: Schema.String,
      table_name: Schema.String,
      table_recently_used_at: Schema.String,
      throttled_at: Schema.String,
      removed_foreign_key_names: Schema.Array(Schema.String),
      shard_count: Schema.Number,
      shard_names: Schema.Array(Schema.String),
      can_drop_data: Schema.Boolean,
      table_recently_used: Schema.Boolean,
      sharded: Schema.Boolean,
      operations: Schema.Array(Schema.Struct({
        id: Schema.String,
        shard: Schema.String,
        state: Schema.Literal("pending", "queued", "in_progress", "complete", "cancelled", "error"),
        progress_percentage: Schema.Number,
        eta_seconds: Schema.Number,
      })),
    })),
    lint_errors: Schema.Array(Schema.Unknown),
    sequential_diff_dependencies: Schema.Array(Schema.Unknown),
    lookup_vindex_operations: Schema.Array(Schema.Unknown),
    throttler_configurations: Schema.Array(Schema.Unknown),
    deployment_revert_request: Schema.Unknown,
    actor: Schema.Struct({
      id: Schema.String,
      display_name: Schema.String,
      avatar_url: Schema.String,
    }),
    cutover_actor: Schema.Struct({
      id: Schema.String,
      display_name: Schema.String,
      avatar_url: Schema.String,
    }),
    cancelled_actor: Schema.Struct({
      id: Schema.String,
      display_name: Schema.String,
      avatar_url: Schema.String,
    }),
    schema_last_updated_at: Schema.String,
    table_locked: Schema.Boolean,
    locked_table_name: Schema.String,
    instant_ddl: Schema.Boolean,
    instant_ddl_eligible: Schema.Boolean,
  }),
  num_comments: Schema.Number,
  html_url: Schema.String,
  notes: Schema.String,
  html_body: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  closed_at: Schema.String,
  deployed_at: Schema.String,
});
export type UpdateAutoApplyOutput = typeof UpdateAutoApplyOutput.Type;

// Error Schemas
export class UpdateAutoApplyUnauthorized extends Schema.TaggedError<UpdateAutoApplyUnauthorized>()(
  "UpdateAutoApplyUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    number: Schema.NumberFromString,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class UpdateAutoApplyForbidden extends Schema.TaggedError<UpdateAutoApplyForbidden>()(
  "UpdateAutoApplyForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    number: Schema.NumberFromString,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class UpdateAutoApplyNotfound extends Schema.TaggedError<UpdateAutoApplyNotfound>()(
  "UpdateAutoApplyNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    number: Schema.NumberFromString,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class UpdateAutoApplyInternalservererror extends Schema.TaggedError<UpdateAutoApplyInternalservererror>()(
  "UpdateAutoApplyInternalservererror",
  {
    organization: Schema.String,
    database: Schema.String,
    number: Schema.NumberFromString,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Update auto-apply for deploy request
 *
 * Enables or disabled the auto-apply setting for a deploy request
 *
 * @param organization - The name of the deploy request's organization
 * @param database - The name of the deploy request's database
 * @param number - The number of the deploy request
 * @param enable - Whether or not to enable auto-apply for the deploy request
 */
export const updateAutoApply = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateAutoApplyInput,
  outputSchema: UpdateAutoApplyOutput,
  errors: [UpdateAutoApplyUnauthorized, UpdateAutoApplyForbidden, UpdateAutoApplyNotfound, UpdateAutoApplyInternalservererror],
}));
