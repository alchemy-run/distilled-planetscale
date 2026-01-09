import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const CreateOauthTokenInput = Schema.Struct({
  organization: Schema.String,
  id: Schema.String,
  client_id: Schema.String,
  client_secret: Schema.String,
  grant_type: Schema.Literal("authorization_code", "refresh_token"),
  code: Schema.optional(Schema.String),
  redirect_uri: Schema.optional(Schema.String),
  refresh_token: Schema.optional(Schema.String),
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string; id: string }) => `/organizations/${input.organization}/oauth-applications/${input.id}/token`,
});
export type CreateOauthTokenInput = typeof CreateOauthTokenInput.Type;

// Output Schema
export const CreateOauthTokenOutput = Schema.Struct({
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
  service_token_accesses: Schema.Array(Schema.Struct({
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
  })),
  oauth_accesses_by_resource: Schema.Struct({
    database: Schema.Struct({
      databases: Schema.Array(Schema.Struct({
        name: Schema.String,
        id: Schema.String,
        organization: Schema.String,
        url: Schema.String,
      })),
      accesses: Schema.Array(Schema.Struct({
        name: Schema.String,
        description: Schema.String,
      })),
    }),
    organization: Schema.Struct({
      organizations: Schema.Array(Schema.Struct({
        name: Schema.String,
        id: Schema.String,
        url: Schema.String,
      })),
      accesses: Schema.Array(Schema.Struct({
        name: Schema.String,
        description: Schema.String,
      })),
    }),
    branch: Schema.Struct({
      branches: Schema.Array(Schema.Struct({
        name: Schema.String,
        id: Schema.String,
        database: Schema.String,
        organization: Schema.String,
        url: Schema.String,
      })),
      accesses: Schema.Array(Schema.Struct({
        name: Schema.String,
        description: Schema.String,
      })),
    }),
    user: Schema.Struct({
      users: Schema.Array(Schema.Struct({
        name: Schema.String,
        id: Schema.String,
      })),
      accesses: Schema.Array(Schema.Struct({
        name: Schema.String,
        description: Schema.String,
      })),
    }),
  }),
});
export type CreateOauthTokenOutput = typeof CreateOauthTokenOutput.Type;

// Error Schemas
export class CreateOauthTokenForbidden extends Schema.TaggedError<CreateOauthTokenForbidden>()(
  "CreateOauthTokenForbidden",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class CreateOauthTokenNotfound extends Schema.TaggedError<CreateOauthTokenNotfound>()(
  "CreateOauthTokenNotfound",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

export class CreateOauthTokenUnprocessableentity extends Schema.TaggedError<CreateOauthTokenUnprocessableentity>()(
  "CreateOauthTokenUnprocessableentity",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unprocessable_entity" },
) {}

// The operation
export const createOauthToken = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateOauthTokenInput,
  outputSchema: CreateOauthTokenOutput,
  errors: [CreateOauthTokenForbidden, CreateOauthTokenNotfound, CreateOauthTokenUnprocessableentity],
}));
