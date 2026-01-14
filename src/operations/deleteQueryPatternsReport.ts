import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const DeleteQueryPatternsReportInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; database: string; branch: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/query-patterns/${input.id}`,
  [ApiPathParams]: ["organization", "database", "branch", "id"] as const,
});
export type DeleteQueryPatternsReportInput = typeof DeleteQueryPatternsReportInput.Type;

// Output Schema
export const DeleteQueryPatternsReportOutput = Schema.Void;
export type DeleteQueryPatternsReportOutput = typeof DeleteQueryPatternsReportOutput.Type;

// Error Schemas
export class DeleteQueryPatternsReportUnauthorized extends Schema.TaggedError<DeleteQueryPatternsReportUnauthorized>()(
  "DeleteQueryPatternsReportUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class DeleteQueryPatternsReportForbidden extends Schema.TaggedError<DeleteQueryPatternsReportForbidden>()(
  "DeleteQueryPatternsReportForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class DeleteQueryPatternsReportNotfound extends Schema.TaggedError<DeleteQueryPatternsReportNotfound>()(
  "DeleteQueryPatternsReportNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class DeleteQueryPatternsReportInternalservererror extends Schema.TaggedError<DeleteQueryPatternsReportInternalservererror>()(
  "DeleteQueryPatternsReportInternalservererror",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Delete a query patterns report
 *
 * @param organization - The name of the organization the branch belongs to
 * @param database - The name of the database the branch belongs to
 * @param branch - The name of the branch
 * @param id - The ID of the query patterns report
 */
export const deleteQueryPatternsReport = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeleteQueryPatternsReportInput,
  outputSchema: DeleteQueryPatternsReportOutput,
  errors: [DeleteQueryPatternsReportUnauthorized, DeleteQueryPatternsReportForbidden, DeleteQueryPatternsReportNotfound, DeleteQueryPatternsReportInternalservererror],
}));
