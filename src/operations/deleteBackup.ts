import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const DeleteBackupInput = Schema.Struct({
  id: Schema.String,
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { id: string; organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/backups/${input.id}`,
});
export type DeleteBackupInput = typeof DeleteBackupInput.Type;

// Output Schema
export const DeleteBackupOutput = Schema.Void;
export type DeleteBackupOutput = typeof DeleteBackupOutput.Type;

// Error Schemas
export class DeleteBackupUnauthorized extends Schema.TaggedError<DeleteBackupUnauthorized>()(
  "DeleteBackupUnauthorized",
  {
    id: Schema.String,
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class DeleteBackupForbidden extends Schema.TaggedError<DeleteBackupForbidden>()(
  "DeleteBackupForbidden",
  {
    id: Schema.String,
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class DeleteBackupNotfound extends Schema.TaggedError<DeleteBackupNotfound>()(
  "DeleteBackupNotfound",
  {
    id: Schema.String,
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const deleteBackup = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeleteBackupInput,
  outputSchema: DeleteBackupOutput,
  errors: [DeleteBackupUnauthorized, DeleteBackupForbidden, DeleteBackupNotfound],
}));
