import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const LintBranchSchemaInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/schema/lint`,
  [ApiPathParams]: ["organization", "database", "branch"] as const,
});
export type LintBranchSchemaInput = typeof LintBranchSchemaInput.Type;

// Output Schema
export const LintBranchSchemaOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.NullOr(Schema.Number),
  next_page_url: Schema.NullOr(Schema.String),
  prev_page: Schema.NullOr(Schema.Number),
  prev_page_url: Schema.NullOr(Schema.String),
  data: Schema.Array(Schema.Struct({
    lint_error: Schema.String,
    subject_type: Schema.Literal("table", "vschema", "routing_rules"),
    keyspace_name: Schema.String,
    table_name: Schema.String,
    error_description: Schema.String,
    docs_url: Schema.String,
    column_name: Schema.String,
    foreign_key_column_names: Schema.Array(Schema.String),
    auto_increment_column_names: Schema.Array(Schema.String),
    charset_name: Schema.String,
    engine_name: Schema.String,
    vindex_name: Schema.String,
    json_path: Schema.String,
    check_constraint_name: Schema.String,
    enum_value: Schema.String,
    partitioning_type: Schema.String,
    partition_name: Schema.String,
  })),
});
export type LintBranchSchemaOutput = typeof LintBranchSchemaOutput.Type;

// Error Schemas
export class LintBranchSchemaUnauthorized extends Schema.TaggedError<LintBranchSchemaUnauthorized>()(
  "LintBranchSchemaUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class LintBranchSchemaForbidden extends Schema.TaggedError<LintBranchSchemaForbidden>()(
  "LintBranchSchemaForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class LintBranchSchemaNotfound extends Schema.TaggedError<LintBranchSchemaNotfound>()(
  "LintBranchSchemaNotfound",
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
 * Lint a branch schema
 *
 * @param organization - The name of the organization the branch belongs to
 * @param database - The name of the database the branch belongs to
 * @param branch - The name of the branch
 * @param page - If provided, specifies the page offset of returned results
 * @param per_page - If provided, specifies the number of returned results
 */
export const lintBranchSchema = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: LintBranchSchemaInput,
  outputSchema: LintBranchSchemaOutput,
  errors: [LintBranchSchemaUnauthorized, LintBranchSchemaForbidden, LintBranchSchemaNotfound],
}));
