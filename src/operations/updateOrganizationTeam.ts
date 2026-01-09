import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const UpdateOrganizationTeamInput = Schema.Struct({
  organization: Schema.String,
  team: Schema.String,
  name: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
}).annotations({
  [ApiMethod]: "PATCH",
  [ApiPath]: (input: { organization: string; team: string }) => `/organizations/${input.organization}/teams/${input.team}`,
});
export type UpdateOrganizationTeamInput = typeof UpdateOrganizationTeamInput.Type;

// Output Schema
export const UpdateOrganizationTeamOutput = Schema.Struct({
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
export type UpdateOrganizationTeamOutput = typeof UpdateOrganizationTeamOutput.Type;

// Error Schemas
export class UpdateOrganizationTeamUnauthorized extends Schema.TaggedError<UpdateOrganizationTeamUnauthorized>()(
  "UpdateOrganizationTeamUnauthorized",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class UpdateOrganizationTeamForbidden extends Schema.TaggedError<UpdateOrganizationTeamForbidden>()(
  "UpdateOrganizationTeamForbidden",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class UpdateOrganizationTeamNotfound extends Schema.TaggedError<UpdateOrganizationTeamNotfound>()(
  "UpdateOrganizationTeamNotfound",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

export class UpdateOrganizationTeamUnprocessableentity extends Schema.TaggedError<UpdateOrganizationTeamUnprocessableentity>()(
  "UpdateOrganizationTeamUnprocessableentity",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unprocessable_entity" },
) {}

// The operation
export const updateOrganizationTeam = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateOrganizationTeamInput,
  outputSchema: UpdateOrganizationTeamOutput,
  errors: [UpdateOrganizationTeamUnauthorized, UpdateOrganizationTeamForbidden, UpdateOrganizationTeamNotfound, UpdateOrganizationTeamUnprocessableentity],
}));
