import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const CancelBouncerResizeRequestInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  bouncer: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; database: string; branch: string; bouncer: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/bouncers/${input.bouncer}/resizes`,
  [ApiPathParams]: ["organization", "database", "branch", "bouncer"] as const,
});
export type CancelBouncerResizeRequestInput = typeof CancelBouncerResizeRequestInput.Type;

// Output Schema
export const CancelBouncerResizeRequestOutput = Schema.Void;
export type CancelBouncerResizeRequestOutput = typeof CancelBouncerResizeRequestOutput.Type;

// Error Schemas
export class CancelBouncerResizeRequestUnauthorized extends Schema.TaggedError<CancelBouncerResizeRequestUnauthorized>()(
  "CancelBouncerResizeRequestUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    bouncer: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class CancelBouncerResizeRequestForbidden extends Schema.TaggedError<CancelBouncerResizeRequestForbidden>()(
  "CancelBouncerResizeRequestForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    bouncer: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class CancelBouncerResizeRequestNotfound extends Schema.TaggedError<CancelBouncerResizeRequestNotfound>()(
  "CancelBouncerResizeRequestNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    bouncer: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class CancelBouncerResizeRequestInternalservererror extends Schema.TaggedError<CancelBouncerResizeRequestInternalservererror>()(
  "CancelBouncerResizeRequestInternalservererror",
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
 * Cancel a resize request
 *
 * @param organization - The name of the organization that owns this resource
 * @param database - The name of the database that owns this resource
 * @param branch - The name of the branch that owns this resource
 * @param bouncer - The name of the bouncer
 */
export const cancelBouncerResizeRequest = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CancelBouncerResizeRequestInput,
  outputSchema: CancelBouncerResizeRequestOutput,
  errors: [CancelBouncerResizeRequestUnauthorized, CancelBouncerResizeRequestForbidden, CancelBouncerResizeRequestNotfound, CancelBouncerResizeRequestInternalservererror],
}));
