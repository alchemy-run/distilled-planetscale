import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const GetOrganizationMembershipInput = Schema.Struct({
  organization: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; id: string }) => `/organizations/${input.organization}/members/${input.id}`,
});
export type GetOrganizationMembershipInput = typeof GetOrganizationMembershipInput.Type;

// Output Schema
export const GetOrganizationMembershipOutput = Schema.Struct({
  id: Schema.String,
  user: Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    name: Schema.String,
    email: Schema.String,
    avatar_url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    two_factor_auth_configured: Schema.Boolean,
    default_organization: Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      created_at: Schema.String,
      updated_at: Schema.String,
      deleted_at: Schema.String,
    }),
    sso: Schema.Boolean,
    managed: Schema.Boolean,
    directory_managed: Schema.Boolean,
    email_verified: Schema.Boolean,
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
) {}

export class GetOrganizationMembershipForbidden extends Schema.TaggedError<GetOrganizationMembershipForbidden>()(
  "GetOrganizationMembershipForbidden",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetOrganizationMembershipNotfound extends Schema.TaggedError<GetOrganizationMembershipNotfound>()(
  "GetOrganizationMembershipNotfound",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const getOrganizationMembership = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetOrganizationMembershipInput,
  outputSchema: GetOrganizationMembershipOutput,
  errors: [GetOrganizationMembershipUnauthorized, GetOrganizationMembershipForbidden, GetOrganizationMembershipNotfound],
}));
