import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const RemoveOrganizationMemberInput = Schema.Struct({
  organization: Schema.String,
  id: Schema.String,
  delete_passwords: Schema.optional(Schema.Boolean),
  delete_service_tokens: Schema.optional(Schema.Boolean),
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; id: string }) => `/organizations/${input.organization}/members/${input.id}`,
  [ApiPathParams]: ["organization", "id"] as const,
});
export type RemoveOrganizationMemberInput = typeof RemoveOrganizationMemberInput.Type;

// Output Schema
export const RemoveOrganizationMemberOutput = Schema.Void;
export type RemoveOrganizationMemberOutput = typeof RemoveOrganizationMemberOutput.Type;

// Error Schemas
export class RemoveOrganizationMemberUnauthorized extends Schema.TaggedError<RemoveOrganizationMemberUnauthorized>()(
  "RemoveOrganizationMemberUnauthorized",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class RemoveOrganizationMemberForbidden extends Schema.TaggedError<RemoveOrganizationMemberForbidden>()(
  "RemoveOrganizationMemberForbidden",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class RemoveOrganizationMemberNotfound extends Schema.TaggedError<RemoveOrganizationMemberNotfound>()(
  "RemoveOrganizationMemberNotfound",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class RemoveOrganizationMemberInternalservererror extends Schema.TaggedError<RemoveOrganizationMemberInternalservererror>()(
  "RemoveOrganizationMemberInternalservererror",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Remove a member from an organization
 *
 * @param organization - The name of the organization
 * @param id - The ID of the user
 * @param delete_passwords - Whether to delete all passwords associated with the member. Only available when removing other members (not yourself).
 * @param delete_service_tokens - Whether to delete all service tokens associated with the member. Only available when removing other members (not yourself).
 */
export const removeOrganizationMember = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: RemoveOrganizationMemberInput,
  outputSchema: RemoveOrganizationMemberOutput,
  errors: [RemoveOrganizationMemberUnauthorized, RemoveOrganizationMemberForbidden, RemoveOrganizationMemberNotfound, RemoveOrganizationMemberInternalservererror],
}));
