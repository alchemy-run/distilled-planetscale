import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const ListWebhooksInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string }) => `/organizations/${input.organization}/databases/${input.database}/webhooks`,
});
export type ListWebhooksInput = typeof ListWebhooksInput.Type;

// Output Schema
export const ListWebhooksOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.Number,
  next_page_url: Schema.String,
  prev_page: Schema.Number,
  prev_page_url: Schema.String,
  data: Schema.Array(Schema.Struct({
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
  })),
});
export type ListWebhooksOutput = typeof ListWebhooksOutput.Type;

// Error Schemas
export class ListWebhooksUnauthorized extends Schema.TaggedError<ListWebhooksUnauthorized>()(
  "ListWebhooksUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListWebhooksForbidden extends Schema.TaggedError<ListWebhooksForbidden>()(
  "ListWebhooksForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListWebhooksNotfound extends Schema.TaggedError<ListWebhooksNotfound>()(
  "ListWebhooksNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const listWebhooks = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListWebhooksInput,
  outputSchema: ListWebhooksOutput,
  errors: [ListWebhooksUnauthorized, ListWebhooksForbidden, ListWebhooksNotfound],
}));
