import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const TestWebhookInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string; database: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/webhooks/${input.id}/test`,
  [ApiPathParams]: ["organization", "database", "id"] as const,
});
export type TestWebhookInput = typeof TestWebhookInput.Type;

// Output Schema
export const TestWebhookOutput = Schema.Void;
export type TestWebhookOutput = typeof TestWebhookOutput.Type;

// Error Schemas
export class TestWebhookUnauthorized extends Schema.TaggedError<TestWebhookUnauthorized>()(
  "TestWebhookUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class TestWebhookForbidden extends Schema.TaggedError<TestWebhookForbidden>()(
  "TestWebhookForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class TestWebhookNotfound extends Schema.TaggedError<TestWebhookNotfound>()(
  "TestWebhookNotfound",
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
 * Test a webhook
 *
 * Sends a test event to the webhook
 *
 * @param organization - The name of the organization
 * @param database - The name of the database
 * @param id - The ID of the webhook
 */
export const testWebhook = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: TestWebhookInput,
  outputSchema: TestWebhookOutput,
  errors: [TestWebhookUnauthorized, TestWebhookForbidden, TestWebhookNotfound],
}));
