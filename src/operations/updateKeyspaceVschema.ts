import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const UpdateKeyspaceVschemaInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  keyspace: Schema.String,
  vschema: Schema.String,
}).annotations({
  [ApiMethod]: "PATCH",
  [ApiPath]: (input: {
    organization: string;
    database: string;
    branch: string;
    keyspace: string;
  }) =>
    `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/keyspaces/${input.keyspace}/vschema`,
  [ApiPathParams]: ["organization", "database", "branch", "keyspace"] as const,
});
export type UpdateKeyspaceVschemaInput = typeof UpdateKeyspaceVschemaInput.Type;

// Output Schema
export const UpdateKeyspaceVschemaOutput = Schema.Struct({
  raw: Schema.String,
});
export type UpdateKeyspaceVschemaOutput = typeof UpdateKeyspaceVschemaOutput.Type;

// Error Schemas
export class UpdateKeyspaceVschemaUnauthorized extends Schema.TaggedError<UpdateKeyspaceVschemaUnauthorized>()(
  "UpdateKeyspaceVschemaUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class UpdateKeyspaceVschemaForbidden extends Schema.TaggedError<UpdateKeyspaceVschemaForbidden>()(
  "UpdateKeyspaceVschemaForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class UpdateKeyspaceVschemaNotfound extends Schema.TaggedError<UpdateKeyspaceVschemaNotfound>()(
  "UpdateKeyspaceVschemaNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

export class UpdateKeyspaceVschemaUnprocessableentity extends Schema.TaggedError<UpdateKeyspaceVschemaUnprocessableentity>()(
  "UpdateKeyspaceVschemaUnprocessableentity",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unprocessable_entity" },
) {}

// The operation
/**
 * Update the VSchema for the keyspace
 *
 * @param organization - The name of the organization the branch belongs to
 * @param database - The name of the database the branch belongs to
 * @param branch - The name of the branch
 * @param keyspace - The name of the keyspace
 * @param vschema - The new VSchema for the keyspace
 */
export const updateKeyspaceVschema = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateKeyspaceVschemaInput,
  outputSchema: UpdateKeyspaceVschemaOutput,
  errors: [
    UpdateKeyspaceVschemaUnauthorized,
    UpdateKeyspaceVschemaForbidden,
    UpdateKeyspaceVschemaNotfound,
    UpdateKeyspaceVschemaUnprocessableentity,
  ],
}));
