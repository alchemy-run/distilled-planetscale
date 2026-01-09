import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const DeleteOauthTokenInput = Schema.Struct({
  organization: Schema.String,
  application_id: Schema.String,
  token_id: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; application_id: string; token_id: string }) => `/organizations/${input.organization}/oauth-applications/${input.application_id}/tokens/${input.token_id}`,
});
export type DeleteOauthTokenInput = typeof DeleteOauthTokenInput.Type;

// Output Schema
export const DeleteOauthTokenOutput = Schema.Void;
export type DeleteOauthTokenOutput = typeof DeleteOauthTokenOutput.Type;

// Error Schemas
export class DeleteOauthTokenUnauthorized extends Schema.TaggedError<DeleteOauthTokenUnauthorized>()(
  "DeleteOauthTokenUnauthorized",
  {
    organization: Schema.String,
    application_id: Schema.String,
    token_id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class DeleteOauthTokenForbidden extends Schema.TaggedError<DeleteOauthTokenForbidden>()(
  "DeleteOauthTokenForbidden",
  {
    organization: Schema.String,
    application_id: Schema.String,
    token_id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class DeleteOauthTokenNotfound extends Schema.TaggedError<DeleteOauthTokenNotfound>()(
  "DeleteOauthTokenNotfound",
  {
    organization: Schema.String,
    application_id: Schema.String,
    token_id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const deleteOauthToken = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeleteOauthTokenInput,
  outputSchema: DeleteOauthTokenOutput,
  errors: [DeleteOauthTokenUnauthorized, DeleteOauthTokenForbidden, DeleteOauthTokenNotfound],
}));
