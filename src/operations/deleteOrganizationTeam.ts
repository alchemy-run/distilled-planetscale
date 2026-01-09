import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const DeleteOrganizationTeamInput = Schema.Struct({
  organization: Schema.String,
  team: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; team: string }) => `/organizations/${input.organization}/teams/${input.team}`,
});
export type DeleteOrganizationTeamInput = typeof DeleteOrganizationTeamInput.Type;

// Output Schema
export const DeleteOrganizationTeamOutput = Schema.Void;
export type DeleteOrganizationTeamOutput = typeof DeleteOrganizationTeamOutput.Type;

// Error Schemas
export class DeleteOrganizationTeamUnauthorized extends Schema.TaggedError<DeleteOrganizationTeamUnauthorized>()(
  "DeleteOrganizationTeamUnauthorized",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class DeleteOrganizationTeamForbidden extends Schema.TaggedError<DeleteOrganizationTeamForbidden>()(
  "DeleteOrganizationTeamForbidden",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class DeleteOrganizationTeamNotfound extends Schema.TaggedError<DeleteOrganizationTeamNotfound>()(
  "DeleteOrganizationTeamNotfound",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

export class DeleteOrganizationTeamUnprocessableentity extends Schema.TaggedError<DeleteOrganizationTeamUnprocessableentity>()(
  "DeleteOrganizationTeamUnprocessableentity",
  {
    organization: Schema.String,
    team: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unprocessable_entity" },
) {}

// The operation
export const deleteOrganizationTeam = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeleteOrganizationTeamInput,
  outputSchema: DeleteOrganizationTeamOutput,
  errors: [DeleteOrganizationTeamUnauthorized, DeleteOrganizationTeamForbidden, DeleteOrganizationTeamNotfound, DeleteOrganizationTeamUnprocessableentity],
}));
