import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const DeleteBouncerInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  bouncer: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; database: string; branch: string; bouncer: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/bouncers/${input.bouncer}`,
  [ApiPathParams]: ["organization", "database", "branch", "bouncer"] as const,
});
export type DeleteBouncerInput = typeof DeleteBouncerInput.Type;

// Output Schema
export const DeleteBouncerOutput = Schema.Void;
export type DeleteBouncerOutput = typeof DeleteBouncerOutput.Type;

// Error Schemas
export class DeleteBouncerUnauthorized extends Schema.TaggedError<DeleteBouncerUnauthorized>()(
  "DeleteBouncerUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    bouncer: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class DeleteBouncerForbidden extends Schema.TaggedError<DeleteBouncerForbidden>()(
  "DeleteBouncerForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    bouncer: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class DeleteBouncerNotfound extends Schema.TaggedError<DeleteBouncerNotfound>()(
  "DeleteBouncerNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    bouncer: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class DeleteBouncerInternalservererror extends Schema.TaggedError<DeleteBouncerInternalservererror>()(
  "DeleteBouncerInternalservererror",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    bouncer: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Delete a bouncer
 *
 * @param organization - The name of the organization that owns this resource
 * @param database - The name of the database that owns this resource
 * @param branch - The name of the branch that owns this resource
 * @param bouncer - The name of the bouncer
 */
export const deleteBouncer = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeleteBouncerInput,
  outputSchema: DeleteBouncerOutput,
  errors: [DeleteBouncerUnauthorized, DeleteBouncerForbidden, DeleteBouncerNotfound, DeleteBouncerInternalservererror],
}));
