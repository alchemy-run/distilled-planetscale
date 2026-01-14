import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const DeletePasswordInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; database: string; branch: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/passwords/${input.id}`,
  [ApiPathParams]: ["organization", "database", "branch", "id"] as const,
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
).pipe(Category.withAuthError) {}

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
).pipe(Category.withAuthError) {}

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
).pipe(Category.withNotFoundError) {}

export class DeletePasswordInternalservererror extends Schema.TaggedError<DeletePasswordInternalservererror>()(
  "DeletePasswordInternalservererror",
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
 * Delete a password
 *
 * @param organization - The name of the organization the password belongs to
 * @param database - The name of the database the password belongs to
 * @param branch - The name of the branch the password belongs to
 * @param id - The ID of the password
 */
export const deletePassword = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeletePasswordInput,
  outputSchema: DeletePasswordOutput,
  errors: [DeletePasswordUnauthorized, DeletePasswordForbidden, DeletePasswordNotfound, DeletePasswordInternalservererror],
}));
