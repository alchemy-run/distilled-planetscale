import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const ReassignRoleObjectsInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  id: Schema.String,
  successor: Schema.String,
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string; database: string; branch: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/roles/${input.id}/reassign`,
});
export type ReassignRoleObjectsInput = typeof ReassignRoleObjectsInput.Type;

// Output Schema
export const ReassignRoleObjectsOutput = Schema.Void;
export type ReassignRoleObjectsOutput = typeof ReassignRoleObjectsOutput.Type;

// Error Schemas
export class ReassignRoleObjectsUnauthorized extends Schema.TaggedError<ReassignRoleObjectsUnauthorized>()(
  "ReassignRoleObjectsUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ReassignRoleObjectsForbidden extends Schema.TaggedError<ReassignRoleObjectsForbidden>()(
  "ReassignRoleObjectsForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ReassignRoleObjectsNotfound extends Schema.TaggedError<ReassignRoleObjectsNotfound>()(
  "ReassignRoleObjectsNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Reassign objects owned by one role to another role
 *
 * @param organization - The name of the organization that owns this resource
 * @param database - The name of the database that owns this resource
 * @param branch - The name of the branch that owns this resource
 * @param id - The ID of the role
 * @param successor - The role to reassign ownership to
 */
export const reassignRoleObjects = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ReassignRoleObjectsInput,
  outputSchema: ReassignRoleObjectsOutput,
  errors: [ReassignRoleObjectsUnauthorized, ReassignRoleObjectsForbidden, ReassignRoleObjectsNotfound],
}));
