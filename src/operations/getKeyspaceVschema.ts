import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const GetKeyspaceVschemaInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  keyspace: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; branch: string; keyspace: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/keyspaces/${input.keyspace}/vschema`,
  [ApiPathParams]: ["organization", "database", "branch", "keyspace"] as const,
});
export type GetKeyspaceVschemaInput = typeof GetKeyspaceVschemaInput.Type;

// Output Schema
export const GetKeyspaceVschemaOutput = Schema.Struct({
  raw: Schema.String,
});
export type GetKeyspaceVschemaOutput = typeof GetKeyspaceVschemaOutput.Type;

// Error Schemas
export class GetKeyspaceVschemaUnauthorized extends Schema.TaggedError<GetKeyspaceVschemaUnauthorized>()(
  "GetKeyspaceVschemaUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class GetKeyspaceVschemaForbidden extends Schema.TaggedError<GetKeyspaceVschemaForbidden>()(
  "GetKeyspaceVschemaForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetKeyspaceVschemaNotfound extends Schema.TaggedError<GetKeyspaceVschemaNotfound>()(
  "GetKeyspaceVschemaNotfound",
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
 * Get the VSchema for the keyspace
 *
 * @param organization - The name of the organization the branch belongs to
 * @param database - The name of the database the branch belongs to
 * @param branch - The name of the branch
 * @param keyspace - The name of the keyspace
 */
export const getKeyspaceVschema = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetKeyspaceVschemaInput,
  outputSchema: GetKeyspaceVschemaOutput,
  errors: [GetKeyspaceVschemaUnauthorized, GetKeyspaceVschemaForbidden, GetKeyspaceVschemaNotfound],
}));
