import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const CreateQueryPatternsReportInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/query-patterns`,
  [ApiPathParams]: ["organization", "database", "branch"] as const,
});
export type CreateQueryPatternsReportInput = typeof CreateQueryPatternsReportInput.Type;

// Output Schema
export const CreateQueryPatternsReportOutput = Schema.Struct({
  id: Schema.String,
  state: Schema.Literal("pending", "completed", "failed"),
  created_at: Schema.String,
  finished_at: Schema.String,
  url: Schema.String,
  download_url: Schema.String,
  actor: Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    avatar_url: Schema.String,
  }),
});
export type CreateQueryPatternsReportOutput = typeof CreateQueryPatternsReportOutput.Type;

// Error Schemas
export class CreateQueryPatternsReportUnauthorized extends Schema.TaggedError<CreateQueryPatternsReportUnauthorized>()(
  "CreateQueryPatternsReportUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class CreateQueryPatternsReportForbidden extends Schema.TaggedError<CreateQueryPatternsReportForbidden>()(
  "CreateQueryPatternsReportForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class CreateQueryPatternsReportNotfound extends Schema.TaggedError<CreateQueryPatternsReportNotfound>()(
  "CreateQueryPatternsReportNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class CreateQueryPatternsReportInternalservererror extends Schema.TaggedError<CreateQueryPatternsReportInternalservererror>()(
  "CreateQueryPatternsReportInternalservererror",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Create a new query patterns report
 *
 * @param organization - The name of the organization the branch belongs to
 * @param database - The name of the database the branch belongs to
 * @param branch - The name of the branch
 */
export const createQueryPatternsReport = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateQueryPatternsReportInput,
  outputSchema: CreateQueryPatternsReportOutput,
  errors: [CreateQueryPatternsReportUnauthorized, CreateQueryPatternsReportForbidden, CreateQueryPatternsReportNotfound, CreateQueryPatternsReportInternalservererror],
}));
