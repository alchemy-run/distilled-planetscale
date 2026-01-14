import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const GetCurrentUserInput = Schema.Struct({

}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: () => "/user",
  [ApiPathParams]: [] as const,
});
export type GetCurrentUserInput = typeof GetCurrentUserInput.Type;

// Output Schema
export const GetCurrentUserOutput = Schema.Struct({
  id: Schema.String,
  display_name: Schema.String,
  name: Schema.optional(Schema.NullOr(Schema.String)),
  email: Schema.String,
  avatar_url: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  two_factor_auth_configured: Schema.Boolean,
  default_organization: Schema.optional(Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    deleted_at: Schema.String,
  })),
  sso: Schema.optional(Schema.Boolean),
  managed: Schema.optional(Schema.Boolean),
  directory_managed: Schema.optional(Schema.Boolean),
  email_verified: Schema.optional(Schema.Boolean),
});
export type GetCurrentUserOutput = typeof GetCurrentUserOutput.Type;

// Error Schemas
export class GetCurrentUserUnauthorized extends Schema.TaggedError<GetCurrentUserUnauthorized>()(
  "GetCurrentUserUnauthorized",
  {

    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class GetCurrentUserForbidden extends Schema.TaggedError<GetCurrentUserForbidden>()(
  "GetCurrentUserForbidden",
  {

    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class GetCurrentUserNotfound extends Schema.TaggedError<GetCurrentUserNotfound>()(
  "GetCurrentUserNotfound",
  {

    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class GetCurrentUserInternalservererror extends Schema.TaggedError<GetCurrentUserInternalservererror>()(
  "GetCurrentUserInternalservererror",
  {

    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Get current user
 *
 * Get the user associated with this service token
 */
export const getCurrentUser = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetCurrentUserInput,
  outputSchema: GetCurrentUserOutput,
  errors: [GetCurrentUserUnauthorized, GetCurrentUserForbidden, GetCurrentUserNotfound, GetCurrentUserInternalservererror],
}));
