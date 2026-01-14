import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const DeleteOrganizationTeamInput = Schema.Struct({
  organization: Schema.String,
  team: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; team: string }) => `/organizations/${input.organization}/teams/${input.team}`,
  [ApiPathParams]: ["organization", "team"] as const,
});
export type DeleteOrganizationTeamInput = typeof DeleteOrganizationTeamInput.Type;

// Output Schema
export const DeleteOrganizationTeamOutput = Schema.Void;
export type DeleteOrganizationTeamOutput = typeof DeleteOrganizationTeamOutput.Type;

// Error Schemas
export class DeleteOrganizationTeamBadrequest extends Schema.TaggedError<DeleteOrganizationTeamBadrequest>()(
  "DeleteOrganizationTeamBadrequest",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "bad_request" },
).pipe(Category.withBadRequestError) {}

export class DeleteOrganizationTeamUnauthorized extends Schema.TaggedError<DeleteOrganizationTeamUnauthorized>()(
  "DeleteOrganizationTeamUnauthorized",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class DeleteOrganizationTeamForbidden extends Schema.TaggedError<DeleteOrganizationTeamForbidden>()(
  "DeleteOrganizationTeamForbidden",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class DeleteOrganizationTeamNotfound extends Schema.TaggedError<DeleteOrganizationTeamNotfound>()(
  "DeleteOrganizationTeamNotfound",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class DeleteOrganizationTeamUnprocessableentity extends Schema.TaggedError<DeleteOrganizationTeamUnprocessableentity>()(
  "DeleteOrganizationTeamUnprocessableentity",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unprocessable_entity" },
).pipe(Category.withBadRequestError) {}

export class DeleteOrganizationTeamInternalservererror extends Schema.TaggedError<DeleteOrganizationTeamInternalservererror>()(
  "DeleteOrganizationTeamInternalservererror",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Delete an organization team
 *
 * @param organization - The name of the organization
 * @param team - The slug of the team
 */
export const deleteOrganizationTeam = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeleteOrganizationTeamInput,
  outputSchema: DeleteOrganizationTeamOutput,
  errors: [DeleteOrganizationTeamBadrequest, DeleteOrganizationTeamUnauthorized, DeleteOrganizationTeamForbidden, DeleteOrganizationTeamNotfound, DeleteOrganizationTeamUnprocessableentity, DeleteOrganizationTeamInternalservererror],
}));
