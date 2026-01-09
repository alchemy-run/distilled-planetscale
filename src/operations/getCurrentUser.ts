import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const GetCurrentUserInput = Schema.Struct({

}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: () => "/user",
});
export type GetCurrentUserInput = typeof GetCurrentUserInput.Type;

// Output Schema
export const GetCurrentUserOutput = Schema.Struct({
  id: Schema.String,
  display_name: Schema.String,
  name: Schema.String,
  email: Schema.String,
  avatar_url: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  two_factor_auth_configured: Schema.Boolean,
  default_organization: Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    deleted_at: Schema.String,
  }),
  sso: Schema.Boolean,
  managed: Schema.Boolean,
  directory_managed: Schema.Boolean,
  email_verified: Schema.Boolean,
});
export type GetCurrentUserOutput = typeof GetCurrentUserOutput.Type;

// Error Schemas
export class GetCurrentUserUnauthorized extends Schema.TaggedError<GetCurrentUserUnauthorized>()(
  "GetCurrentUserUnauthorized",
  {

    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class GetCurrentUserForbidden extends Schema.TaggedError<GetCurrentUserForbidden>()(
  "GetCurrentUserForbidden",
  {

    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetCurrentUserNotfound extends Schema.TaggedError<GetCurrentUserNotfound>()(
  "GetCurrentUserNotfound",
  {

    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const getCurrentUser = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetCurrentUserInput,
  outputSchema: GetCurrentUserOutput,
  errors: [GetCurrentUserUnauthorized, GetCurrentUserForbidden, GetCurrentUserNotfound],
}));
