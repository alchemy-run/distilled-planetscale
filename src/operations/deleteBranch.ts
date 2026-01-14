import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const DeleteBranchInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) =>
    `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}`,
  [ApiPathParams]: ["organization", "database", "branch"] as const,
});
export type DeleteBranchInput = typeof DeleteBranchInput.Type;

// Output Schema
export const DeleteBranchOutput = Schema.Void;
export type DeleteBranchOutput = typeof DeleteBranchOutput.Type;

// Error Schemas
export class DeleteBranchUnauthorized extends Schema.TaggedError<DeleteBranchUnauthorized>()(
  "DeleteBranchUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class DeleteBranchForbidden extends Schema.TaggedError<DeleteBranchForbidden>()(
  "DeleteBranchForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class DeleteBranchNotfound extends Schema.TaggedError<DeleteBranchNotfound>()(
  "DeleteBranchNotfound",
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
 * Delete a branch
 *
 * @param organization - The name of the organization the branch belongs to
 * @param database - The name of the database the branch belongs to
 * @param branch - The name of the branch
 */
export const deleteBranch = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeleteBranchInput,
  outputSchema: DeleteBranchOutput,
  errors: [DeleteBranchUnauthorized, DeleteBranchForbidden, DeleteBranchNotfound],
}));
