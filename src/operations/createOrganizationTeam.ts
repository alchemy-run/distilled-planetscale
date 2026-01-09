import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const CreateOrganizationTeamInput = Schema.Struct({
  organization: Schema.String,
  name: Schema.String,
  description: Schema.optional(Schema.String),
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string }) => `/organizations/${input.organization}/teams`,
});
export type CreateOrganizationTeamInput = typeof CreateOrganizationTeamInput.Type;

// Output Schema
export const CreateOrganizationTeamOutput = Schema.Struct({
  id: Schema.String,
  display_name: Schema.String,
  creator: Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    avatar_url: Schema.String,
  }),
  members: Schema.Array(Schema.Struct({
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
  })),
  databases: Schema.Array(Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    url: Schema.String,
    branches_url: Schema.String,
  })),
  name: Schema.String,
  slug: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  description: Schema.String,
  managed: Schema.Boolean,
});
export type CreateOrganizationTeamOutput = typeof CreateOrganizationTeamOutput.Type;

// Error Schemas
export class CreateOrganizationTeamUnauthorized extends Schema.TaggedError<CreateOrganizationTeamUnauthorized>()(
  "CreateOrganizationTeamUnauthorized",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class CreateOrganizationTeamForbidden extends Schema.TaggedError<CreateOrganizationTeamForbidden>()(
  "CreateOrganizationTeamForbidden",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class CreateOrganizationTeamNotfound extends Schema.TaggedError<CreateOrganizationTeamNotfound>()(
  "CreateOrganizationTeamNotfound",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

export class CreateOrganizationTeamUnprocessableentity extends Schema.TaggedError<CreateOrganizationTeamUnprocessableentity>()(
  "CreateOrganizationTeamUnprocessableentity",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unprocessable_entity" },
) {}

// The operation
export const createOrganizationTeam = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateOrganizationTeamInput,
  outputSchema: CreateOrganizationTeamOutput,
  errors: [CreateOrganizationTeamUnauthorized, CreateOrganizationTeamForbidden, CreateOrganizationTeamNotfound, CreateOrganizationTeamUnprocessableentity],
}));
