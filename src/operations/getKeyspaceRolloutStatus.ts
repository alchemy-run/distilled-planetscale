import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const GetKeyspaceRolloutStatusInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  keyspace: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; branch: string; keyspace: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/keyspaces/${input.keyspace}/rollout-status`,
  [ApiPathParams]: ["organization", "database", "branch", "keyspace"] as const,
});
export type GetKeyspaceRolloutStatusInput = typeof GetKeyspaceRolloutStatusInput.Type;

// Output Schema
export const GetKeyspaceRolloutStatusOutput = Schema.Struct({
  name: Schema.String,
  state: Schema.String,
  shards: Schema.Array(Schema.Struct({
    name: Schema.String,
    last_rollout_started_at: Schema.String,
    last_rollout_finished_at: Schema.String,
    state: Schema.String,
  })),
});
export type GetKeyspaceRolloutStatusOutput = typeof GetKeyspaceRolloutStatusOutput.Type;

// Error Schemas
export class GetKeyspaceRolloutStatusUnauthorized extends Schema.TaggedError<GetKeyspaceRolloutStatusUnauthorized>()(
  "GetKeyspaceRolloutStatusUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class GetKeyspaceRolloutStatusForbidden extends Schema.TaggedError<GetKeyspaceRolloutStatusForbidden>()(
  "GetKeyspaceRolloutStatusForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class GetKeyspaceRolloutStatusNotfound extends Schema.TaggedError<GetKeyspaceRolloutStatusNotfound>()(
  "GetKeyspaceRolloutStatusNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class GetKeyspaceRolloutStatusInternalservererror extends Schema.TaggedError<GetKeyspaceRolloutStatusInternalservererror>()(
  "GetKeyspaceRolloutStatusInternalservererror",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Get keyspace rollout status
 *
 * @param organization - The name of the organization the branch belongs to
 * @param database - The name of the database the branch belongs to
 * @param branch - The name of the branch
 * @param keyspace - The name of the keyspace
 */
export const getKeyspaceRolloutStatus = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetKeyspaceRolloutStatusInput,
  outputSchema: GetKeyspaceRolloutStatusOutput,
  errors: [GetKeyspaceRolloutStatusUnauthorized, GetKeyspaceRolloutStatusForbidden, GetKeyspaceRolloutStatusNotfound, GetKeyspaceRolloutStatusInternalservererror],
}));
