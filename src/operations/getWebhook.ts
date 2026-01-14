import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const GetWebhookInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/webhooks/${input.id}`,
  [ApiPathParams]: ["organization", "database", "id"] as const,
});
export type GetWebhookInput = typeof GetWebhookInput.Type;

// Output Schema
export const GetWebhookOutput = Schema.Struct({
  id: Schema.String,
  url: Schema.String,
  secret: Schema.String,
  enabled: Schema.Boolean,
  last_sent_result: Schema.NullOr(Schema.String),
  last_sent_success: Schema.NullOr(Schema.Boolean),
  last_sent_at: Schema.NullOr(Schema.String),
  created_at: Schema.String,
  updated_at: Schema.String,
  events: Schema.Array(Schema.Literal("branch.ready", "branch.anomaly", "branch.primary_promoted", "branch.schema_recommendation", "branch.sleeping", "branch.start_maintenance", "cluster.storage", "database.access_request", "deploy_request.closed", "deploy_request.errored", "deploy_request.in_progress", "deploy_request.opened", "deploy_request.pending_cutover", "deploy_request.queued", "deploy_request.reverted", "deploy_request.schema_applied", "keyspace.storage", "webhook.test")),
});
export type GetWebhookOutput = typeof GetWebhookOutput.Type;

// Error Schemas
export class GetWebhookUnauthorized extends Schema.TaggedError<GetWebhookUnauthorized>()(
  "GetWebhookUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class GetWebhookForbidden extends Schema.TaggedError<GetWebhookForbidden>()(
  "GetWebhookForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class GetWebhookNotfound extends Schema.TaggedError<GetWebhookNotfound>()(
  "GetWebhookNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class GetWebhookInternalservererror extends Schema.TaggedError<GetWebhookInternalservererror>()(
  "GetWebhookInternalservererror",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Get a webhook
 *
 * @param organization - The name of the organization
 * @param database - The name of the database
 * @param id - The ID of the webhook
 */
export const getWebhook = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetWebhookInput,
  outputSchema: GetWebhookOutput,
  errors: [GetWebhookUnauthorized, GetWebhookForbidden, GetWebhookNotfound, GetWebhookInternalservererror],
}));
