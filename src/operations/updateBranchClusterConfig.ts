import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const UpdateBranchClusterConfigInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  cluster_size: Schema.String,
}).annotations({
  [ApiMethod]: "PATCH",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/cluster`,
});
export type UpdateBranchClusterConfigInput = typeof UpdateBranchClusterConfigInput.Type;

// Output Schema
export const UpdateBranchClusterConfigOutput = Schema.Void;
export type UpdateBranchClusterConfigOutput = typeof UpdateBranchClusterConfigOutput.Type;

// Error Schemas
export class UpdateBranchClusterConfigUnauthorized extends Schema.TaggedError<UpdateBranchClusterConfigUnauthorized>()(
  "UpdateBranchClusterConfigUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class UpdateBranchClusterConfigForbidden extends Schema.TaggedError<UpdateBranchClusterConfigForbidden>()(
  "UpdateBranchClusterConfigForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class UpdateBranchClusterConfigNotfound extends Schema.TaggedError<UpdateBranchClusterConfigNotfound>()(
  "UpdateBranchClusterConfigNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const updateBranchClusterConfig = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateBranchClusterConfigInput,
  outputSchema: UpdateBranchClusterConfigOutput,
  errors: [UpdateBranchClusterConfigUnauthorized, UpdateBranchClusterConfigForbidden, UpdateBranchClusterConfigNotfound],
}));
