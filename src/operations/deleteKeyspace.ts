import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const DeleteKeyspaceInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  keyspace: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; database: string; branch: string; keyspace: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/keyspaces/${input.keyspace}`,
  [ApiPathParams]: ["organization", "database", "branch", "keyspace"] as const,
});
export type DeleteKeyspaceInput = typeof DeleteKeyspaceInput.Type;

// Output Schema
export const DeleteKeyspaceOutput = Schema.Void;
export type DeleteKeyspaceOutput = typeof DeleteKeyspaceOutput.Type;

// Error Schemas
export class DeleteKeyspaceUnauthorized extends Schema.TaggedError<DeleteKeyspaceUnauthorized>()(
  "DeleteKeyspaceUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class DeleteKeyspaceForbidden extends Schema.TaggedError<DeleteKeyspaceForbidden>()(
  "DeleteKeyspaceForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class DeleteKeyspaceNotfound extends Schema.TaggedError<DeleteKeyspaceNotfound>()(
  "DeleteKeyspaceNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Delete a keyspace
 *
 * @param organization - The name of the organization the branch belongs to
 * @param database - The name of the database the branch belongs to
 * @param branch - The name of the branch
 * @param keyspace - The name of the keyspace
 */
export const deleteKeyspace = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeleteKeyspaceInput,
  outputSchema: DeleteKeyspaceOutput,
  errors: [DeleteKeyspaceUnauthorized, DeleteKeyspaceForbidden, DeleteKeyspaceNotfound],
}));
