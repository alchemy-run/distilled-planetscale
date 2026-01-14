import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const GetOauthApplicationInput = Schema.Struct({
  organization: Schema.String,
  application_id: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; application_id: string }) =>
    `/organizations/${input.organization}/oauth-applications/${input.application_id}`,
  [ApiPathParams]: ["organization", "application_id"] as const,
});
export type GetOauthApplicationInput = typeof GetOauthApplicationInput.Type;

// Output Schema
export const GetOauthApplicationOutput = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  redirect_uri: Schema.String,
  domain: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  scopes: Schema.Array(Schema.String),
  avatar: Schema.String,
  client_id: Schema.String,
  tokens: Schema.Number,
});
export type GetOauthApplicationOutput = typeof GetOauthApplicationOutput.Type;

// Error Schemas
export class GetOauthApplicationUnauthorized extends Schema.TaggedError<GetOauthApplicationUnauthorized>()(
  "GetOauthApplicationUnauthorized",
  {
    organization: Schema.String,
    application_id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class GetOauthApplicationForbidden extends Schema.TaggedError<GetOauthApplicationForbidden>()(
  "GetOauthApplicationForbidden",
  {
    organization: Schema.String,
    application_id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetOauthApplicationNotfound extends Schema.TaggedError<GetOauthApplicationNotfound>()(
  "GetOauthApplicationNotfound",
  {
    organization: Schema.String,
    application_id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Get an OAuth application
 *
 * @param organization - The name of the organization the OAuth application belongs to
 * @param application_id - The ID of the OAuth application
 */
export const getOauthApplication = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetOauthApplicationInput,
  outputSchema: GetOauthApplicationOutput,
  errors: [
    GetOauthApplicationUnauthorized,
    GetOauthApplicationForbidden,
    GetOauthApplicationNotfound,
  ],
}));
