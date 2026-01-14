import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const GetOauthTokenInput = Schema.Struct({
  organization: Schema.String,
  application_id: Schema.String,
  token_id: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; application_id: string; token_id: string }) =>
    `/organizations/${input.organization}/oauth-applications/${input.application_id}/tokens/${input.token_id}`,
  [ApiPathParams]: ["organization", "application_id", "token_id"] as const,
});
export type GetOauthTokenInput = typeof GetOauthTokenInput.Type;

// Output Schema
export const GetOauthTokenOutput = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  display_name: Schema.String,
  token: Schema.String,
  plain_text_refresh_token: Schema.String,
  avatar_url: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  expires_at: Schema.String,
  last_used_at: Schema.String,
  actor_id: Schema.String,
  actor_display_name: Schema.String,
  actor_type: Schema.String,
  service_token_accesses: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      access: Schema.String,
      description: Schema.String,
      resource_name: Schema.String,
      resource_id: Schema.String,
      resource_type: Schema.String,
      resource: Schema.Struct({
        id: Schema.String,
        name: Schema.String,
        created_at: Schema.String,
        updated_at: Schema.String,
        deleted_at: Schema.String,
      }),
    }),
  ),
  oauth_accesses_by_resource: Schema.Struct({
    database: Schema.Struct({
      databases: Schema.Array(
        Schema.Struct({
          name: Schema.String,
          id: Schema.String,
          organization: Schema.String,
          url: Schema.String,
        }),
      ),
      accesses: Schema.Array(
        Schema.Struct({
          name: Schema.String,
          description: Schema.String,
        }),
      ),
    }),
    organization: Schema.Struct({
      organizations: Schema.Array(
        Schema.Struct({
          name: Schema.String,
          id: Schema.String,
          url: Schema.String,
        }),
      ),
      accesses: Schema.Array(
        Schema.Struct({
          name: Schema.String,
          description: Schema.String,
        }),
      ),
    }),
    branch: Schema.Struct({
      branches: Schema.Array(
        Schema.Struct({
          name: Schema.String,
          id: Schema.String,
          database: Schema.String,
          organization: Schema.String,
          url: Schema.String,
        }),
      ),
      accesses: Schema.Array(
        Schema.Struct({
          name: Schema.String,
          description: Schema.String,
        }),
      ),
    }),
    user: Schema.Struct({
      users: Schema.Array(
        Schema.Struct({
          name: Schema.String,
          id: Schema.String,
        }),
      ),
      accesses: Schema.Array(
        Schema.Struct({
          name: Schema.String,
          description: Schema.String,
        }),
      ),
    }),
  }),
});
export type GetOauthTokenOutput = typeof GetOauthTokenOutput.Type;

// Error Schemas
export class GetOauthTokenUnauthorized extends Schema.TaggedError<GetOauthTokenUnauthorized>()(
  "GetOauthTokenUnauthorized",
  {
    organization: Schema.String,
    application_id: Schema.String,
    token_id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class GetOauthTokenForbidden extends Schema.TaggedError<GetOauthTokenForbidden>()(
  "GetOauthTokenForbidden",
  {
    organization: Schema.String,
    application_id: Schema.String,
    token_id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetOauthTokenNotfound extends Schema.TaggedError<GetOauthTokenNotfound>()(
  "GetOauthTokenNotfound",
  {
    organization: Schema.String,
    application_id: Schema.String,
    token_id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Get an OAuth token
 *
 * @param organization - The name of the organization the OAuth application belongs to
 * @param application_id - The ID of the OAuth application
 * @param token_id - The ID of the OAuth application token
 */
export const getOauthToken = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetOauthTokenInput,
  outputSchema: GetOauthTokenOutput,
  errors: [GetOauthTokenUnauthorized, GetOauthTokenForbidden, GetOauthTokenNotfound],
}));
