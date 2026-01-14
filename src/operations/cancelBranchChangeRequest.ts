import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const CancelBranchChangeRequestInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) =>
    `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/resizes`,
  [ApiPathParams]: ["organization", "database", "branch"] as const,
});
export type CancelBranchChangeRequestInput = typeof CancelBranchChangeRequestInput.Type;

// Output Schema
export const CancelBranchChangeRequestOutput = Schema.Void;
export type CancelBranchChangeRequestOutput = typeof CancelBranchChangeRequestOutput.Type;

// Error Schemas
export class CancelBranchChangeRequestUnauthorized extends Schema.TaggedError<CancelBranchChangeRequestUnauthorized>()(
  "CancelBranchChangeRequestUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class CancelBranchChangeRequestForbidden extends Schema.TaggedError<CancelBranchChangeRequestForbidden>()(
  "CancelBranchChangeRequestForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class CancelBranchChangeRequestNotfound extends Schema.TaggedError<CancelBranchChangeRequestNotfound>()(
  "CancelBranchChangeRequestNotfound",
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
 * Cancel a change request
 *
 * @param organization - The name of the organization that owns this resource
 * @param database - The name of the database that owns this resource
 * @param branch - The name of the branch that owns this resource
 */
export const cancelBranchChangeRequest = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CancelBranchChangeRequestInput,
  outputSchema: CancelBranchChangeRequestOutput,
  errors: [
    CancelBranchChangeRequestUnauthorized,
    CancelBranchChangeRequestForbidden,
    CancelBranchChangeRequestNotfound,
  ],
}));
