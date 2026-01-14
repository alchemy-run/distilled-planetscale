import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

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
).pipe(Category.withAuthError) {}

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
).pipe(Category.withAuthError) {}

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
).pipe(Category.withNotFoundError) {}

export class GetKeyspaceVschemaInternalservererror extends Schema.TaggedError<GetKeyspaceVschemaInternalservererror>()(
  "GetKeyspaceVschemaInternalservererror",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

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
  errors: [GetKeyspaceVschemaUnauthorized, GetKeyspaceVschemaForbidden, GetKeyspaceVschemaNotfound, GetKeyspaceVschemaInternalservererror],
}));
