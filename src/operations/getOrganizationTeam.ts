import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const GetOrganizationTeamInput = Schema.Struct({
  organization: Schema.String,
  team: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; team: string }) => `/organizations/${input.organization}/teams/${input.team}`,
  [ApiPathParams]: ["organization", "team"] as const,
});
export type GetOrganizationTeamInput = typeof GetOrganizationTeamInput.Type;

// Output Schema
export const GetOrganizationTeamOutput = Schema.Struct({
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
export type GetOrganizationTeamOutput = typeof GetOrganizationTeamOutput.Type;

// Error Schemas
export class GetOrganizationTeamBadrequest extends Schema.TaggedError<GetOrganizationTeamBadrequest>()(
  "GetOrganizationTeamBadrequest",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "bad_request" },
).pipe(Category.withBadRequestError) {}

export class GetOrganizationTeamUnauthorized extends Schema.TaggedError<GetOrganizationTeamUnauthorized>()(
  "GetOrganizationTeamUnauthorized",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class GetOrganizationTeamForbidden extends Schema.TaggedError<GetOrganizationTeamForbidden>()(
  "GetOrganizationTeamForbidden",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class GetOrganizationTeamNotfound extends Schema.TaggedError<GetOrganizationTeamNotfound>()(
  "GetOrganizationTeamNotfound",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class GetOrganizationTeamUnprocessableentity extends Schema.TaggedError<GetOrganizationTeamUnprocessableentity>()(
  "GetOrganizationTeamUnprocessableentity",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unprocessable_entity" },
).pipe(Category.withBadRequestError) {}

export class GetOrganizationTeamInternalservererror extends Schema.TaggedError<GetOrganizationTeamInternalservererror>()(
  "GetOrganizationTeamInternalservererror",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Get an organization team
 *
 * @param organization - The name of the organization
 * @param team - The slug of the team
 */
export const getOrganizationTeam = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetOrganizationTeamInput,
  outputSchema: GetOrganizationTeamOutput,
  errors: [GetOrganizationTeamBadrequest, GetOrganizationTeamUnauthorized, GetOrganizationTeamForbidden, GetOrganizationTeamNotfound, GetOrganizationTeamUnprocessableentity, GetOrganizationTeamInternalservererror],
}));
