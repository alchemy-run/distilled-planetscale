import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

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
  [ApiPathParams]: ["organization", "database", "branch"] as const,
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
/**
 * Get a branch schema
 *
 * @param organization - The name of the organization the branch belongs to
 * @param database - The name of the database the branch belongs to
 * @param branch - The name of the branch
 * @param keyspace - Return the schema for a single Vitess keyspace
 * @param namespace - Return the schema for a PostgreSQL catalog namespace in `<database>.<schema>` format (e.g. public.schema1)
 */
export const getBranchSchema = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetBranchSchemaInput,
  outputSchema: GetBranchSchemaOutput,
  errors: [GetBranchSchemaUnauthorized, GetBranchSchemaForbidden, GetBranchSchemaNotfound],
}));
