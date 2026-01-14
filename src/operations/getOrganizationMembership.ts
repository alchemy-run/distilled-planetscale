import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const GetOrganizationMembershipInput = Schema.Struct({
  organization: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; id: string }) => `/organizations/${input.organization}/members/${input.id}`,
  [ApiPathParams]: ["organization", "id"] as const,
});
export type GetOrganizationMembershipInput = typeof GetOrganizationMembershipInput.Type;

// Output Schema
export const GetOrganizationMembershipOutput = Schema.Struct({
  id: Schema.String,
  user: Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    name: Schema.optional(Schema.NullOr(Schema.String)),
    email: Schema.String,
    avatar_url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    two_factor_auth_configured: Schema.Boolean,
    default_organization: Schema.optional(Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      created_at: Schema.String,
      updated_at: Schema.String,
      deleted_at: Schema.String,
    })),
    sso: Schema.optional(Schema.Boolean),
    managed: Schema.optional(Schema.Boolean),
    directory_managed: Schema.optional(Schema.Boolean),
    email_verified: Schema.optional(Schema.Boolean),
  }),
  role: Schema.Literal("member", "admin"),
  created_at: Schema.String,
  updated_at: Schema.String,
});
export type GetOrganizationMembershipOutput = typeof GetOrganizationMembershipOutput.Type;

// Error Schemas
export class GetOrganizationMembershipUnauthorized extends Schema.TaggedError<GetOrganizationMembershipUnauthorized>()(
  "GetOrganizationMembershipUnauthorized",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class GetOrganizationMembershipForbidden extends Schema.TaggedError<GetOrganizationMembershipForbidden>()(
  "GetOrganizationMembershipForbidden",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class GetOrganizationMembershipNotfound extends Schema.TaggedError<GetOrganizationMembershipNotfound>()(
  "GetOrganizationMembershipNotfound",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class GetOrganizationMembershipInternalservererror extends Schema.TaggedError<GetOrganizationMembershipInternalservererror>()(
  "GetOrganizationMembershipInternalservererror",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Get an organization member
 *
 * @param organization - The name of the organization
 * @param id - The ID of the user
 */
export const getOrganizationMembership = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetOrganizationMembershipInput,
  outputSchema: GetOrganizationMembershipOutput,
  errors: [GetOrganizationMembershipUnauthorized, GetOrganizationMembershipForbidden, GetOrganizationMembershipNotfound, GetOrganizationMembershipInternalservererror],
}));
