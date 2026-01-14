import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const DeleteWebhookInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; database: string; id: string }) =>
    `/organizations/${input.organization}/databases/${input.database}/webhooks/${input.id}`,
  [ApiPathParams]: ["organization", "database", "id"] as const,
});
export type DeleteWebhookInput = typeof DeleteWebhookInput.Type;

// Output Schema
export const DeleteWebhookOutput = Schema.Void;
export type DeleteWebhookOutput = typeof DeleteWebhookOutput.Type;

// Error Schemas
export class DeleteWebhookUnauthorized extends Schema.TaggedError<DeleteWebhookUnauthorized>()(
  "DeleteWebhookUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class DeleteWebhookForbidden extends Schema.TaggedError<DeleteWebhookForbidden>()(
  "DeleteWebhookForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class DeleteWebhookNotfound extends Schema.TaggedError<DeleteWebhookNotfound>()(
  "DeleteWebhookNotfound",
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
 * Delete a webhook
 *
 * @param organization - The name of the organization
 * @param database - The name of the database
 * @param id - The ID of the webhook
 */
export const deleteWebhook = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeleteWebhookInput,
  outputSchema: DeleteWebhookOutput,
  errors: [DeleteWebhookUnauthorized, DeleteWebhookForbidden, DeleteWebhookNotfound],
}));
