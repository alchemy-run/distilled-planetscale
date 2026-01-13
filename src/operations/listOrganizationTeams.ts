import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const ListOrganizationTeamsInput = Schema.Struct({
  organization: Schema.String,
  q: Schema.optional(Schema.String),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string }) => `/organizations/${input.organization}/teams`,
  [ApiPathParams]: ["organization"] as const,
});
export type ListOrganizationTeamsInput = typeof ListOrganizationTeamsInput.Type;

// Output Schema
export const ListOrganizationTeamsOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.NullOr(Schema.Number),
  next_page_url: Schema.NullOr(Schema.String),
  prev_page: Schema.NullOr(Schema.Number),
  prev_page_url: Schema.NullOr(Schema.String),
  data: Schema.Array(Schema.Struct({
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
  })),
});
export type ListOrganizationTeamsOutput = typeof ListOrganizationTeamsOutput.Type;

// Error Schemas
export class ListOrganizationTeamsUnauthorized extends Schema.TaggedError<ListOrganizationTeamsUnauthorized>()(
  "ListOrganizationTeamsUnauthorized",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListOrganizationTeamsForbidden extends Schema.TaggedError<ListOrganizationTeamsForbidden>()(
  "ListOrganizationTeamsForbidden",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListOrganizationTeamsNotfound extends Schema.TaggedError<ListOrganizationTeamsNotfound>()(
  "ListOrganizationTeamsNotfound",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

export class ListOrganizationTeamsUnprocessableentity extends Schema.TaggedError<ListOrganizationTeamsUnprocessableentity>()(
  "ListOrganizationTeamsUnprocessableentity",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unprocessable_entity" },
) {}

// The operation
/**
 * List teams in an organization
 *
 * @param organization - The name of the organization
 * @param q - Search term to filter teams by name
 */
export const listOrganizationTeams = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListOrganizationTeamsInput,
  outputSchema: ListOrganizationTeamsOutput,
  errors: [ListOrganizationTeamsUnauthorized, ListOrganizationTeamsForbidden, ListOrganizationTeamsNotfound, ListOrganizationTeamsUnprocessableentity],
}));
