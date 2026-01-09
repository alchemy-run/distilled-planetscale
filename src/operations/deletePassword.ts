import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const DeletePasswordInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; database: string; branch: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/passwords/${input.id}`,
});
export type DeletePasswordInput = typeof DeletePasswordInput.Type;

// Output Schema
export const DeletePasswordOutput = Schema.Void;
export type DeletePasswordOutput = typeof DeletePasswordOutput.Type;

// Error Schemas
export class DeletePasswordUnauthorized extends Schema.TaggedError<DeletePasswordUnauthorized>()(
  "DeletePasswordUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class DeletePasswordForbidden extends Schema.TaggedError<DeletePasswordForbidden>()(
  "DeletePasswordForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class DeletePasswordNotfound extends Schema.TaggedError<DeletePasswordNotfound>()(
  "DeletePasswordNotfound",
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
export const deletePassword = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeletePasswordInput,
  outputSchema: DeletePasswordOutput,
  errors: [DeletePasswordUnauthorized, DeletePasswordForbidden, DeletePasswordNotfound],
}));
