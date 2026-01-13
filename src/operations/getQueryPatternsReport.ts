import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const GetQueryPatternsReportInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; branch: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/query-patterns/${input.id}/download`,
  [ApiPathParams]: ["organization", "database", "branch", "id"] as const,
});
export type GetQueryPatternsReportInput = typeof GetQueryPatternsReportInput.Type;

// Output Schema
export const GetQueryPatternsReportOutput = Schema.Void;
export type GetQueryPatternsReportOutput = typeof GetQueryPatternsReportOutput.Type;

// Error Schemas
export class GetQueryPatternsReportUnauthorized extends Schema.TaggedError<GetQueryPatternsReportUnauthorized>()(
  "GetQueryPatternsReportUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class GetQueryPatternsReportForbidden extends Schema.TaggedError<GetQueryPatternsReportForbidden>()(
  "GetQueryPatternsReportForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetQueryPatternsReportNotfound extends Schema.TaggedError<GetQueryPatternsReportNotfound>()(
  "GetQueryPatternsReportNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Download a finished query patterns report
 *
 * @param organization - The name of the organization the branch belongs to
 * @param database - The name of the database the branch belongs to
 * @param branch - The name of the branch
 * @param id - The ID of the query patterns report
 */
export const getQueryPatternsReport = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetQueryPatternsReportInput,
  outputSchema: GetQueryPatternsReportOutput,
  errors: [GetQueryPatternsReportUnauthorized, GetQueryPatternsReportForbidden, GetQueryPatternsReportNotfound],
}));
