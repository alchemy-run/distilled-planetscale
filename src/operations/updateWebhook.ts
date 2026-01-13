import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const UpdateWebhookInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  id: Schema.String,
  url: Schema.optional(Schema.String),
  enabled: Schema.optional(Schema.Boolean),
  events: Schema.optional(Schema.Array(Schema.String)),
}).annotations({
  [ApiMethod]: "PATCH",
  [ApiPath]: (input: { organization: string; database: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/webhooks/${input.id}`,
  [ApiPathParams]: ["organization", "database", "id"] as const,
});
export type UpdateWebhookInput = typeof UpdateWebhookInput.Type;

// Output Schema
export const UpdateWebhookOutput = Schema.Struct({
  id: Schema.String,
  url: Schema.String,
  secret: Schema.String,
  enabled: Schema.Boolean,
  last_sent_result: Schema.String,
  last_sent_success: Schema.Boolean,
  last_sent_at: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  events: Schema.Array(Schema.Literal("branch.ready", "branch.anomaly", "branch.primary_promoted", "branch.schema_recommendation", "branch.sleeping", "branch.start_maintenance", "cluster.storage", "database.access_request", "deploy_request.closed", "deploy_request.errored", "deploy_request.in_progress", "deploy_request.opened", "deploy_request.pending_cutover", "deploy_request.queued", "deploy_request.reverted", "deploy_request.schema_applied", "keyspace.storage", "webhook.test")),
});
export type UpdateWebhookOutput = typeof UpdateWebhookOutput.Type;

// Error Schemas
export class UpdateWebhookUnauthorized extends Schema.TaggedError<UpdateWebhookUnauthorized>()(
  "UpdateWebhookUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class UpdateWebhookForbidden extends Schema.TaggedError<UpdateWebhookForbidden>()(
  "UpdateWebhookForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class UpdateWebhookNotfound extends Schema.TaggedError<UpdateWebhookNotfound>()(
  "UpdateWebhookNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Update a webhook
 *
 * @param organization - The name of the organization
 * @param database - The name of the database
 * @param id - The ID of the webhook
 * @param url - The URL the webhook will send events to
 * @param enabled - Whether the webhook should be enabled
 * @param events - The events this webhook should subscribe to
 */
export const updateWebhook = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateWebhookInput,
  outputSchema: UpdateWebhookOutput,
  errors: [UpdateWebhookUnauthorized, UpdateWebhookForbidden, UpdateWebhookNotfound],
}));
