import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const GetQueryPatternsReportStatusInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; branch: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/query-patterns/${input.id}`,
});
export type GetQueryPatternsReportStatusInput = typeof GetQueryPatternsReportStatusInput.Type;

// Output Schema
export const GetQueryPatternsReportStatusOutput = Schema.Struct({
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
export type GetQueryPatternsReportStatusOutput = typeof GetQueryPatternsReportStatusOutput.Type;

// Error Schemas
export class GetQueryPatternsReportStatusUnauthorized extends Schema.TaggedError<GetQueryPatternsReportStatusUnauthorized>()(
  "GetQueryPatternsReportStatusUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class GetQueryPatternsReportStatusForbidden extends Schema.TaggedError<GetQueryPatternsReportStatusForbidden>()(
  "GetQueryPatternsReportStatusForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetQueryPatternsReportStatusNotfound extends Schema.TaggedError<GetQueryPatternsReportStatusNotfound>()(
  "GetQueryPatternsReportStatusNotfound",
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
export const getQueryPatternsReportStatus = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetQueryPatternsReportStatusInput,
  outputSchema: GetQueryPatternsReportStatusOutput,
  errors: [GetQueryPatternsReportStatusUnauthorized, GetQueryPatternsReportStatusForbidden, GetQueryPatternsReportStatusNotfound],
}));
