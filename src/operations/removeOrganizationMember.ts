import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const RemoveOrganizationMemberInput = Schema.Struct({
  organization: Schema.String,
  id: Schema.String,
  delete_passwords: Schema.optional(Schema.Boolean),
  delete_service_tokens: Schema.optional(Schema.Boolean),
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; id: string }) => `/organizations/${input.organization}/members/${input.id}`,
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
) {}

export class RemoveOrganizationMemberForbidden extends Schema.TaggedError<RemoveOrganizationMemberForbidden>()(
  "RemoveOrganizationMemberForbidden",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class RemoveOrganizationMemberNotfound extends Schema.TaggedError<RemoveOrganizationMemberNotfound>()(
  "RemoveOrganizationMemberNotfound",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const removeOrganizationMember = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: RemoveOrganizationMemberInput,
  outputSchema: RemoveOrganizationMemberOutput,
  errors: [RemoveOrganizationMemberUnauthorized, RemoveOrganizationMemberForbidden, RemoveOrganizationMemberNotfound],
}));
