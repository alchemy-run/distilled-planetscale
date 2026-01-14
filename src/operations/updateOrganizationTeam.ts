import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const UpdateOrganizationTeamInput = Schema.Struct({
  organization: Schema.String,
  team: Schema.String,
  name: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
}).annotations({
  [ApiMethod]: "PATCH",
  [ApiPath]: (input: { organization: string; team: string }) =>
    `/organizations/${input.organization}/teams/${input.team}`,
  [ApiPathParams]: ["organization", "team"] as const,
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
  members: Schema.Array(
    Schema.Struct({
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
    }),
  ),
  databases: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      url: Schema.String,
      branches_url: Schema.String,
    }),
  ),
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
/**
 * Update an organization team
 *
 * @param organization - The name of the organization
 * @param team - The slug of the team
 * @param name - The new name for the team
 * @param description - The new description for the team
 */
export const updateOrganizationTeam = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateOrganizationTeamInput,
  outputSchema: UpdateOrganizationTeamOutput,
  errors: [
    UpdateOrganizationTeamUnauthorized,
    UpdateOrganizationTeamForbidden,
    UpdateOrganizationTeamNotfound,
    UpdateOrganizationTeamUnprocessableentity,
  ],
}));
