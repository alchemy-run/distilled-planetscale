import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const DeleteRoleInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  id: Schema.String,
  successor: Schema.optional(Schema.String),
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; database: string; branch: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/roles/${input.id}`,
  [ApiPathParams]: ["organization", "database", "branch", "id"] as const,
});
export type DeleteRoleInput = typeof DeleteRoleInput.Type;

// Output Schema
export const DeleteRoleOutput = Schema.Void;
export type DeleteRoleOutput = typeof DeleteRoleOutput.Type;

// Error Schemas
export class DeleteRoleUnauthorized extends Schema.TaggedError<DeleteRoleUnauthorized>()(
  "DeleteRoleUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class DeleteRoleForbidden extends Schema.TaggedError<DeleteRoleForbidden>()(
  "DeleteRoleForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class DeleteRoleNotfound extends Schema.TaggedError<DeleteRoleNotfound>()(
  "DeleteRoleNotfound",
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
 * Delete role credentials
 *
 * @param organization - The name of the organization that owns this resource
 * @param database - The name of the database that owns this resource
 * @param branch - The name of the branch that owns this resource
 * @param id - The ID of the role
 * @param successor - The optional role to reassign ownership to before dropping
 */
export const deleteRole = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeleteRoleInput,
  outputSchema: DeleteRoleOutput,
  errors: [DeleteRoleUnauthorized, DeleteRoleForbidden, DeleteRoleNotfound],
}));
