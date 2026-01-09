import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const CancelBranchChangeRequestInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/resizes`,
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
export const cancelBranchChangeRequest = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CancelBranchChangeRequestInput,
  outputSchema: CancelBranchChangeRequestOutput,
  errors: [CancelBranchChangeRequestUnauthorized, CancelBranchChangeRequestForbidden, CancelBranchChangeRequestNotfound],
}));
