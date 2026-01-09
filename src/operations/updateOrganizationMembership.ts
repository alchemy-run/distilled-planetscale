import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const UpdateOrganizationMembershipInput = Schema.Struct({
  organization: Schema.String,
  id: Schema.String,
  role: Schema.String,
}).annotations({
  [ApiMethod]: "PATCH",
  [ApiPath]: (input: { organization: string; id: string }) => `/organizations/${input.organization}/members/${input.id}`,
});
export type UpdateOrganizationMembershipInput = typeof UpdateOrganizationMembershipInput.Type;

// Output Schema
export const UpdateOrganizationMembershipOutput = Schema.Struct({
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
export type UpdateOrganizationMembershipOutput = typeof UpdateOrganizationMembershipOutput.Type;

// Error Schemas
export class UpdateOrganizationMembershipUnauthorized extends Schema.TaggedError<UpdateOrganizationMembershipUnauthorized>()(
  "UpdateOrganizationMembershipUnauthorized",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class UpdateOrganizationMembershipForbidden extends Schema.TaggedError<UpdateOrganizationMembershipForbidden>()(
  "UpdateOrganizationMembershipForbidden",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class UpdateOrganizationMembershipNotfound extends Schema.TaggedError<UpdateOrganizationMembershipNotfound>()(
  "UpdateOrganizationMembershipNotfound",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const updateOrganizationMembership = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateOrganizationMembershipInput,
  outputSchema: UpdateOrganizationMembershipOutput,
  errors: [UpdateOrganizationMembershipUnauthorized, UpdateOrganizationMembershipForbidden, UpdateOrganizationMembershipNotfound],
}));
