import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const GetBranchSchemaInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  keyspace: Schema.optional(Schema.String),
  namespace: Schema.optional(Schema.String),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/schema`,
});
export type GetBranchSchemaInput = typeof GetBranchSchemaInput.Type;

// Output Schema
export const GetBranchSchemaOutput = Schema.Struct({
  data: Schema.Array(Schema.Struct({
    name: Schema.String,
    html: Schema.String,
    raw: Schema.String,
  })),
});
export type GetBranchSchemaOutput = typeof GetBranchSchemaOutput.Type;

// Error Schemas
export class GetBranchSchemaUnauthorized extends Schema.TaggedError<GetBranchSchemaUnauthorized>()(
  "GetBranchSchemaUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class GetBranchSchemaForbidden extends Schema.TaggedError<GetBranchSchemaForbidden>()(
  "GetBranchSchemaForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetBranchSchemaNotfound extends Schema.TaggedError<GetBranchSchemaNotfound>()(
  "GetBranchSchemaNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const getBranchSchema = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetBranchSchemaInput,
  outputSchema: GetBranchSchemaOutput,
  errors: [GetBranchSchemaUnauthorized, GetBranchSchemaForbidden, GetBranchSchemaNotfound],
}));
