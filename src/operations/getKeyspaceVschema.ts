import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const GetKeyspaceVschemaInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  keyspace: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; branch: string; keyspace: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/keyspaces/${input.keyspace}/vschema`,
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
export const getKeyspaceVschema = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetKeyspaceVschemaInput,
  outputSchema: GetKeyspaceVschemaOutput,
  errors: [GetKeyspaceVschemaUnauthorized, GetKeyspaceVschemaForbidden, GetKeyspaceVschemaNotfound],
}));
