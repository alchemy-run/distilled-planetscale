import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const ListGeneratedQueryPatternsReportsInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/query-patterns`,
  [ApiPathParams]: ["organization", "database", "branch"] as const,
});
export type ListGeneratedQueryPatternsReportsInput = typeof ListGeneratedQueryPatternsReportsInput.Type;

// Output Schema
export const ListGeneratedQueryPatternsReportsOutput = Schema.Struct({
  has_next: Schema.Boolean,
  has_prev: Schema.Boolean,
  cursor_start: Schema.String,
  cursor_end: Schema.String,
  data: Schema.Array(Schema.Struct({
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
  })),
});
export type ListGeneratedQueryPatternsReportsOutput = typeof ListGeneratedQueryPatternsReportsOutput.Type;

// Error Schemas
export class ListGeneratedQueryPatternsReportsUnauthorized extends Schema.TaggedError<ListGeneratedQueryPatternsReportsUnauthorized>()(
  "ListGeneratedQueryPatternsReportsUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListGeneratedQueryPatternsReportsForbidden extends Schema.TaggedError<ListGeneratedQueryPatternsReportsForbidden>()(
  "ListGeneratedQueryPatternsReportsForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListGeneratedQueryPatternsReportsNotfound extends Schema.TaggedError<ListGeneratedQueryPatternsReportsNotfound>()(
  "ListGeneratedQueryPatternsReportsNotfound",
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
 * List generated query patterns reports
 *
 * @param organization - The name of the organization the branch belongs to
 * @param database - The name of the database the branch belongs to
 * @param branch - The name of the branch
 */
export const listGeneratedQueryPatternsReports = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListGeneratedQueryPatternsReportsInput,
  outputSchema: ListGeneratedQueryPatternsReportsOutput,
  errors: [ListGeneratedQueryPatternsReportsUnauthorized, ListGeneratedQueryPatternsReportsForbidden, ListGeneratedQueryPatternsReportsNotfound],
}));
